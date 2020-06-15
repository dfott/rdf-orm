"use strict";
exports.__esModule = true;
var StringGenerator = /** @class */ (function () {
    function StringGenerator() {
    }
    /**
     * Generates the prefix declaration for a SparQL query.
     * @param prefixList - List of every prefix and its corresponding schema url
     */
    StringGenerator.prefixString = function (prefixList) {
        return Object.keys(prefixList).map(function (prefix) {
            return "PREFIX " + prefix + ": <" + prefixList[prefix] + ">";
        }).join("\n");
    };
    /**
     * Generates a string, that will be used in the select clause of a SparQl query to identify the properties that will be
     * returned in the result.
     * @param propertyList - List of every property and its prefix
     */
    StringGenerator.selectString = function (propertyList, resourceType) {
        return Object.keys(propertyList).map(function (propertyName, index) {
            return index == 0 ? "?" + resourceType + " ?" + propertyName : "?" + propertyName;
        }).join(" ").concat(" ?type");
    };
    /**
     * Generates a string, that contains a basic graph pattern and will be in the where clause of a SparQL query.
     * @param properties - List of every property and its prefix
     * @param resourceType - Type of the modelled resource
     */
    StringGenerator.whereString = function (properties, resourceType) {
        return Object.keys(properties).map(function (propertyName) {
            var prefix = properties[propertyName].prefix;
            return "?" + resourceType + " " + prefix + ":" + propertyName + " ?" + propertyName;
        }).join(" .\n").concat(" .\n?" + resourceType + " a ?type .");
    };
    /**
     * Generates a string with multiple RDF Triples, which contain the given propertyNames and values. This string can then
     * be used in a select statement for SparQl
     * @param properties - List of every property and its prefix
     * @param values - List of every property and its value, which will be inserted
     * @param resourceSchema - Schema of the modelled resource
     * @param resourceType - Type of the modelled resource
     */
    StringGenerator.insertString = function (properties, values, resourceSchema, resourceType) {
        var uri = "" + resourceSchema + resourceType + "/" + values.identifier;
        if (!values.identifier) {
            throw Error("Identifier for this resource is missing in the PropertyValues.");
        }
        return Object.keys(values).map(function (propertyName) {
            if (propertyName !== "identifier") {
                var value = typeof values[propertyName] === "string" ? "\"" + values[propertyName] + "\"" : values[propertyName];
                if (!value) {
                    throw Error("No value given for property '" + propertyName + "'.");
                }
                var schema = properties[propertyName];
                if (!schema) {
                    throw Error("Property " + propertyName + " is not part of the defined schema.");
                }
                return "<" + uri + "> " + schema.prefix + ":" + propertyName + " " + value;
            }
            else {
                // the identifier is not inserted into the triplestore as a property. instead of inserting it, we will insert
                // a tuple which defined the type of the resource
                return "<" + uri + "> a <" + resourceSchema + resourceType + ">";
            }
        }).join(" .\n").concat(" .");
    };
    StringGenerator.whereStringFiltered = function (properties, findParameters, resourceType) {
        return Object.keys(findParameters).map(function (findParam) {
            var property = properties[findParam];
            if (!property)
                throw Error("Cannot filter by property " + findParam + " as it is not a property of type " + resourceType + ".");
            var value = typeof findParameters[findParam] === "string" ? "\"" + findParameters[findParam] + "\"" : findParameters[findParam];
            return "?" + resourceType + " " + property.prefix + ":" + findParam + " " + value + " .";
        }).join("\n");
    };
    StringGenerator.identifier = function (schema, identifier) {
        var firstProp = Object.keys(schema.properties)[0];
        var firstPropPrefix = schema.properties[firstProp].prefix;
        return "<" + schema.resourceSchema + schema.resourceType + "/" + identifier + "> " + firstPropPrefix + ":" + firstProp + " ?" + firstProp;
    };
    return StringGenerator;
}());
exports.StringGenerator = StringGenerator;
