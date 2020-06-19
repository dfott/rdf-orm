import { Schema, RDF } from "./RDF";
import { RDFRequest } from "./RDFRequest";

const prefixes = {
    "rdf": "http://rdf.com/",
    "schema": "http://schema.org/",
    "bayer": "http://10.122.106.16:3000/"
};


const CommentSchema: Schema = {
    resourceType: "Comment",
    resourceSchema: prefixes.rdf,
    prefixes,
    properties: {
        content: {
            prefix: "schema"
        }
    }
}

const request = new RDFRequest("http://localhost:3030/testblog/query", "http://localhost:3030/testblog/update");

const Comment = RDF.createModel(CommentSchema, request);

// const comment1 = Comment.create({ content: "Dies ist mein Kommentar", identifier: "comment1"})

const BlogSchema: Schema = {
    resourceType: "Blog",
    resourceSchema: prefixes.rdf,
    prefixes,
    properties: {
        title: { prefix: "rdf"},
        comment: [{ type: "uri", ref: Comment, optional: true, prefix: "rdf" }]
    }
}

const Blog = RDF.createModel(BlogSchema, request);

const blog1 = Blog.create({ identifier: "Blog1", title: "Mein Blog", comment: ["comment1"]})