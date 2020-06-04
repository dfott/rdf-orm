import { PropertyValues, Schema } from "./Model";
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
            .concat(`select { ${StringGenerator.selectString(schema.properties)} }\n`)
            .concat(`where {\n`)
            .concat(`${StringGenerator.whereString(schema.properties, schema.resourceType)}\n`)
            .concat(`}`);
    }


}