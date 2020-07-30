import { StringGenerator } from "./StringGenerator";
import { PropertyValues, Schema, Property } from "./models/RDFModel";
import { FindParameters } from "./RDF";

export class QueryBuilder {

    constructor(private schema: Schema, private values: PropertyValues) {}

    /**
     * Builds an insert query.
     */
    public static buildInsert(values: PropertyValues, schema: Schema): string {
        return `${StringGenerator.prefixString(schema.prefixes)}\n\n`
            .concat(`INSERT DATA {\n`) 
            .concat(StringGenerator.insertString(schema.properties, values, schema.resourceSchema,
                    schema.resourceType))
            .concat(`\n}`)
    }

    /**
     * Builds an update query, which deletes and then reinserts every tupel used to describe the resource
     * @param values - values for every property of the model
     */
    public static buildUpdate(values: PropertyValues, schema: Schema) {
        const constructGraphPattern = StringGenerator.constructString(schema.properties, schema.resourceType);
        const whereGraphPattern = StringGenerator.whereString(schema.properties, schema.resourceType);
        return `${StringGenerator.prefixString(schema.prefixes)}\n\n`
            .concat(`delete {\n`)
            .concat(`${constructGraphPattern}`)
            .concat(`\n}\n`)
            .concat(`insert {\n`)
            .concat(StringGenerator.insertString(schema.properties, values, schema.resourceSchema, schema.resourceType))
            .concat(`\n}\n`)
            .concat(`where {\n`) 
            .concat(whereGraphPattern + "\n")
            .concat(StringGenerator.identifier(schema, values.identifier))
            .concat(`\n}`)
    }

    /**
     * Builds a filtered update query, which update the in updateParams specified properties. Optionally, the findParameters
     * object dictates, which tuples will be affected by the update.
     * @param schema 
     * @param updateParams 
     * @param findParameters 
     */
    public static buildFilteredUpdate(schema: Schema, updateParams: FindParameters, findParameters?: FindParameters): string {
        return `${StringGenerator.prefixString(schema.prefixes)}\n\n`
            .concat(`delete {\n`)
            .concat(`${StringGenerator.filteredGraphPattern(schema.properties, updateParams, schema.resourceType)}`)
            .concat(`\n}\n`)
            .concat("insert {\n")
            .concat(`${StringGenerator.whereStringFiltered(schema.properties, updateParams, schema.resourceType)}`)
            .concat("\n}\n")
            .concat("where {\n")
            .concat(StringGenerator.whereString(schema.properties, schema.resourceType))
            .concat(findParameters ? StringGenerator.whereStringFiltered(schema.properties, findParameters, schema.resourceType) : "")
            .concat(`\n}\n`);
    }

    /**
     * Builds a update query, that updates some properties of a resource, based on the given identifier. 
     * @param schema 
     * @param updateParams 
     * @param identifier 
     */
    public static buildUpdateByIdentifier(schema: Schema, updateParams: FindParameters, identifier: string): string {
        return `${StringGenerator.prefixString(schema.prefixes)}\n\n`
            .concat(`delete {\n`)
            .concat(`${StringGenerator.filteredGraphPattern(schema.properties, updateParams, schema.resourceType)}`)
            .concat(`\n}\n`)
            .concat("insert {\n")
            .concat(`${StringGenerator.whereStringFiltered(schema.properties, updateParams, schema.resourceType)}`)
            .concat("\n}\n")
            .concat("where {\n")
            .concat(StringGenerator.whereString(schema.properties, schema.resourceType) + "\n")
            .concat(StringGenerator.identifier(schema, identifier))
            .concat(`\n}\n`);
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

    /**
     * Takes a query and adds a limit statement to only return an x amount of objects
     * @param limit 
     * @param query 
     */
    public static limit(limit: number, query: string) {
        return `${query} LIMIT ${limit}`;
    }


}