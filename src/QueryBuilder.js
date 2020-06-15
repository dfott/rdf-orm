"use strict";
exports.__esModule = true;
var StringGenerator_1 = require("./StringGenerator");
var QueryBuilder = /** @class */ (function () {
    function QueryBuilder(schema, values) {
        this.schema = schema;
        this.values = values;
    }
    /**
     * Builds an insert query.
     */
    QueryBuilder.prototype.buildInsert = function () {
        return (StringGenerator_1.StringGenerator.prefixString(this.schema.prefixes) + "\n\n")
            .concat("INSERT DATA {\n")
            .concat(StringGenerator_1.StringGenerator.insertString(this.schema.properties, this.values, this.schema.resourceSchema, this.schema.resourceType))
            .concat("\n}");
    };
    /**
     * Builds an update query, which deletes and then reinserts every tupel used to describe the resource
     * @param values - values for every property of the model
     */
    QueryBuilder.prototype.buildUpdate = function (values) {
        var whereGraphPattern = StringGenerator_1.StringGenerator.whereString(this.schema.properties, this.schema.resourceType);
        return (StringGenerator_1.StringGenerator.prefixString(this.schema.prefixes) + "\n\n")
            .concat("delete {\n")
            .concat("" + whereGraphPattern)
            .concat("\n}\n")
            .concat("insert {\n")
            .concat(StringGenerator_1.StringGenerator.insertString(this.schema.properties, values, this.schema.resourceSchema, this.schema.resourceType))
            .concat("\n}\n")
            .concat("where {\n")
            .concat(whereGraphPattern + "\n")
            .concat(StringGenerator_1.StringGenerator.identifier(this.schema, values.identifier))
            .concat("\n}");
    };
    /**
     * Builds a find query, which would find every tupel that is modelled by the given schema
     * @param schema - schema that provides the necessary information about the model
     */
    QueryBuilder.buildFind = function (schema) {
        return (StringGenerator_1.StringGenerator.prefixString(schema.prefixes) + "\n\n")
            .concat("construct {\n")
            .concat(StringGenerator_1.StringGenerator.whereString(schema.properties, schema.resourceType) + "\n")
            .concat("}\n")
            .concat("where {\n")
            .concat(StringGenerator_1.StringGenerator.whereString(schema.properties, schema.resourceType) + "\n")
            .concat("}");
    };
    /**
     * Builds a find query, which would find tupels, that are modelled by the given schema, based on the given property values in the findParameters object
     * @param schema - schema that provides the necessary information about the model
     * @param findParameters - object, that contains properties and their values to filter the result
     */
    QueryBuilder.buildFindFiltered = function (schema, findParameters) {
        return (StringGenerator_1.StringGenerator.prefixString(schema.prefixes) + "\n\n")
            .concat("construct {\n")
            .concat(StringGenerator_1.StringGenerator.whereString(schema.properties, schema.resourceType) + "\n")
            .concat("}\n")
            .concat("where {\n")
            .concat(StringGenerator_1.StringGenerator.whereString(schema.properties, schema.resourceType) + "\n")
            .concat(StringGenerator_1.StringGenerator.whereStringFiltered(schema.properties, findParameters, schema.resourceType) + "\n")
            .concat("}");
    };
    /**
     * Builds a find query, which would find tupels, that describe the resource with the given identifier.
     * @param schema - schema that provides the necessary information about the model
     * @param identifier
     */
    QueryBuilder.buildFindByIdentifier = function (schema, identifier) {
        var graphPattern = StringGenerator_1.StringGenerator.whereString(schema.properties, schema.resourceType);
        var whereString = (graphPattern + "\n")
            .concat(StringGenerator_1.StringGenerator.identifier(schema, identifier));
        return (StringGenerator_1.StringGenerator.prefixString(schema.prefixes) + "\n\n")
            .concat("construct {\n")
            .concat(StringGenerator_1.StringGenerator.whereString(schema.properties, schema.resourceType) + "\n")
            .concat("}\n")
            .concat("where {\n")
            .concat(whereString + "\n")
            .concat("}");
    };
    /**
     * Builds a delete query, which would delete every tupel that is modelled by the given schema
     * @param schema - schema that provides the necessary information about the model
     */
    QueryBuilder.buildDelete = function (schema) {
        var whereGraphPattern = StringGenerator_1.StringGenerator.whereString(schema.properties, schema.resourceType);
        return (StringGenerator_1.StringGenerator.prefixString(schema.prefixes) + "\n\n")
            .concat("delete {\n")
            .concat(whereGraphPattern)
            .concat("\n} where {\n")
            .concat(whereGraphPattern)
            .concat("\n}");
    };
    /**
     * Builds a find query, which would delete tupels, that are modelled by the given schema, based on the given property values in the findParameters object
     * @param schema - schema that provides the necessary information about the model
     * @param findParameters - object, that contains properties and their values to filter the result
     */
    QueryBuilder.buildDeleteFiltered = function (schema, findParameters) {
        var whereGraphPattern = StringGenerator_1.StringGenerator.whereString(schema.properties, schema.resourceType);
        return (StringGenerator_1.StringGenerator.prefixString(schema.prefixes) + "\n\n")
            .concat("delete {\n")
            .concat(whereGraphPattern)
            .concat("\n} where {\n")
            .concat(whereGraphPattern)
            .concat(StringGenerator_1.StringGenerator.whereStringFiltered(schema.properties, findParameters, schema.resourceType) + "\n")
            .concat("\n}");
    };
    /**
     * Builds a delete query, which would delete tupels, that describe the resource with the given identifier.
     * @param schema - schema that provides the necessary information about the model
     * @param identifier
     */
    QueryBuilder.buildDeleteByIdentifier = function (schema, identifier) {
        var whereGraphPattern = StringGenerator_1.StringGenerator.whereString(schema.properties, schema.resourceType);
        var firstProp = Object.keys(schema.properties)[0];
        var firstPropPrefix = schema.properties[firstProp].prefix;
        var whereString = (whereGraphPattern + "\n")
            .concat("<" + schema.resourceSchema + schema.resourceType + "/" + identifier + "> " + firstPropPrefix + ":" + firstProp + " ?" + firstProp);
        return (StringGenerator_1.StringGenerator.prefixString(schema.prefixes) + "\n\n")
            .concat("delete {\n")
            .concat(whereGraphPattern)
            .concat("\n} where {\n")
            .concat(whereString)
            .concat("\n}");
    };
    return QueryBuilder;
}());
exports.QueryBuilder = QueryBuilder;
