import {QueryBuilder} from "./QueryBuilder";
import { Request} from "./Request";

export interface SchemaList {
    [prefix: string]: string,
}

export interface Property {
    type: string;
    prefix: string;
    identifier?: boolean;
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
    schemas: SchemaList;
    properties: PropertyList;
}

const request = new Request('http://localhost:3030/test/query', 'http://localhost:3030/test/update');

export class RDF {

    public static createModel(schema: Schema): any {
        return class Model {

            private schema = schema;
            public values: PropertyValues;

            private query: QueryBuilder;
            private edited = false;

            constructor(values: PropertyValues) {
               this.values = values;
               this.query = new QueryBuilder(this.schema, this.values);
            }

            public save(sendRequest: boolean) {
                const query = this.edited ? this.query.generateUpdate(this.values) : this.query.generateCreate();
                this.setEdited(true);
                if (sendRequest) request.update(query);
                return query;
            }

            public static async find() {
                const query = QueryBuilder.generateFind(schema);
                const result = await request.query(query);
                console.log(query);
                console.log(result);
            }

            private setEdited(edited: boolean) {
                this.edited = edited;
            }
        }
    }
}

