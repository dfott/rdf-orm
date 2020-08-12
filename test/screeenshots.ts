class RDF {

    /**
     * Creates a model that can be used to perform all CRUD operations.
     * @param schema - schema that provides the necessary information about the model
     * @param request - request object, that will send http requests to a specified triplestore
     */
    public static createModel(schema: Schema, request: RDFRequest): IRDFModel {

        return new class Model implements IRDFModel {
            // Model implementation
        }

    }
}

class QueryBuilder {

    constructor(private schema: Schema, private values: PropertyValues) {}

    /**
     * Builds an insert query.
     */
    public static buildInsert(values: PropertyValues, schema: Schema): string {
    }

    /**
     * Builds an update query, which deletes and then reinserts every tupel used to describe the resource
     * @param values - values for every property of the model
     */
    public static buildUpdate(values: PropertyValues, schema: Schema) {
    }

    /**
     * Builds a filtered update query, which update the in updateParams specified properties. Optionally, the findParameters
     * object dictates, which tuples will be affected by the update.
     * @param schema 
     * @param updateParams 
     * @param findParameters 
     */
    public static buildFilteredUpdate(schema: Schema, updateParams: FindParameters, findParameters?: FindParameters): string {
    }

    /**
     * Builds a update query, that updates some properties of a resource, based on the given identifier. 
     * @param schema 
     * @param updateParams 
     * @param identifier 
     */
    public static buildUpdateByIdentifier(schema: Schema, updateParams: FindParameters, identifier: string): string {
    }

    /**
     * Builds a find query, which would find every tupel that is modelled by the given schema
     * @param schema - schema that provides the necessary information about the model
     */
    public static buildFind(schema: Schema): string {
    }

    /**
     * Builds a find query, which would find tupels, that are modelled by the given schema, based on the given property values in the findParameters object  
     * @param schema - schema that provides the necessary information about the model
     * @param findParameters - object, that contains properties and their values to filter the result 
     */
    public static buildFindFiltered(schema: Schema, findParameters: FindParameters): string {
    }

    /**
     * Builds a find query, which would find tupels, that describe the resource with the given identifier. 
     * @param schema - schema that provides the necessary information about the model
     * @param identifier 
     */
    public static buildFindByIdentifier(schema: Schema, identifier: string): string {
    }

    /**
     * Builds a delete query, which would delete every tupel that is modelled by the given schema
     * @param schema - schema that provides the necessary information about the model
     */
    public static buildDelete(schema: Schema): string {
    }

    /**
     * Builds a find query, which would delete tupels, that are modelled by the given schema, based on the given property values in the findParameters object  
     * @param schema - schema that provides the necessary information about the model
     * @param findParameters - object, that contains properties and their values to filter the result 
     */
    public static buildDeleteFiltered(schema: Schema, findParameters: FindParameters): string {
    }

    /**
     * Builds a delete query, which would delete tupels, that describe the resource with the given identifier. 
     * @param schema - schema that provides the necessary information about the model
     * @param identifier 
     */
    public static buildDeleteByIdentifier(schema: Schema, identifier: string): string {
    }

    /**
     * Takes a query and adds a limit statement to only return an x amount of objects
     * @param limit 
     * @param query 
     */
    public static limit(limit: number, query: string) {
    }

}

export class StringGenerator {

    /**
     * Generates the prefix declaration for a SparQL query.
     * @param prefixList - List of every prefix and its corresponding schema url
     */
    public static prefixString(prefixList: PrefixList): string {
    }

    /**
     * Generates a string, that will be used in the select clause of a SparQl query to identify the properties that will be 
     * returned in the result.
     * @param propertyList - List of every property and its prefix
     */
    public static selectString(propertyList: PropertyList, resourceType: string): string {
    }

    /**
     * Generates a string, that contains a basic graph pattern and will be in the construct clause of a SparQL query. 
     * @param properties - List of every property and its prefix
     * @param resourceType - Type of the modelled resource
     */
    public static constructString(properties: PropertyList, resourceType: string): string {
    }

    /**
     * Generates a string, that contains a basic graph pattern including optional tupels and will be in the where clause of a SparQL query. 
     * @param properties - List of every property and its prefix
     * @param resourceType - Type of the modelled resource
     */
    public static whereString(properties: PropertyList, resourceType: string): string {
    }

    /**
     * Generates a string with multiple RDF Triples, which contain the given propertyNames and values. This string can then
     * be used in a select statement for SparQl
     * @param properties - List of every property and its prefix
     * @param values - List of every property and its value, which will be inserted
     * @param resourceSchema - Schema of the modelled resource
     * @param resourceType - Type of the modelled resource
     */
    public static insertString(properties: PropertyList, values: PropertyValues, resourceSchema: string, resourceType: string) : string {
    }

    /**
     * Pushes a triple statement to a list. 
     * @param statementList 
     * @param uri 
     * @param property 
     * @param propertyName 
     * @param value 
     */
    private static pushValueToStatements(statementList: string[], uri: string, property: Property, propertyName: string, value: any) {
    }

    /**
     * Generates a string with a graph pattern, that filters the result based on the given values in the findParameters object. 
     * @param properties - List of every proeprty and its prefix
     * @param findParameters? - object, that contains properties and their values to filter the result 
     * @param resourceType - Type of the modelled resource
     */
    public static whereStringFiltered(properties: PropertyList, findParameters: FindParameters, resourceType: string) {
    }

    /**
     * Generates a filtered graph pattern, that only contains triples, based on the given findParameters
     * @param properties 
     * @param findParameters 
     * @param resourceType 
     */
    public static filteredGraphPattern(properties: PropertyList, findParameters: FindParameters, resourceType: string): string {
    }

    /**
     * Generates a string that can be added to a graph pattern to filter the result based on the given identifier.
     * @param schema - schema that provides the necessary information about the model
     * @param identifier 
     */
    public static identifier(schema: Schema, identifier: string): string {
    }

    /**
     * Takes a Property Object of a PropertyList and returns only a single Property if it is an array. This methods is used, because the array
     * will always only contain one Property and is only there to make the Property of type array.
     * @param property
     */
    public static getProperty(property: Property | Property[]): Property {
    }

    /**
     * Used when inserting literals in a triple. If the given property was defined to be of type string,
     * this function returns the value inside two quotation marks.
     * @param findParameters 
     * @param findParam 
     * @param properties 
     */
    public static getValue(findParameters: FindParameters, findParam: string, properties: PropertyList): string {
    }

}

class RDFRequest {

    constructor(private queryUrl: string, private updateUrl: string) {}

    /**
     * Sends a post request, containing the given query, to the specified updateUrl.
     * @param query 
     */
    public async update(query: string) {
    }

    /**
     * Sends a get request, containing the given query, to the specified queryUrl and returns the result.
     * @param query 
     * @param headers 
     */
    public async query(query: string, headers?: object) {
    }

}

interface Schema {
    resourceType: string;
    resourceSchema: string;
    prefixes: PrefixList;
    properties: PropertyList;
}

interface PrefixList {
    [prefix: string]: string,
}

interface PropertyList {
    [propertyName: string]: Property | [Property];
}

interface Property {
    prefix: string;
    optional?: boolean;
    type?: "uri" | "integer";
    ref?: IRDFModel;
    isKey?: boolean;
}

interface PropertyValues {
    identifier: string;
    [propertyName: string]: any;
}

