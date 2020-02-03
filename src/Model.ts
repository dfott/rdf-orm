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


export class RDF {

    public static createModel(schema: Schema): any {
        return class Model {
            public schemas = schema.schemas;
            public attributes = schema.attributes;
            public values: AttributeValues;
            public modelType = schema.type;
            public modelSchema = schema.typeSchema;

            private query: QueryBuilder;
            private edited = false;

            constructor(values: AttributeValues) {
               this.values = values;
               this.query = new QueryBuilder(this.schemas, this.attributes, this.values, this.modelSchema, this.modelType);
            }

            public save(): string {
                this.setEdited(true);
                return this.edited ? this.query.generateUpdate(this.values) : this.query.generateCreate();
            }

            public find(): string {
                return this.query.generateFind();
            }

            private setEdited(edited: boolean) {
                this.edited = edited;
            }
        }
    }
}

export class QueryBuilder {

    private readonly prefixString: string;
    private readonly identifier: any;

    private readonly values: AttributeValues;

    constructor(private schemas: SchemaList, private attributes: AttributeList, values: AttributeValues,
                private typeSchema: string, private type: string) {

        this.values = { ...values };
        this.prefixString = Object.keys(schemas)
            .map(prefix => `PREFIX ${prefix}: <${this.schemas[prefix]}>`)
            .join('\n');

        this.identifier = Object.keys(this.attributes).find(key => this.attributes[key].identifier);
    }

    generateCreate() : string {

        const insertString = Object.keys(this.attributes).map(key => {
            const attribute = this.attributes[key];
            const value = typeof this.values[key] === 'string' ? `"${this.values[key]}"`: this.values[key];
            return `<${this.typeSchema}${this.type}/${this.values[this.identifier]}> ${attribute.prefix}:${attribute.type} ${value}`;
        }).join(' . ');

        const createString =
`${this.prefixString}\n
insert data { ${insertString } }`;

        return createString;
    }

    generateUpdate(newValues: AttributeValues) : string{

        const deleteString = Object.keys(this.attributes).map(key => {
            const attribute = this.attributes[key];
            return `?${this.type} ${attribute.prefix}:${attribute.type} ${attribute.identifier ? this.values[key] : `?${attribute.type}`}`;
        }).join(' . ');


        const insertString = Object.keys(this.attributes).map(key => {
            const attribute = this.attributes[key];
            const value = typeof newValues[key] === 'string' ? `"${newValues[key]}"`: newValues[key];
            return `<${this.typeSchema}${this.type}/${newValues[this.identifier]}> ${attribute.prefix}:${attribute.type} ${value}`;
        }).join(' . ');

        const saveString =
`${this.prefixString}\n
delete { ${deleteString} }
insert { ${insertString} }
where { ${deleteString} }`;

        return saveString;
    }

    generateFind(): string {

        const selectString = Object.keys(this.attributes)
            .map(key => {
               return `?${this.attributes[key].type}`
            }).join(' ');

        const whereString = Object.keys(this.attributes)
            .map(key => {
                const attribute = this.attributes[key];
                return `?${this.type} ${attribute.prefix}:${attribute.type} ?${attribute.type}`
            }).join(' . ');

        const findString =
`${this.prefixString}\n
select ?${this.type} ${selectString}
where { ${whereString} }`;

        return findString;
    }
}
