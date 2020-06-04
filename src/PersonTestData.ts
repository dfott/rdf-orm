import { PrefixList, PropertyList, PropertyValues, Schema } from "./Model";

const prefixList = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "owl": "http://www.w3.org/2002/07/owl#",
    "schema": "http://schema.org/",
} as PrefixList;

const propertyList = {
    firstname: { prefix: "rdf" },
    lastname: { prefix: "rdf" },
    age: { prefix: "s" }
} as PropertyList;

const propertyValues = {
    identifier: "DanielFott",
    firstname: "Daniel",
    lastname: "Fott",
    age: 20
} as PropertyValues;

const resourceSchema = prefixList.schema;
const resourceType = "Person";

const personSchema = {
    resourceSchema,
    resourceType,
    prefixes: prefixList,
    properties: propertyList
} as Schema;

export default {
    prefixList,
    propertyList,
    propertyValues,
    resourceSchema,
    resourceType,
    personSchema,
};

