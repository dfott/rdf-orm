import { Schema, PropertyValues, PropertyList } from "./RDF";
import { QueryBuilder } from "./QueryBuilder";
import { RDFRequest } from "./RDFRequest";
import { defaultJsonLd } from "./LdConverter";
import { StringGenerator } from "./StringGenerator";

export interface JsonLD {
    "@graph"?: any[]
    // [JsonLDResource | undefined];
    "@id"?: string;
    "@type"?: string;
    [propname: string]: any
    "@context"?: any
    // {
    //     [propname: string]: ContextObject | string,
    // };
    // [propname: string]: string
}

export interface JsonLDResource {
    "@id": string;
    "@type": string;
    [propname: string]: string;
}

export interface ContextObject {
    "@id": string;
    "@type"?: string;
}

/**
 * Every CRUD operation called on a model will return an object of type RDFResult. It contains the SparQL Query and the JSON-LD result.
 */
export class RDFResult {

    private builder: QueryBuilder;
    private updated = false;

    /**
     * The constructor updates the result to create an object, that is valid JSON-LD and is still intuitive to work with as a developer 
     * @param request - the request object used to communicate with a triplestore
     * @param schema - schema that provides the necessary information about the model
     * @param values - properties and their values for this resource. used if a new resource is created
     * @param query - sparql query used to create the result of this object
     * @param result - result of the query, usually in Json-LD
     */
    constructor(private request: RDFRequest, private schema: Schema, public values: PropertyValues, public query?: string, public result?: any) {
        this.builder = new QueryBuilder(this.schema, this.values);
        if (result) { 
            this.values = this.extractPropertiesFromJsonLD(result);
            this.result = this.removeCompactUri(this.result)
            this.valueToArray();
            this.expandPropertyValues(this.result);
            this.updated = true;
        } 
    }

    /**
     * Used to save the object in a triplestore. If the RDFResult was newly created, the specified values are safed in the triplestore.
     * If not, the values are updated.
     */
    public async save(): Promise<string> {
        if (!this.updated) {
            const insertQuery = this.builder.buildInsert();
            await this.request.update(insertQuery);
            return Promise.resolve(insertQuery);
        } else {
            return this.update();
        }
    }

    /**
     * Updates the tupels in the triplestore to contain the values of the result object.
     */
    private async update(): Promise<string> {
        const updateQuery = this.builder.buildUpdate(this.values);
        await this.request.update(updateQuery);
        return Promise.resolve(updateQuery);
    }

    private applyToObjects(result: any, callback: (obj: any) => void) {
        if (result["@graph"]) {
            result["@graph"].forEach((obj: any) => callback(obj))
        } else {
            callback(result);
        }
    }

    private valueToArray() {
        this.applyToObjects(this.result, (obj) => {
            Object.keys(obj).forEach((key: string) => {
                const propDefinition = StringGenerator.getProperty(this.schema.properties[key]); 
                if (propDefinition) {
                    if (Array.isArray(this.schema.properties[key])) {
                        if (!Array.isArray(obj[key])) {
                            obj[key] = [obj[key]];
                        }
                    }
                }
            })
        })
    }

    /**
     * Replaces the uri of the specified property with the object is inside the triplestore
     * @param propertyName 
     */
    public async populate(propertyName: string) {
        const propDefinition = StringGenerator.getProperty(this.schema.properties[propertyName]);
        if (!propDefinition) { throw Error(`Cannot populate property ${propertyName} as it does'nt exist on the defined type ${this.schema.resourceType}.`) }
        if (propDefinition.type !== "uri") { throw Error(`Cannot populate property ${propertyName} as values of this property are defined to be literals.`) } 
        const value = this.result[propertyName];
        if (!value) { throw Error("Cannot populate a field, that doesn't exist in the resulting object.") }
        if (Array.isArray(value)) {
            const requests: Promise<RDFResult>[] = [];
            value.forEach((val: string) => {
                if (propDefinition.ref) {
                    let identifierSplit = val.split("/");
                    let identifier = identifierSplit[identifierSplit.length - 1];
                    requests.push(propDefinition.ref.findByIdentifier(identifier));
                }
            })
            const populatedResult = await Promise.all(requests);

            this.result[propertyName] = populatedResult.map(populatedResult => populatedResult.result);

            return this;
        } else {

        }
    }

