import { PrefixList, PropertyList, PropertyValues, FindParameters, Schema, Property } from "./RDF";

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
            const prefix = (properties[propertyName] as Property).prefix || (properties[propertyName] as Property[])[0].prefix
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
            const prefix = this.getProperty(properties[propertyName]).prefix
            const tupel = `?${resourceType} ${prefix}:${propertyName} ?${propertyName}`;
            return this.getProperty(properties[propertyName]).optional ? `OPTIONAL { ${tupel} }` : tupel;
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

        // !TODO find a new method to get the full identifier
        values.identifier = values.identifier.replace(resourceSchema, "").replace(`${resourceType}/`, "");
        let uri = `${resourceSchema}${resourceType}/${values.identifier}`;

        if (!values.identifier) { throw Error("Identifier for this resource is missing in the PropertyValues.") }
        const statementList: string[] = [];
        Object.keys(values).forEach((propertyName: string) => {
            if (propertyName !== "identifier") {
                const property = this.getProperty(properties[propertyName]);
                // const propertyPrefix = property.prefix;
                if(!Array.isArray(properties[propertyName])) {
                    this.pushValueToStatements(statementList, uri, property, propertyName, values[propertyName]);
                } else {
                    if (!Array.isArray(values[propertyName])) { throw Error(`Property ${propertyName} was specified to be an array.`) }
                    (values[propertyName] as any[]).forEach(value => {
                        this.pushValueToStatements(statementList, uri, property, propertyName, value);
                    })
                }
            } else {
                // the identifier is not inserted into the triplestore as a property. instead of inserting it, we will insert
                // a tuple which defined the type of the resource
                statementList.push(`<${uri}> a <${resourceSchema}${resourceType}>`);
            }
        });
        return statementList.join(" .\n").concat(" .");
    }

    private static pushValueToStatements(statementList: string[], uri: string, property: Property, propertyName: string, value: any) {
        if (property.type === "uri" && property.ref) {
            const rdfObject = `${property.ref.schema?.resourceSchema}${property.ref.schema?.resourceType}/${value}` 
            statementList.push(`<${uri}> ${property.prefix}:${propertyName} <${rdfObject}>`);
        } else {
            if (property.type !== "integer") {
                value = typeof value === "string" ? `"${value}"` : value;
            }
            if (!value) { throw Error(`No value given for property '${propertyName}'.`) }
            if (!property) { throw Error(`Property ${propertyName} is not part of the defined schema.`) }
            statementList.push(`<${uri}> ${property.prefix}:${propertyName} ${value}`);
        }
    }

    /**
     * Generates a string with a graph pattern, that filters the result based on the given values in the findParameters object. 
     * @param properties - List of every proeprty and its prefix
     * @param findParameters? - object, that contains properties and their values to filter the result 
     * @param resourceType - Type of the modelled resource
     */
    public static whereStringFiltered(properties: PropertyList, findParameters: FindParameters, resourceType: string) {
        return Object.keys(findParameters).map((findParam: string) => {
            const property = this.getProperty(properties[findParam]);
            if (!property) throw Error(`Cannot filter by property ${findParam} as it is not a property of type ${resourceType}.`)
            // const value = typeof findParameters[findParam] === "string" ? `"${findParameters[findParam]}"` : findParameters[findParam];
            const value = this.getValue(findParameters, findParam, properties);
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
        const firstPropPrefix = this.getProperty(schema.properties[firstProp]).prefix;
        return `<${schema.resourceSchema}${schema.resourceType}/${identifier}> ${firstPropPrefix}:${firstProp} ?${firstProp}`;
    }

    /**
     * Takes a Property Object of a PropertyList and returns only a single Property if it is an array. This methods is used, because the array
     * will always only contain one Property and is only there to make the Property of type array.
     * @param property
     */
    public static getProperty(property: Property | Property[]): Property {
        const prop = (property as Property) || (property as Property[])
        return Array.isArray(prop) ? prop[0] : prop
    }

    public static getValue(findParameters: FindParameters, findParam: string, properties: PropertyList): string {
        const propDef = this.getProperty(properties[findParam]);
        const val = findParameters[findParam];
        return propDef.type === "integer" ? `${val}` : `"${val}"`;
    }

}
