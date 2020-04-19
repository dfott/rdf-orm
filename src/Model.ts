import { QueryBuilder } from "./QueryBuilder";
import { RDFRequest } from "./RDFRequest";

export interface PrefixList {
    [prefix: string]: string,
}

export interface Property {
    prefix: string;
    isKey?: boolean;
}

export interface PropertyList {
    [propertyName: string]: Property;
}

export interface PropertyValues {
    identifier: string;
    [propertyName: string]: any;
}

export interface Schema {
    resourceType: string;
    resourceSchema: string;
    prefixes: PrefixList;
    properties: PropertyList;
}

export interface FindParameters {
    [propertyName: string]: string | number;
}

export interface RawModel {
    [propertyName: string] : {
        type: string;
        value: string;
    }
}

export interface ObjectValues {
    [propertyName: string]: string;
}

// const request = new RDFRequest('http://localhost:3030/test/query', 'http://localhost:3030/test/update');

export class RDF {

    public static createModel(schema: Schema, request: RDFRequest): any {
        return class Model {

            private schema = schema;
            public values: PropertyValues;

            private query: QueryBuilder;
            private edited = false;

            constructor(values: PropertyValues) {
               this.values = values;
               this.query = new QueryBuilder(this.schema, this.values);
            }

            public async save(sendRequest: boolean) {
                try {
                    const query = this.edited ? this.query.generateUpdate(this.values) : this.query.generateCreate();
                    this.setEdited(true);
                    if (sendRequest) await request.update(query);
                    // console.log(query)
                    return query;
                } catch (e) {
                    console.log(e)
                }
            }

            public static async find(findParameters?: FindParameters) {
                const query = QueryBuilder.generateFind(schema, findParameters);
                const result = await request.query(query);
                return result.bindings;
                // console.log(query);
                // console.log(result);
            }

            public static async findJSON(findParameters?: FindParameters) {
                const query = QueryBuilder.generateFindJSON(schema, findParameters);
                return await request.query(query);
                // console.log(query);
                // console.log(result);
            }

            public static async findByIdentifier(identifier: string) {
                const query = QueryBuilder.generateFindByIdentifier(schema, identifier);
                const result = await request.query(query);
                // return result.bindings[0];
                const objValues: PropertyValues = { identifier };
                try {
                    Object.keys(result.bindings[0]).forEach(prop => objValues[prop] = result.bindings[0][prop].value); 
                    const rdfObj = new RDFObject(objValues, schema, request);
                    return rdfObj;
                } catch (e) {
                    return {};
                }
                // return this.generateModelObject(result.bindings[0]);
            }

            public static async findByKey(keyValue: string | number) {
                const query = QueryBuilder.generateFindByKey(schema, keyValue);
                const result = await request.query(query);
                // console.log(query);
                // console.log(result);
            }

            public static async delete() {
               const query = QueryBuilder.generateDelete(schema);
               const result = await request.update(query);
                // console.log(query);
                // console.log(result);
            }

            private setEdited(edited: boolean) {
                this.edited = edited;
            }

        }
    }
}

export class RDFObject {

    private query: QueryBuilder;

    constructor(public values: PropertyValues, public schema: Schema, public request: RDFRequest) {
        this.query = new QueryBuilder(schema, values);
    }

    public async save() {
        try {
            const query = this.query.generateUpdate(this.values);
            await this.request.update(query);
            console.log(query)
            return query;
        } catch (e) {
            console.log(e)
        }
    }

}
