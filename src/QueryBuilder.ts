import {PropertyList, PropertyValues, Schema, SchemaList} from "./Model";

export class QueryBuilder {

    private readonly prefixString: string;
    private readonly identifierString: string;

    private readonly identifier: any;
    private readonly attributeSelectionList: string[];


    private readonly schemas: SchemaList;
    private readonly attributes: PropertyList;
    private readonly typeSchema: string;
    private readonly type: string;

    private readonly values: PropertyValues;

    constructor(schema: Schema, values: PropertyValues) {
        this.schemas = schema.schemas;
        this.attributes = schema.properties;
        this.typeSchema = schema.resourceSchema;
        this.type = schema.resourceType;
        this.values = { ...values };

        this.prefixString = StringGenerator.generatePrefixString(this.schemas);
        this.identifier = Object.keys(this.attributes).find(key => this.attributes[key].identifier);

        this.identifierString = Object.keys(this.attributes).map(key => {
            const attribute = this.attributes[key];
            return `?${this.type} ${attribute.prefix}:${attribute.type} ${attribute.identifier ? this.values[key] : `?${attribute.type}`}`;
        }).join(' . ');

        this.attributeSelectionList = StringGenerator.generateAttributeSelectionList(schema.properties);
    }

    generateCreate() : string {

        const insertString = Object.keys(this.attributes).map(key => {
            const attribute = this.attributes[key];
            const value = typeof this.values[key] === 'string' ? `"${this.values[key]}"`: this.values[key];
            return `<${this.typeSchema}${this.type}/${this.values.identifier}> ${attribute.prefix}:${attribute.type} ${value}`;
        }).join(' . ');

        return `${this.prefixString}\r\nINSERT DATA\r\n \t{ ${insertString} }\r\n`;
    }

    generateUpdate(newValues: PropertyValues) : string{
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

        const selectString = StringGenerator.generateAttributeSelectionList(schema.properties).join(' ');

        const whereString = Object.keys(schema.properties)
            .map(key => {
                const attribute = schema.properties[key];
                return `?${schema.resourceType} ${attribute.prefix}:${attribute.type} ?${attribute.type}`
            }).join(' . ');

        return `${StringGenerator.generatePrefixString(schema.schemas)}\n
            select ?${schema.resourceType} ${selectString}
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
    public static generateAttributeSelectionList(attributes: PropertyList) : string[] {
        return Object.keys(attributes)
            .map(key => {
                return `?${attributes[key].type}`
            })
    }
}
