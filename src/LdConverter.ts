import { Schema, PropertyList, PropertyValues, PrefixList } from "./RDF";
import { JsonLD, JsonLDResource } from "./RDFResult";
import { StringGenerator } from "./StringGenerator";
import { Context } from "./RDFResult";

export interface defaultJsonLd {
    "@id": string;
    "@type": string;
    "@context": any;
    [propertyName: string]: string;

}

interface defaultContext {
    [propertyName: string]: string;
}

export class LdConverter {

    /**
     * Takes a callback function and a jsonld result. If the jsonld contains multiple objects, they are stored in the @graph key.
     * The function is then called, using the single objects as the argument.
     * @param jsonld 
     * @param callback 
     */
    private static applyFunctionToResult(jsonld: JsonLD, callback: (result: JsonLD) => void) {
        if (jsonld["@graph"]) {
            jsonld["@graph"].forEach((res: JsonLD) => {
                callback(res);
            }) 
        } else {
            callback(jsonld);
        }
    }

    /**
     * Removes all compact uris used for properties and replaces them with the normal property name. Example: schema:age to age
     * @param jsonld - JSON-LD object, that is the result of a SparQL Query
     */
    public static removeCompactUri(jsonld: JsonLD): JsonLD {
        if (jsonld["@graph"]) {
            const graph: any[] = [];
            jsonld["@graph"].forEach((ldResource: JsonLDResource) => {
                const ld = {};
                this.readdProperties(ld, ldResource);
                graph.push(ld);
            })
            jsonld["@graph"] = graph
            return jsonld
        } else {
            const ld: JsonLD = { "@context": jsonld["@context"] };
            this.readdProperties(ld, jsonld)
            return ld
        }
    }

    /**
     * Takes a jsonld object, which is filled with properties that can contain compact uris and an empty object. It then removes every
     * compact uri if found and stores every property in the new jsonld object.
     * @param newLD - new object, that will contain property names without their uri
     * @param oldLD - old object, that still contains compact uris
     */
    private static readdProperties(newLD: JsonLD, oldLD: JsonLD) {
        Object.keys(oldLD).forEach((key: string) => {
            const splitKey = key.split(":");
            if (splitKey.length === 2) {
                newLD[splitKey[1]] = oldLD[key]
            } else {
                newLD[key] = oldLD[key]
            }
        })
    }

    /**
     * If available, expands the id and replaces it with a full uri. Example: schema:Person/Daniel to http://schema.org/Person/Daniel
     * @param id 
     */
    public static expandID(jsonld: JsonLD, prefixes: PrefixList) {
        this.applyFunctionToResult(jsonld, (res: JsonLD) => {
            const id = res["@id"];
            if (id) {
                const splitId = id.split(":");
                if (splitId.length === 2) {
                    const schema = prefixes[splitId[0]];
                    if (schema) {
                        // return id.replace(`${splitId[0]}:`, schema);
                        res["@id"] = id.replace(`${splitId[0]}:`, schema);
                    }
                    // return id;
                }
            }
        })
    }

    /**
     * Expands the URI of every property, that has an URI as a value. Used to remove Compact URIs
     * TODO: CLEANUP THIS FUNCTION
     * @param result - JSON-LD object, that is the result of a SparQL Query
     */
    public static expandPropertyValues(result: any, schema: Schema) {
        this.applyFunctionToResult(result, (obj) => {
            Object.keys(schema.properties).forEach((propertyName: string) => {
                const propValue = obj[propertyName];
                if (propValue) {
                    const propDefinition = StringGenerator.getProperty(schema.properties[propertyName]);
                    if (propDefinition.type === "uri" && propDefinition.ref) {
                        const referencedSchema = propDefinition.ref.schema;
                        if (referencedSchema) {
                            const propPrefix = Object.keys(referencedSchema?.prefixes).find(prefName => referencedSchema.prefixes[prefName] === referencedSchema.resourceSchema);
                            if (propPrefix) {
                                if (Array.isArray(schema.properties[propertyName])) {
                                    const values: string[] = [];
                                        propValue.forEach((val: string) => {
                                            values.push(val.replace(`${propPrefix}:`, schema.prefixes[propPrefix]));
                                        })
                                        obj[propertyName] = values;
                                } else {
                                    obj[propertyName] = propValue.replace(`${propPrefix}:`, schema.prefixes[propPrefix]);
                                }
                            }
                        }
                    }
                }
            });
        })
    }

    public static buildContext(propertyList: PropertyList, prefixes: PrefixList) {
        const context: Context = {};
        Object.keys(propertyList).forEach(propName => {
            const propDefinition = StringGenerator.getProperty(propertyList[propName]);
            const schema = `${prefixes[propDefinition.prefix]}${propName}`;
            if (propDefinition.type) {
                if (propDefinition.type === "integer") {
                    context[propName] = { "@id": schema, "@type": "http://www.w3.org/2001/XMLSchema#integer" };
                } else if (propDefinition.type === "uri") {
                    context[propName] = { "@id": schema, "@type": "@id" };
                }
            } else {
                context[propName] = { "@id": schema };
            }
        })
        return context;
    }

}