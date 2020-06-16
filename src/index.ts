import { RDFRequest } from "./RDFRequest";
import { RDF, Schema } from "./RDF";

import data from "./PersonTestData"

const Person = RDF.createModel(data.personSchemaAdvanced, req);

const prefixList = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "owl": "http://www.w3.org/2002/07/owl#",
    "schema": "http://schema.org/",
};


// console.log(personSchemaAdvanced.properties.knows)