import { Schema, PropertyValues, Property, PropertyList, PrefixList } from "./models/RDFModel";
import { QueryBuilder } from "./QueryBuilder";
import { RDFRequest } from "./RDFRequest";
import { StringGenerator } from "./StringGenerator";

import * as jsonld from "jsonld";
import { Context, LDResource, LDResourceList, JsonLD } from "./models/JsonLD";
import { PreHookFunction } from "./RDF";
import { ResourceSchema } from "./ResourceSchema";


export interface RawJsonLDResource {
    "@id": string;
    "@type": string;
    [propname: string]: string | string[] | RawLDValue;
}

export interface RawLDValue { "@type": string, "@value": string}


/**
 * Every CRUD operation called on a model will use this class to convert the resulting nquads into a LDResource or a LDResourceList. These objects represent the result in JsonLD format and can be used to update/save the resource
 */
export class LdConverter {

    /**
     * The constructor updates the result to create an object, that is valid JSON-LD and is still intuitive to work with as a developer 
     * @param request - the request object used to communicate with a triplestore
     * @param schema - schema that provides the necessary information about the model
     * @param nquads - resulting nquads 
     */
    constructor(private request: RDFRequest, private schema: ResourceSchema, public nquads: object) {
    }

    /**
     * Generates an initial LDResource object, that can be used to save a resource with the given values in a triplestore
     * @param values 
     */
    public async generateInitialLDResource(values: PropertyValues, preSaveHook?: PreHookFunction): Promise<LDResource> {
        const context = this.buildContext(this.schema.properties, this.schema.prefixes);
        const newValues = { ...values }
        delete newValues.identifier;
        const basicLD = {
            "@context": context,
            "@id": `${this.schema.baseURI}${this.schema.resourceType}/${values.identifier}`,
            "@type": `${this.schema.baseURI}${this.schema.resourceType}`,
            ...newValues
        };
        const nquads = await jsonld.toRDF(basicLD);
        const converted = await jsonld.fromRDF(nquads);
        const finalLd = await jsonld.compact(converted, context) as LDResource;
        this.convertLDValues(finalLd)
        // finalLd.save = () => this.save(finalLd, this.schema) 
        if (preSaveHook) {
            finalLd.save = () => {
                preSaveHook(() => this.save(finalLd, this.schema), finalLd);
                return Promise.resolve();
            }
        } else {
            finalLd.save = () => this.save(finalLd, this.schema);
        }
        return Promise.resolve(finalLd);
    }

    /**
     * Converts the nquads to a JsonLD object, that contains a single resource
     * @param context - context object of the jsonld object
     */
    public async toLDResource(properties: PropertyList, prefixes: PrefixList): Promise<LDResource> {
        const context = this.buildContext(properties, prefixes)
        const rawLd = await jsonld.fromRDF(this.nquads)
        const ldResource = await jsonld.compact(rawLd, context) as LDResource;
        this.convertLDValues(ldResource);
        ldResource.save = () => this.update(ldResource, this.schema); 
        ldResource.populate = (propertyName: string) => 
            this.populateLDResource(propertyName, StringGenerator.getProperty(this.schema.properties[propertyName]), ldResource)
        return Promise.resolve(ldResource);
    }

    /**
     * Converts the nquads to a JsonLD object, that contains multiple resources in the @graph property
     * @param context - context object of the jsonld object
     */
    public async toLDResourceList(properties: PropertyList, prefixes: PrefixList): Promise<LDResourceList> {
        const context = this.buildContext(properties, prefixes)
        if (this.nquads) {
            const rawLd = await jsonld.fromRDF(this.nquads)
            const fullLd = await jsonld.compact(rawLd, context) as any;
            this.convertLDValues(fullLd);
            if (fullLd["@graph"]) {
                fullLd["@graph"].forEach((ldResource: LDResource) => { 
                    ldResource.save = () => this.update(ldResource, this.schema) 
                    ldResource.populate = (propertyName: string) => 
                        this.populateLDResource(propertyName, StringGenerator.getProperty(this.schema.properties[propertyName]), ldResource)
                });
                fullLd.populate = (propertyName: string) => {
                    return this.populateMultipleObjects(propertyName, fullLd, StringGenerator.getProperty(this.schema.properties[propertyName]))
                }
                return Promise.resolve(fullLd);
            } else {
                // if there was a single object returned, manually adds the @graph property as an array and add the object to this list
                let ldResource = Object.assign({}, fullLd);
                ldResource.save = () => this.update(ldResource, this.schema);
                ldResource.populate = (propertyName: string) => 
                    this.populateLDResource(propertyName, StringGenerator.getProperty(this.schema.properties[propertyName]), ldResource)
                delete ldResource["@context"];
                let ldResourceList = {
                    "@context": fullLd["@context"],
                    "@graph": [ldResource]
                } as LDResourceList;
                ldResourceList.populate = (propertyName: string) => {
                    return this.populateMultipleObjects(propertyName, ldResourceList, StringGenerator.getProperty(this.schema.properties[propertyName]))
                }
                return Promise.resolve(ldResourceList);
            }
        } else {
            const res = {
                "@graph": [] as LDResource[],
                "@context": context
            } as LDResourceList;
            res.populate = (propName: string) => Promise.resolve(res);
            return Promise.resolve(res);
        }
    }

