import { PropertyValues, Schema, FindParameters } from "./RDF";
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
     * Builds an update query, which deletes and then reinserts every tupel used to describe the resource
     * @param values - values for every property of the model
     */
    public buildUpdate(values: PropertyValues) {
        const constructGraphPattern = StringGenerator.constructString(this.schema.properties, this.schema.resourceType);
        const whereGraphPattern = StringGenerator.whereString(this.schema.properties, this.schema.resourceType);
        return `${StringGenerator.prefixString(this.schema.prefixes)}\n\n`
            .concat(`delete {\n`)
            .concat(`${constructGraphPattern}`)
            .concat(`\n}\n`)
            .concat(`insert {\n`)
            .concat(StringGenerator.insertString(this.schema.properties, values, this.schema.resourceSchema, this.schema.resourceType))
            .concat(`\n}\n`)
            .concat(`where {\n`) 
            .concat(whereGraphPattern + "\n")
            .concat(StringGenerator.identifier(this.schema, values.identifier))
            .concat(`\n}`)
    }

    /**
     * Builds a find query, which would find every tupel that is modelled by the given schema
     * @param schema - schema that provides the necessary information about the model
     */
    public static buildFind(schema: Schema): string {
        return `${StringGenerator.prefixString(schema.prefixes)}\n\n`
            .concat(`construct {\n`)
            .concat(`${StringGenerator.constructString(schema.properties, schema.resourceType)}\n`)
            .concat(`}\n`)
            .concat(`where {\n`)
            .concat(`${StringGenerator.whereString(schema.properties, schema.resourceType)}\n`)
            .concat(`}`);
    }

    /**
     * Builds a find query, which would find tupels, that are modelled by the given schema, based on the given property values in the findParameters object  
     * @param schema - schema that provides the necessary information about the model
     * @param findParameters - object, that contains properties and their values to filter the result 
     */
    public static buildFindFiltered(schema: Schema, findParameters: FindParameters): string {
        return `${StringGenerator.prefixString(schema.prefixes)}\n\n`
            .concat(`construct {\n`)
            .concat(`${StringGenerator.constructString(schema.properties, schema.resourceType)}\n`)
            .concat(`}\n`)
            .concat(`where {\n`)
            .concat(`${StringGenerator.whereString(schema.properties, schema.resourceType)}\n`)
            .concat(`${StringGenerator.whereStringFiltered(schema.properties, findParameters, schema.resourceType)}\n`)
            .concat(`}`);
    }

    /**
     * Builds a find query, which would find tupels, that describe the resource with the given identifier. 
     * @param schema - schema that provides the necessary information about the model
     * @param identifier 
     */
    public static buildFindByIdentifier(schema: Schema, identifier: string): string {
        const graphPattern = StringGenerator.whereString(schema.properties, schema.resourceType);
        const whereString = `${graphPattern}\n`
            .concat(StringGenerator.identifier(schema, identifier));
        
        return `${StringGenerator.prefixString(schema.prefixes)}\n\n`
            .concat(`construct {\n`)
            .concat(`${StringGenerator.constructString(schema.properties, schema.resourceType)}\n`)
            .concat(`}\n`)
            .concat(`where {\n`)
            .concat(`${whereString}\n`)
            .concat(`}`);
    }

    /**
     * Builds a delete query, which would delete every tupel that is modelled by the given schema
     * @param schema - schema that provides the necessary information about the model
     */
    public static buildDelete(schema: Schema): string {
        const constructPattern = StringGenerator.constructString(schema.properties, schema.resourceType);
        const whereGraphPattern = StringGenerator.whereString(schema.properties, schema.resourceType);
        return `${StringGenerator.prefixString(schema.prefixes)}\n\n`
            .concat(`delete {\n`)
            .concat(constructPattern)
            .concat(`\n} where {\n`)
            .concat(whereGraphPattern)
            .concat(`\n}`);
    }

    /**
     * Builds a find query, which would delete tupels, that are modelled by the given schema, based on the given property values in the findParameters object  
     * @param schema - schema that provides the necessary information about the model
     * @param findParameters - object, that contains properties and their values to filter the result 
     */
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

    /**
     * Builds a delete query, which would delete tupels, that describe the resource with the given identifier. 
     * @param schema - schema that provides the necessary information about the model
     * @param identifier 
     */
    public static buildDeleteByIdentifier(schema: Schema, identifier: string): string {
        const whereGraphPattern = StringGenerator.whereString(schema.properties, schema.resourceType);
        const firstProp = Object.keys(schema.properties)[0];
        const firstPropPrefix = StringGenerator.getProperty(schema.properties[firstProp]).prefix;
        const whereString = `${whereGraphPattern}\n`
            .concat(`<${schema.resourceSchema}${schema.resourceType}/${identifier}> ${firstPropPrefix}:${firstProp} ?${firstProp}`);

        return `${StringGenerator.prefixString(schema.prefixes)}\n\n`
            .concat(`delete {\n`)
            .concat(whereGraphPattern)
            .concat(`\n} where {\n`)
            .concat(whereString)
            .concat(`\n}`);
    }


}