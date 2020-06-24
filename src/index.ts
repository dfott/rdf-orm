import { Schema, RDF } from "./RDF";
import { RDFRequest } from "./RDFRequest";
import data from "./PersonTestData";
import blogData from "./BlogTestData";

import * as jsonld from "jsonld";
import { JsonLD } from "./RDFResult";
import { LdConverter } from "./LdConverter";

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


(async function() {


    const blogs = await Blog.find();

    await blogs.populate("comment")

    const [ blog1, blog2 ] = blogs["@graph"];

    console.log(blog1)
    console.log(blog2)

    // blog1.title = "Zweiter veränderter title....";

    // await blog1.save();
    

})()