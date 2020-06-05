import { PrefixList, PropertyList, PropertyValues } from "./Model";

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
     * Generates a string, that contains a basic graph pattern and will be in the where clause of a SparQL query. 
     * @param properties - List of every property and its prefix
     * @param resourceType - Type of the modelled resource
     */
    public static whereString(properties: PropertyList, resourceType: string): string {
        return Object.keys(properties).map((propertyName: string) => {
            const prefix = properties[propertyName].prefix
            return `?${resourceType} ${prefix}:${propertyName} ?${propertyName}`;
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
                const value = typeof values[propertyName] === "string" ? `"${values[propertyName]}"` : values[propertyName];
                if (!value) { throw Error(`No value given for property '${propertyName}'.`) }
                const schema = properties[propertyName];
                if (!schema) { throw Error(`Property ${propertyName} is not part of the defined schema.`) }
                return `<${uri}> ${schema.prefix}:${propertyName} ${value}`;
            } else {
                // the identifier is not inserted into the triplestore as a property. instead of inserting it, we will insert
                // a tuple which defined the type of the resource
                return `<${uri}> a <${resourceSchema}${resourceType}>`;
            }
        }).join(" .\n").concat(" .");
    }

}
