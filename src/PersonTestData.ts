import {  FindParameters } from "./RDF";
import { RDFRequest } from "./RDFRequest";
import { PrefixList, PropertyList, PropertyValues, Schema } from "./models/RDFModel";

const prefixList = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "owl": "http://www.w3.org/2002/07/owl#",
    "schema": "http://schema.org/",
} as PrefixList;

const propertyList = {
    firstname: { prefix: "rdf" },
    lastname: { prefix: "rdf" },
    age: { prefix: "schema", type: "integer" }
} as PropertyList;

const danielValues = {
    identifier: "DanielFott",
    firstname: "Daniel",
    lastname: "Fott",
    age: 20
} as PropertyValues;

const peterValues = {
    identifier: "PeterTest",
    firstname: "Peter",
    lastname: "Test",
    age: 40
} as PropertyValues;

const guterValues = {
    identifier: "GuterTest",
    firstname: "Guter",
    lastname: "Test",
    age: 20
} as PropertyValues;

const findParameterList = {
    age: 20,
} as FindParameters

const baseURI = prefixList.schema;
const resourceType = "Person";

const request = new RDFRequest("http://localhost:3030/test/query", "http://localhost:3030/test/update");
// const request = new RDFRequest("http://localhost:9999/bigdata/sparql", "http://localhost:9999/bigdata/sparql");

const personSchema: Schema = {
    baseURI,
    resourceType,
    prefixes: prefixList,
    properties: propertyList
};

const propertyListAdvanced: PropertyList = {
    firstname: { prefix: "rdf" },
    lastname: { prefix: "rdf" },
    knows: { prefix: "rdf", optional: true },
};

const personSchemaAdvanced: Schema = {
    baseURI,
    resourceType,
    prefixes: prefixList,
    properties: propertyListAdvanced
}

export default {
    prefixList,
    propertyList,
    baseURI,
    findParameterList,
    resourceType,
    personSchema,
    personSchemaAdvanced,
    request,
    danielValues,
    peterValues,
    guterValues,
};

