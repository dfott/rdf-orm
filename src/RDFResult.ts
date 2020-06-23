import { Schema, PropertyValues, PropertyList, Property } from "./RDF";
import { QueryBuilder } from "./QueryBuilder";
import { RDFRequest } from "./RDFRequest";
import { defaultJsonLd, LdConverter } from "./LdConverter";
import { StringGenerator } from "./StringGenerator";

import * as jsonld from "jsonld";
import { JsonLdObj } from "jsonld/jsonld-spec";

export interface JsonLD {
    "@graph"?: JsonLDResource[]
    "@id"?: string;
    "@type"?: string;
    [propname: string]: any
    "@context"?: Context
}

export interface JsonLDResource {
    "@id": string;
    "@type": string;
    [propname: string]: string | string[];
}

export interface RawJsonLDResource {
    "@id": string;
    "@type": string;
    [propname: string]: string | string[] | RawLDValue;
}

export interface RawLDValue { "@type": string, "@value": string}

export interface Context {
    [propName: string]: ContextObject
}

export interface ContextObject {
    "@id": string;
    "@type"?: string;
}

export interface UriMap {
    [uri: string]: [string]
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
            this.updated = true;
        } 
    }

    public async convertToLD(context: Context) {
        if (this.result) {
            const ld = await jsonld.fromRDF(this.result)
            const fullLd = await jsonld.compact(ld, context)
            this.result = fullLd;
            this.convertLDValues(this.result);
        }
    }

    /**
     * If a property is an object with key @value, set the value of this property to be the value of the object.
     * Also inserts the values in an array if they were defined to be one in the schema
     * @param jsonld 
     */
    public async convertLDValues(jsonld: JsonLD) {
        this.applyToObjects(jsonld, (obj: RawJsonLDResource) => {
            Object.keys(obj).forEach(propName => {
                const propDefinition = this.schema.properties[propName]
                const prop = obj[propName];
                if (typeof prop !== "string" && !Array.isArray(prop)) {
                    if (prop["@value"]) {
                        obj[propName] = this.valueToArray(prop["@value"], propDefinition);
                    }
                } else {
                    obj[propName] = this.valueToArray(prop, propDefinition);
                }
            })
        })
    }

    /**
     * Converts the resulting property value to an array, if it was defined to be one in the schema
     */
    private valueToArray(value: string | string[], propDefinition: Property | Property[]): string | string[] {
        if (propDefinition) {
            if (Array.isArray(propDefinition)) {
                if (!Array.isArray(value)) {
                    return [value]
                }
            }
        }
        return value;
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
        if (!this.result["@graph"]) {
            const values: PropertyValues = { identifier: this.result["@id"]};
            Object.keys(this.result).forEach(propName => {
                if (this.schema.properties[propName]) {
                    values[propName] = this.result[propName];
                }
            })
            const updateQuery = this.builder.buildUpdate(values);
            await this.request.update(updateQuery);
            return Promise.resolve(updateQuery);
        } else {
            return Promise.resolve("Cannot update whole list");
        }
    }

    /**
     * Calls a given callback function for every JsonLDResource Object in the result. It is used because the JsonLD result of a construct query 
     * returns the object directly in the resulting object or if there are multiple, they are saved in the @graph property.
     * @param result 
     * @param callback 
     */
    private applyToObjects(result: any, callback: (obj: any) => void) {
        if (result["@graph"]) {
            result["@graph"].forEach((obj: any) => callback(obj))
        } else {
            callback(result);
        }
    }

    /**
     * Replaces the uri of the specified property with the object is inside the triplestore
     * @param propertyName 
     */
    public async populate(propertyName: string): Promise<RDFResult> {
        const propDefinition = StringGenerator.getProperty(this.schema.properties[propertyName]);
        if (!propDefinition) { throw Error(`Cannot populate property ${propertyName} as it does'nt exist on the defined type ${this.schema.resourceType}.`) }
        if (propDefinition.type !== "uri") { throw Error(`Cannot populate property ${propertyName} as values of this property are defined to be literals.`) } 

        if (this.result["@graph"]) {
            return await this.populateMultipleObjects(propertyName, this.result["@graph"], propDefinition);
        } else {
            const value = this.result[propertyName];
            if (!value) { throw Error("Cannot populate a field, that doesn't exist in the resulting object.") }
            return await this.populateSingleObject(propertyName, value, propDefinition);
        }
    }

    /**
     * Checks if the given property is an array and then executes a function based on if it is one or not. Used to populate an array of uri's or a single uri
     * @param propValue 
     * @param propertyName 
     * @param isArray 
     * @param isString 
     */
    private async callFunctionOnProperty(propValue: string | string[], propertyName: string, 
            isArray: (propArray: string[]) => void, isString: (propString: string) => void) {
        if (Array.isArray(propValue)) {
            if (Array.isArray(this.schema.properties[propertyName])) {
                isArray(propValue);
            }
        } else {
            isString(propValue);
        }
    }

    /**
     * Populates the field of multiple objects
     * @param propertyName 
     * @param objects 
     * @param propDefinition 
     */
    private async populateMultipleObjects(propertyName: string, objects: JsonLDResource[], propDefinition: Property): Promise<RDFResult> {
        const requests: Promise<RDFResult>[] = [];
        objects.forEach(obj => {
            const prop = obj[propertyName];
            this.callFunctionOnProperty(prop, propertyName, (propArray: string[]) => {
                propArray.forEach((value: any) => {
                    if (propDefinition.ref) {
                        let identifierSplit = value.split("/");
                        let identifier = identifierSplit[identifierSplit.length - 1];
                        requests.push(propDefinition.ref.findByIdentifier(identifier));
                    }
                })
            }, (propString: string) => {
                if (propDefinition.ref) {
                    let identifierSplit = propString.split("/");
                    let identifier = identifierSplit[identifierSplit.length - 1];
                    requests.push(propDefinition.ref.findByIdentifier(identifier));
                }
            })
        });
        const populateResult = await Promise.all(requests);

        objects.forEach(obj => {
            const prop = obj[propertyName];
            this.callFunctionOnProperty(prop, propertyName, (propArray: string[]) => {
                propArray.forEach((value: any, index: number) => {
                    const populateWith = populateResult.find((res: RDFResult) => {
                        if (res.result["@id"]) {
                            return res.result["@id"] === value
                        }
                    })
                    if (populateWith) {
                        propArray[index] = populateWith.result;
                    }
                })
            }, (propString: string) => {
                const value = propString;
                const populateWith = populateResult.find((res: RDFResult) => {
                    if (res.result["@id"]) {
                        return res.result["@id"] === value
                    }
                })
                if (populateWith) {
                    obj[propertyName] = populateWith.result;
                }
            });
        });
        return Promise.resolve(this);
    }

    /**
     * Populates the property of one single object
     * @param propertyName 
     * @param value 
     * @param propDefinition 
     */
    private async populateSingleObject(propertyName: string, value: any, propDefinition: Property): Promise<RDFResult> {
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
        return this;
    }

}