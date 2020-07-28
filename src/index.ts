import { Schema, PropertyValues } from "./models/RDFModel";
import { RDFRequest } from "./RDFRequest";
import data from "./PersonTestData";
import blogData from "./BlogTestData";

import * as jsonld from "jsonld";
import { RDF, NextFunction } from "./RDF";
import { LDResource } from "./models/JsonLD";
import { StringGenerator } from "./StringGenerator";

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

    // await Person.update({ age: 18, lastname: "TEST" }, { lastname: "Test"});
    await Person.updateByIdentifier("DanielFott", { age: 32 })

    // const main1 = await Main.create({
    //     identifier: "Main1",
    //     firstname: "Main",
    //     knows: "http://schema.org/Sub/sub1"
    // });
    // console.log(main1)
    // await main1.save();

    // const main2 = await Main.create({
    //     identifier: "Main2",
    //     firstname: "zweimain",
    //     knows: { relative: "sub1"} 
    // });
    // console.log(main2)
    // await main2.save();


})()