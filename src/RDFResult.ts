import { Schema, PropertyValues, PropertyList } from "./RDF";
import { QueryBuilder } from "./QueryBuilder";
import { RDFRequest } from "./RDFRequest";
import { defaultJsonLd, LdConverter } from "./LdConverter";
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
            this.result = LdConverter.removeCompactUri(this.result)
            LdConverter.expandID(this.result, this.schema.prefixes);
            this.valueToArray();
            LdConverter.expandPropertyValues(this.result, this.schema);
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
            if (propDefinition.ref) {
                let identifierSplit = value.split("/");
                let identifier = identifierSplit[identifierSplit.length - 1];
                this.result[propertyName] = (await propDefinition.ref.findByIdentifier(identifier)).result;
                return this;
            }
        }
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