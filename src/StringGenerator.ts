import { PrefixList, PropertyList, PropertyValues, FindParameters, Schema } from "./RDF";

export class StringGenerator {

    /**
     * Generates the prefix declaration for a SparQL query.
     * @param prefixList - List of every prefix and its corresponding schema url
     */
    public static prefixString(prefixList: PrefixList): string {
        return Object.keys(prefixList).map((prefix: string) => {
            return `PREFIX ${prefix}: <${prefixList[prefix]}>`;
        }).join("\n");
    }

    /**
     * Generates a string, that will be used in the select clause of a SparQl query to identify the properties that will be 
     * returned in the result.
     * @param propertyList - List of every property and its prefix
     */
    public static selectString(propertyList: PropertyList, resourceType: string): string {
        return Object.keys(propertyList).map((propertyName: string, index: number) => {
            return index == 0 ? `?${resourceType} ?${propertyName}` : `?${propertyName}`;
        }).join(" ").concat(" ?type");
    }

    /**
     * Generates a string, that contains a basic graph pattern and will be in the construct clause of a SparQL query. 
     * @param properties - List of every property and its prefix
     * @param resourceType - Type of the modelled resource
     */
    public static constructString(properties: PropertyList, resourceType: string): string {
        return Object.keys(properties).map((propertyName: string) => {
            const prefix = properties[propertyName].prefix
            return `?${resourceType} ${prefix}:${propertyName} ?${propertyName}`;
        }).join(" .\n").concat(` .\n?${resourceType} a ?type .`);
    }

    /**
     * Generates a string, that contains a basic graph pattern including optional tupels and will be in the where clause of a SparQL query. 
     * @param properties - List of every property and its prefix
     * @param resourceType - Type of the modelled resource
     */
    public static whereString(properties: PropertyList, resourceType: string): string {
        return Object.keys(properties).map((propertyName: string) => {
            const prefix = properties[propertyName].prefix
            const tupel = `?${resourceType} ${prefix}:${propertyName} ?${propertyName}`;
            return properties[propertyName].optional ? `OPTIONAL { ${tupel} }` : tupel;
        }).join(" .\n").concat(` .\n?${resourceType} a ?type .`);
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
        const uri = `${resourceSchema}${resourceType}/${values.identifier}`;
        if (!values.identifier) { throw Error("Identifier for this resource is missing in the PropertyValues.") }
        return Object.keys(values).map((propertyName: string) => {
            if (propertyName !== "identifier") {
                const schema = properties[propertyName];
                const property = properties[propertyName];
                if (property.type === "uri" && property.ref) {
                    const rdfObject = `${property.ref.schema?.resourceSchema}${property.ref.schema?.resourceType}/${values[propertyName]}` 
                    return `<${uri}> ${schema.prefix}:${propertyName} <${rdfObject}>`
                } else {
                    const value = typeof values[propertyName] === "string" ? `"${values[propertyName]}"` : values[propertyName];
                    if (!value) { throw Error(`No value given for property '${propertyName}'.`) }
                    if (!schema) { throw Error(`Property ${propertyName} is not part of the defined schema.`) }
                    return `<${uri}> ${schema.prefix}:${propertyName} ${value}`;
                }
            } else {
                // the identifier is not inserted into the triplestore as a property. instead of inserting it, we will insert
                // a tuple which defined the type of the resource
                return `<${uri}> a <${resourceSchema}${resourceType}>`;
            }
        }).join(" .\n").concat(" .");
    }

    /**
     * Generates a string with a graph pattern, that filters the result based on the given values in the findParameters object. 
     * @param properties - List of every proeprty and its prefix
     * @param findParameters? - object, that contains properties and their values to filter the result 
     * @param resourceType - Type of the modelled resource
     */
    public static whereStringFiltered(properties: PropertyList, findParameters: FindParameters, resourceType: string) {
        return Object.keys(findParameters).map((findParam: string) => {
            const property = properties[findParam];
            if (!property) throw Error(`Cannot filter by property ${findParam} as it is not a property of type ${resourceType}.`)
            const value = typeof findParameters[findParam] === "string" ? `"${findParameters[findParam]}"` : findParameters[findParam];
            return `?${resourceType} ${property.prefix}:${findParam} ${value} .`;
        }).join("\n")
    }

    /**
     * Generates a string that can be added to a graph pattern to filter the result based on the given identifier.
     * @param schema - schema that provides the necessary information about the model
     * @param identifier 
     */
    public static identifier(schema: Schema, identifier: string): string {
        const firstProp = Object.keys(schema.properties)[0];
        const firstPropPrefix = schema.properties[firstProp].prefix;
        return `<${schema.resourceSchema}${schema.resourceType}/${identifier}> ${firstPropPrefix}:${firstProp} ?${firstProp}`;
    }

}
