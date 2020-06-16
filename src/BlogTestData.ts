import { Schema, RDF } from "./RDF";
import { RDFRequest } from "./RDFRequest";

const prefixes = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "owl": "http://www.w3.org/2002/07/owl#",
    "schema": "http://schema.org/",
}

const req = new RDFRequest("http://localhost:3030/testblog/query", "http://localhost:3030/testblog/update");

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
        comment: { prefix: "schema", optional: true, type: "uri", ref: Comment}
    }
}

const Blog = RDF.createModel(BlogSchema, req);

export default {
    req,
    CommentSchema,
    BlogSchema,
    Blog,
    Comment
}