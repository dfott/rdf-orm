import { RDFRequest } from "./RDFRequest";
import { RDF, Schema } from "./RDF";

import data from "./PersonTestData"

const req = new RDFRequest("http://localhost:3030/person/query", "http://localhost:3030/person/update");
const Person = RDF.createModel(data.personSchemaAdvanced, req);

const prefixList = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "owl": "http://www.w3.org/2002/07/owl#",
    "schema": "http://schema.org/",
};

const resourceSchema = prefixList.schema;
const resourceType = "Person";

const propertyListAdvanced = {
    firstname: { prefix: "rdf" },
    lastname: { prefix: "rdf" },
    knows: { prefix: "rdf", optional: true, type: this },
};

const personSchemaAdvanced: Schema = {
    resourceSchema,
    resourceType,
    prefixes: prefixList,
    properties: propertyListAdvanced
}

console.log(personSchemaAdvanced.properties.knows)