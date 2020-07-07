import { Schema, PropertyValues } from "./models/RDFModel";
import { RDFRequest } from "./RDFRequest";
import data from "./PersonTestData";
import blogData from "./BlogTestData";

import * as jsonld from "jsonld";
import { RDF, NextFunction } from "./RDF";
import { LDResource } from "./models/JsonLD";

const prefixes = {
    "rdf": "http://rdf.com/",
    "schema": "http://schema.org/",
    "bayer": "http://10.122.106.16:3000/"
};


const PersonSchema = data.personSchema;

const req = new RDFRequest("http://localhost:3030/test/query", "http://localhost:3030/test/update");

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

Person.pre("save", (next: NextFunction, values?: LDResource) => {
    if (values) {
        if (values.firstname) {
            values.firstname = "Leinad"
        }
    }
    console.log(values);
    next();
});

(async function() {


    const daniel = await Person.create({
        identifier: "DanielFott", firstname: "Daniel", lastname: "Fott", age: 20
    });

    await daniel.save();

    console.log(
        await Person.find()
    )

    console.log("hallo")


})()