    /**
     * If a property is an object with key @value, set the value of this property to be the value of the object.
     * Also inserts the values in an array if they were defined to be one in the schema
     * @param jsonld 
     */
    public async convertLDValues(jsonld: JsonLD) {
        this.applyToObjects(jsonld, (ldResource: RawJsonLDResource) => {
            Object.keys(ldResource).forEach(propName => {
                const propDefinition = this.schema.properties[propName]
                const prop = ldResource[propName];
                if (typeof prop !== "string" && !Array.isArray(prop)) {
                    if (prop["@value"]) {
                        ldResource[propName] = this.valueToArray(prop["@value"], propDefinition);
                    }
                } else {
                    ldResource[propName] = this.valueToArray(prop, propDefinition);
                }
            })
        })
    }

    /**
     * Creates a context object used to compact a jsonld result.
     * @param propertyList 
     * @param prefixes 
     */
    public buildContext(propertyList: PropertyList, prefixes: PrefixList): Context {
        const context: Context = {};
        Object.keys(propertyList).forEach(propName => {
            const propDefinition = StringGenerator.getProperty(propertyList[propName]);
            const schema = `${prefixes[propDefinition.prefix]}${propName}`;
            if (propDefinition.type) {
                if (propDefinition.type === "integer") {
                    context[propName] = { "@id": schema, "@type": "http://www.w3.org/2001/XMLSchema#integer" };
                } else if (propDefinition.type === "uri") {
                    context[propName] = { "@id": schema, "@type": "@id" };
                    // context[propName] = { "@id": schema };
                }
            } else {
                context[propName] = { "@id": schema };
            }
        })
        return context;
    }

    /**
     * This function is added to newly created LDResources. It is used to save the resource in a triplestore. 
     */
    public async save(ldResource: LDResource, schema: Schema): Promise<void> {
        const values: PropertyValues = { identifier: ldResource["@id"] };
        this.extractValuesFromLD(values, ldResource, schema.properties);
        this.checkIfValuesExist(ldResource, schema);
        const insertQuery = QueryBuilder.buildInsert(values, schema);
        await this.request.update(insertQuery);
        ldResource.save = () => this.update(ldResource, schema);
        return Promise.resolve();
    }

    public checkIfValuesExist(ldResource: LDResource, schema: Schema) {
        Object.keys(schema.properties).forEach(propName => {
            const property = StringGenerator.getProperty(schema.properties[propName]);
            if (!property.optional) {
                if (!ldResource[propName]) {
                    throw Error(`No value given for required property ${propName}`);
                }
            }
        });
    }

    /**
     * Updates the tupels in the triplestore to contain the values of the ldResource object.
     */
    private async update(ldResource: LDResource, schema: Schema): Promise<void> {
        const values: PropertyValues = { identifier: ldResource["@id"]};
        this.extractValuesFromLD(values, ldResource, schema.properties);
        const updateQuery = QueryBuilder.buildUpdate(values, schema);
        await this.request.update(updateQuery);
        return Promise.resolve();
    }

    /**
     * Populates the property of one single object
     * @param propertyName 
     * @param value 
     * @param propDefinition 
     */
    private async populateLDResource(propertyName: string, propDefinition: Property, ldResource: LDResource): Promise<LDResource> {
        const value = ldResource[propertyName];
        if (Array.isArray(value)) {
            const requests: Promise<LDResource>[] = [];
            value.forEach((val: string) => {
                this.pushRequest(val, propDefinition, requests);
            })
            const populatedResult = await Promise.all(requests);
            ldResource[propertyName] = populatedResult;

            return Promise.resolve(ldResource);
        } else {
            if (propDefinition.ref) {
                let identifierSplit = value.split("/");
                let identifier = identifierSplit[identifierSplit.length - 1];
                ldResource[propertyName] = await propDefinition.ref.findByIdentifier(identifier);
            }
        }
        return Promise.resolve(ldResource);
    }

    /**
     * Populates the field of multiple objects
     * @param propertyName 
     * @param objects 
     * @param propDefinition 
     */
    private async populateMultipleObjects(propertyName: string, ldResourceList: LDResourceList, propDefinition: Property): Promise<LDResourceList> {
        const objects = ldResourceList["@graph"];
        const requests: Promise<LDResource>[] = [];
        objects.forEach(obj => {
            const prop = obj[propertyName];
            this.callFunctionOnProperty(prop, propertyName, (propArray: string[]) => {
                propArray.forEach((value: any) => {
                    this.pushRequest(value, propDefinition, requests);
                })
            }, (propString: string) => {
                this.pushRequest(propString, propDefinition, requests);
            })
        });
        const populateResult = await Promise.all(requests);

        objects.forEach(obj => {
            const prop = obj[propertyName];
            this.callFunctionOnProperty(prop, propertyName, (propArray: any[]) => {
                propArray.forEach((value: any, index: number) => {
                    const populateWith = populateResult.find((res: LDResource) => {
                        if (res["@id"]) {
                            return res["@id"] === value
                        }
                    })
                    if (populateWith) {
                        propArray[index] = populateWith;
                    }
                })
            }, (propString: string) => {
                const value = propString;
                const populateWith = populateResult.find((res: LDResource) => {
                    if (res["@id"]) {
                        return res["@id"] === value
                    }
                })
                if (populateWith) {
                    obj[propertyName] = populateWith;
                }
            });
        });
        return Promise.resolve(ldResourceList);
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

    private async pushRequest(value: string, propDefinition: Property, requests: Promise<LDResource>[]) {
        if (propDefinition.ref) {
            let identifierSplit = value.split("/");
            let identifier = identifierSplit[identifierSplit.length - 1];
            // !TODO FIX!!!
            requests.push(propDefinition.ref.findByIdentifier(identifier));
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

    private extractValuesFromLD(values: PropertyValues, ldResource: LDResource, properties: PropertyList) {
        Object.keys(ldResource).forEach(propName => {
            if (properties[propName]) {
                values[propName] = ldResource[propName];
            }
        })
    }
    
}