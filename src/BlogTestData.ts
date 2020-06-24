import { Schema, RDF, PropertyValues, Property } from "./RDF";
import { RDFRequest } from "./RDFRequest";

const prefixes = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "owl": "http://www.w3.org/2002/07/owl#",
    "schema": "http://schema.org/",
}

const req = new RDFRequest("http://localhost:3030/testblog/query", "http://localhost:3030/testblog/update");
// const req = new RDFRequest("http://localhost:3030/person/query", "http://localhost:3030/person/update");

const CommentSchema: Schema = {
    prefixes: prefixes,
    resourceSchema: prefixes.schema,
    resourceType: "Comment",
    properties: {
        content: { prefix: "rdf" }
    }
}

const Comment = RDF.createModel(CommentSchema, req);

const BlogSchema: Schema = {
    prefixes: prefixes,
    resourceSchema: prefixes.schema,
    resourceType: "Blog",
    properties: {
        title: { prefix: "schema" },
        comment: [{ prefix: "schema", optional: true, type: "uri", ref: Comment}]
    }
}

const CommentArrayProperty: Property = {
    prefix: "schema", optional: true, type: "uri", ref: Comment
}

const Blog = RDF.createModel(BlogSchema, req);

const exampleBlog1: PropertyValues = {
    identifier: "blog1",
    title: "Mein erster Blog",
    comment: ["comment1"],
}

const exampleBlog2: PropertyValues = {
    identifier: "blog2",
    title: "Mein zweiter Blog",
    comment: ["comment1", "comment2"],
}

const exampleComment1: PropertyValues = {
    identifier: "comment1",
    content: "Der erste Kommentar",
}

const exampleComment2: PropertyValues = {
    identifier: "comment2",
    content: "Der zweitee Kommentar",
}

export default {
    req,
    CommentSchema,
    BlogSchema,
    Blog,
    CommentArrayProperty,
    Comment,
    exampleBlog1,
    exampleBlog2,
    exampleComment1,
    exampleComment2,
}