import { PropertyValues, Schema, FindParameters } from "./Model";
import { StringGenerator } from "./StringGenerator";

export class QueryBuilder {

    constructor(private schema: Schema, private values: PropertyValues) {}

    /**
     * Builds an insert query.
     */
    public buildInsert(): string {
        return `${StringGenerator.prefixString(this.schema.prefixes)}\n\n`
            .concat(`INSERT DATA {\n`) 
            .concat(StringGenerator.insertString(this.schema.properties, this.values, this.schema.resourceSchema,
                    this.schema.resourceType))
            .concat(`\n}`)
    }

    /**
     * Builds a find query, which would find every tupel that is modelled by the given schema
     * @param schema - schema that provides the necessary information about the model
     */
    public static buildFind(schema: Schema): string {
        return `${StringGenerator.prefixString(schema.prefixes)}\n\n`
            .concat(`select ${StringGenerator.selectString(schema.properties, schema.resourceType)}\n`)
            .concat(`where {\n`)
            .concat(`${StringGenerator.whereString(schema.properties, schema.resourceType)}\n`)
            .concat(`}`);
    }

    public static buildFindFiltered(schema: Schema, findParameters: FindParameters): string {
        return `${StringGenerator.prefixString(schema.prefixes)}\n\n`
            .concat(`select ${StringGenerator.selectString(schema.properties, schema.resourceType)}\n`)
            .concat(`where {\n`)
            .concat(`${StringGenerator.whereString(schema.properties, schema.resourceType)}\n`)
            .concat(`${StringGenerator.whereStringFiltered(schema.properties, findParameters, schema.resourceType)}\n`)
            .concat(`}`);
    }

    public static buildFindByIdentifier(schema: Schema, identifier: string): string {
        const graphPattern = StringGenerator.whereString(schema.properties, schema.resourceType);
        const firstProp = Object.keys(schema.properties)[0];
        const firstPropPrefix = schema.properties[firstProp].prefix;
        const whereString = `${graphPattern}\n`
            .concat(`<${schema.resourceSchema}${schema.resourceType}/${identifier}> ${firstPropPrefix}:${firstProp} ?${firstProp}`);
        
        return `${StringGenerator.prefixString(schema.prefixes)}\n\n`
            .concat(`select ${StringGenerator.selectString(schema.properties, schema.resourceType)}\n`)
            .concat(`where {\n`)
            .concat(`${whereString}\n`)
            .concat(`}`);
    }

    /**
     * Builds a delete query, which would delete every tupel that is modelled by the given schema
     * @param schema - schema that provides the necessary information about the model
     */
    public static buildDelete(schema: Schema): string {
        const whereGraphPattern = StringGenerator.whereString(schema.properties, schema.resourceType);
        return `${StringGenerator.prefixString(schema.prefixes)}\n\n`
            .concat(`delete {\n`)
            .concat(whereGraphPattern)
            .concat(`\n} where {\n`)
            .concat(whereGraphPattern)
            .concat(`\n}`);
    }

    public static buildDeleteFiltered(schema: Schema, findParameters: FindParameters): string {
        const whereGraphPattern = StringGenerator.whereString(schema.properties, schema.resourceType);
        return `${StringGenerator.prefixString(schema.prefixes)}\n\n`
            .concat(`delete {\n`)
            .concat(whereGraphPattern)
            .concat(`\n} where {\n`)
            .concat(whereGraphPattern)
            .concat(`${StringGenerator.whereStringFiltered(schema.properties, findParameters, schema.resourceType)}\n`)
            .concat(`\n}`);
    }


}