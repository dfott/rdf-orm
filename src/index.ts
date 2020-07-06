import { Schema } from "./models/RDFModel";
import { RDFRequest } from "./RDFRequest";
import data from "./PersonTestData";
import blogData from "./BlogTestData";

import * as jsonld from "jsonld";
import { RDF } from "./RDF";

const prefixes = {
    "rdf": "http://rdf.com/",
    "schema": "http://schema.org/",
    "bayer": "http://10.122.106.16:3000/"
};


const PersonSchema = data.personSchema;

const req = new RDFRequest("http://localhost:3030/person/query", "http://localhost:3030/person/update");

const Person = RDF.createModel(PersonSchema, req);

const Blog = RDF.createModel(blogData.BlogSchema, req);
const Comment = RDF.createModel(blogData.CommentSchema, req);

const reqPerson = new RDFRequest("http://localhost:3030/testblog/query", "http://localhost:3030/testblog/update");

const SubSchema: Schema = {
    resourceSchema: prefixes.schema,
    resourceType: "Sub",
    prefixes,
    properties: {
        firstname: { prefix: "rdf" }
    }
};

const Sub = RDF.createModel(SubSchema, reqPerson);

const MainSchema: Schema = {
    resourceType: "Main",
    resourceSchema: prefixes.schema,
    prefixes,
    properties: {
        firstname: { prefix: "rdf" },
        knows: { prefix: "rdf", type: "uri", ref: Sub }
    }
}

const Main = RDF.createModel(MainSchema, reqPerson);



(async function() {

    try {
    const people = await Person.find({}, 
        (nquads) => console.log(nquads),
        );
    console.log(people)
    } catch (e) {
        console.log(e)
    }



})()