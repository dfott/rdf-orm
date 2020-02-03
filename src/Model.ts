export interface SchemaList {
    [prefix: string]: string,
}

export interface Attribute {
    type: string;
    prefix: string;
    identifier?: boolean;
}

export interface AttributeList {
    [attrName: string]: Attribute
}

export interface AttributeValues {
    [attrName: string]: any
}

export interface Schema {
    type: string;
    typeSchema: string;
    schemas: SchemaList;
    attributes: AttributeList;
}

import { Request} from "./Request";

const request = new Request('http://localhost:3030/test/query', 'http://localhost:3030/test/update');

export class RDF {

    public static createModel(schema: Schema): any {
        return class Model {

            private schema = schema;
            public values: AttributeValues;

            private query: QueryBuilder;
            private edited = false;

            constructor(values: AttributeValues) {
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
                console.log(result);
            }

            private setEdited(edited: boolean) {
                this.edited = edited;
            }
        }
    }
}

export class QueryBuilder {

    private readonly prefixString: string;
    private readonly identifierString: string;

    private readonly identifier: any;
    private readonly attributeSelectionList: string[];

    private readonly schemas: SchemaList;
    private readonly attributes: AttributeList;
    private readonly typeSchema: string;
    private readonly type: string;

    private readonly values: AttributeValues;

    constructor(schema: Schema, values: AttributeValues) {
        this.schemas = schema.schemas;
        this.attributes = schema.attributes;
        this.typeSchema = schema.typeSchema;
        this.type = schema.type;
        this.values = { ...values };

        this.prefixString = StringGenerator.generatePrefixString(this.schemas);
        this.identifier = Object.keys(this.attributes).find(key => this.attributes[key].identifier);

        this.identifierString = Object.keys(this.attributes).map(key => {
            const attribute = this.attributes[key];
            return `?${this.type} ${attribute.prefix}:${attribute.type} ${attribute.identifier ? this.values[key] : `?${attribute.type}`}`;
        }).join(' . ');

        this.attributeSelectionList = StringGenerator.generateAttributeSelectionList(schema.attributes);
    }

    generateCreate() : string {

        const insertString = Object.keys(this.attributes).map(key => {
            const attribute = this.attributes[key];
            const value = typeof this.values[key] === 'string' ? `"${this.values[key]}"`: this.values[key];
            return `<${this.typeSchema}${this.type}/${this.values[this.identifier]}> ${attribute.prefix}:${attribute.type} ${value}`;
        }).join(' . ');

        return `${this.prefixString}\r\nINSERT DATA\r\n \t{ ${insertString} }\r\n`;
    }

    generateUpdate(newValues: AttributeValues) : string{
        const insertString = Object.keys(this.attributes).map(key => {
            const attribute = this.attributes[key];
            const value = typeof newValues[key] === 'string' ? `"${newValues[key]}"`: newValues[key];
            return `<${this.typeSchema}${this.type}/${newValues[this.identifier]}> ${attribute.prefix}:${attribute.type} ${value}`;
        }).join(' . ');

        return `\r\n${this.prefixString}\n
            delete { ${this.identifierString} }
            insert { ${insertString} }
            where { ${this.identifierString} }`;
    }

    public static generateFind(schema: Schema): string {

        const selectString = StringGenerator.generateAttributeSelectionList(schema.attributes).join(' ');

        const whereString = Object.keys(schema.attributes)
            .map(key => {
                const attribute = schema.attributes[key];
                return `?${schema.type} ${attribute.prefix}:${attribute.type} ?${attribute.type}`
            }).join(' . ');

        return `${StringGenerator.generatePrefixString(schema.schemas)}\n
            select ?${schema.type} ${selectString}
            where { ${whereString} }`;
    }

}

class StringGenerator {
    public static generatePrefixString(schemas: SchemaList): string {
        return Object.keys(schemas)
            .map(prefix => `PREFIX ${prefix}: <${schemas[prefix]}>`)
            .join('\n')
    }

    // --- TODO FILTERING -------
    public static generateAttributeSelectionList(attributes: AttributeList) : string[] {
        return Object.keys(attributes)
            .map(key => {
                return `?${attributes[key].type}`
            })
    }
}