    /**
     * Removes all compact uris used for properties and replaces them with the normal property name. Exmaple: schema:age to age
     * @param jsonld - JSON-LD object, that is the result of a SparQL Query
     */
    private removeCompactUri(jsonld: JsonLD): JsonLD {
        if (jsonld["@graph"]) {
            const graph: any[] = [];
            jsonld["@graph"].forEach((ldResource: JsonLDResource) => {
                const ld = {};
                this.addKey(ld, ldResource);
                graph.push(ld);
            })
            jsonld["@graph"] = graph
            return jsonld
        } else {
            const ld: JsonLD = { "@context": jsonld["@context"] };
            this.addKey(ld, jsonld)
            return ld
        }
    }

    /**
     * Expands the URI of every property, that has an URI as a value. Used to remove Compact URIs
     * @param result - JSON-LD object, that is the result of a SparQL Query
     */
    private expandPropertyValues(result: any) {
        this.applyToObjects(result, (obj) => {
            Object.keys(this.schema.properties).forEach((propertyName: string) => {
                const propValue = obj[propertyName];
                if (propValue) {
                    const propDefinition = StringGenerator.getProperty(this.schema.properties[propertyName]);
                    if (propDefinition.type === "uri") {
                        if (Array.isArray(this.schema.properties[propertyName])) {
                            const values: string[] = [];
                            const propPrefix = propDefinition.prefix;
                            propValue.forEach((val: string) => {
                                values.push(val.replace(`${propPrefix}:`, this.schema.prefixes[propPrefix]));
                            })
                            obj[propertyName] = values;
                        } else {
                            const propPrefix = propDefinition.prefix;
                            obj[propertyName] = propValue.replace(`${propPrefix}:`, this.schema.prefixes[propPrefix]);
                        }
                    }
                }
            });
        })
    }

    /**
     * If available, expands the id and replaces it with a full uri. Example: schema:Person/Daniel to http://schema.org/Person/Daniel
     * @param id 
     */
    private expandID(id: string): string {
        const splitId = id.split(":");
        if (splitId.length === 2) {
            const schema = this.schema.prefixes[splitId[0]];
            if (schema) {
                return id.replace(`${splitId[0]}:`, schema);
            }
            return id;
        } else {
            return id;
        }
    }

    /**
     * 
     * @param newLD - new object, that will contain property names without their uri
     * @param oldLD - old object, that still contains compact uris
     */
    private addKey(newLD: JsonLD, oldLD: JsonLD) {
        Object.keys(oldLD).forEach((key: string) => {
            const splitKey = key.split(":");
            if (key === "@id") {
                if (oldLD["@id"]) {
                    newLD["@id"] = this.expandID(oldLD["@id"])
                }
            } else {
                if (splitKey.length === 2) {
                    newLD[splitKey[1]] = oldLD[key]
                } else {
                    newLD[key] = oldLD[key]
                }
            }
        })
    }

    private extractPropertiesFromJsonLD(defaultJson: defaultJsonLd) {
        const propertyValues = {} as PropertyValues;
        Object.keys(defaultJson).forEach((key: string) => {
            if (this.propertyExists(key, this.schema.properties)) {
                propertyValues[key] = defaultJson[key];
            } else if (this.propertyExists(key.split(":")[1], this.schema.properties)) {
                propertyValues[key.split(":")[1]] = defaultJson[key];
            } else if (key === "@id") {
                // -------------- TODO -----------------------------
                // make sure that this function can be applied to most of the use cases + write tests to confirm
                const id = defaultJson["@id"];
                const split = id.split("/");
                if (split.length >= 2) {
                    propertyValues.identifier = split[split.length - 1];
                //     const resourceSchema = this.schema.prefixes[split[0]];
                //     propertyValues.identifier = `${resourceSchema}${
                //         id.substr(id.indexOf(":") + 1)
                //     }`;
                }
            }
        })
        return propertyValues;
    } 

    private propertyExists(key: string, properties: PropertyList): boolean {
        return Object.keys(properties).indexOf(key) !== -1;
    }

}