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

    const main = await Main.find();
    // await main.populate("knows")
    const mainOne = main["@graph"][0]
    // const mainPopulate = main.populate("knows")
    const mainPopulated = await mainOne.populate("knows")

    console.log(
        mainOne, mainPopulated
    )


})()