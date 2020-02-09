import {Property, PropertyList, PropertyValues, Schema, SchemaList} from "./Model";

export class QueryBuilder {

    private readonly rdfSchema = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#>';

    private readonly prefixString: string;
    private readonly identifierString: string;
    private readonly insertString: string;

    private readonly identifier: any;
    private readonly propertySelectionList: string[];


    private readonly schemas: SchemaList;
    private readonly properties: PropertyList;
    private readonly resourceSchema: string;
    private readonly resourceType: string;

    private readonly values: PropertyValues;

    constructor(schema: Schema, values: PropertyValues) {
        this.schemas = schema.schemas;
        this.properties = schema.properties;
        this.resourceSchema = schema.resourceSchema;
        this.resourceType = schema.resourceType;
        this.values = { ...values };

        this.prefixString = StringGenerator.generatePrefixString(this.schemas);
        this.identifier = Object.keys(this.properties).find(key => this.properties[key].isKey);

        this.identifierString = StringGenerator.generateIdentifierString(this.properties, this.values, this.resourceType);

        this.insertString = StringGenerator.generateInsertString(this.properties, this.values, this.resourceSchema, this.resourceType);

        this.propertySelectionList = StringGenerator.generateAttributeSelectionList(schema.properties);
    }

    generateCreate() : string {
        return `${this.prefixString}\r\nINSERT DATA\r\n \t{ ${this.insertString} }\r\n`;
    }

    generateUpdate(newValues: PropertyValues) : string{
        const insertString = StringGenerator.generateInsertString(this.properties, newValues, this.resourceSchema, this.resourceType);
        const identifierString = StringGenerator.generateIdentifierString(this.properties, newValues, this.resourceType);
        return `\r\n${this.prefixString}\n
            delete { ${identifierString} }
            insert { ${insertString} }
            where { ${identifierString} }`;
    }

    public static generateFind(schema: Schema): string {
        const selectString = StringGenerator.generateAttributeSelectionList(schema.properties).join(' ');
        const whereString = StringGenerator.generateWhereString(schema.properties, schema.resourceType);

        return `${StringGenerator.generatePrefixString(schema.schemas)}\n
            select ?${schema.resourceType} ${selectString} ?type
            where { ${whereString} }`;
    }

    public static generateFindByKey(schema: Schema, keyValue: any): string {
        const selectString = StringGenerator.generateAttributeSelectionList(schema.properties).join(' ');
        const keyProp = Object.keys(schema.properties).find(key => schema.properties[key].isKey);
        const whereString = StringGenerator.generateWhereString(schema.properties, schema.resourceType, keyProp, keyValue);

        return `${StringGenerator.generatePrefixString(schema.schemas)}\n
            select ?${schema.resourceType} ${selectString} ?type
            where { ${whereString} }`;
    }

    public static generateDelete(schema: Schema): string {
       const whereString = StringGenerator.generateWhereString(schema.properties, schema.resourceType);
       return `${StringGenerator.generatePrefixString(schema.schemas)}\r\ndelete { ${whereString} }\r\nwhere { ${whereString} }\r\n`;
    }

    private iterateKeys(keys: string[], callback: Function): string[] {
        return keys.map(key => callback(key, this.properties[key]));
    }

    private static iterateKeys(keys: string[], properties: PropertyList, callback: Function): string[] {
        return keys.map(key => callback(key, properties[key]));
    }

}

class StringGenerator {
    public static defaultRDFPrefix = 'rdf';

    public static generatePrefixString(schemas: SchemaList): string {
        // ---- TODO CHECK REGEX FOR RDF PREFIX -----------
        return Object.keys(schemas)
            .map(prefix => `PREFIX ${prefix}: <${schemas[prefix]}>`)
            .join('\n')
            // .concat(`\nPREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n`);
    }

    public static generateWhereString(properties: PropertyList, resourceType: string, keyProp?: string | undefined, keyValue?:any): string {
        return Object.keys(properties).map((key: string) => {
            const property = properties[key];
            if (keyProp !== undefined) {
                if (keyProp === key) {
                    return `?${resourceType} ${property.prefix}:${property.type} ${keyValue}`;
                }
            } else {
                return `?${resourceType} ${property.prefix}:${property.type} ?${property.type}`;
            }
        }).join(' . ').concat(` . ?${resourceType} <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type`)
    }

    // --- TODO FILTERING -------
    public static generateAttributeSelectionList(properties: PropertyList) : string[] {
        return Object.keys(properties)
            .map(key => {
                return `?${properties[key].type}`
            })
    }

    public static generateIdentifierString(properties: PropertyList, values: PropertyValues, resourceType: string): string {
        return Object.keys(properties).map(key => {
            const property = properties[key];
            return `?${resourceType} ${property.prefix}:${property.type} ${property.isKey ? values[key] : `?${property.type}`}`;
        }).join(' . ');
    }

    public static generateInsertString(properties: PropertyList, values: PropertyValues, resourceSchema: string, resourceType: string) : string {
        return Object.keys(properties).map((key: string) => {
            const property = properties[key];
            const value = typeof values[key] === 'string' ? `"${values[key]}"`: values[key];
            return `<${resourceSchema}${resourceType}/${values.identifier}> ${property.prefix}:${property.type} ${value}`;
        }).join(' . ').concat(` . <${resourceSchema}${resourceType}/${values.identifier}> a "${resourceType}"`);
    }

}
