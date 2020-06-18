import { Schema, RDF } from "./RDF";
import { RDFRequest } from "./RDFRequest";

const prefixes = {
    "rdf": "http://rdf.com/",
    "schema": "http://schema.org/",
    "bayer": "http://10.122.106.16:3000/"
};

const CommentSchema: Schema = {
    resourceSchema: prefixes.bayer,
    resourceType: "Comment",
    prefixes,
    properties: {
        content: { prefix: "rdf" }
    }
}

const req = new RDFRequest("http://localhost:3030/testblog/query", "http://localhost:3030/testblog/update");

const Comment = RDF.createModel(CommentSchema, req);

const BlogSchema: Schema = {
    resourceSchema: prefixes.bayer,
    resourceType: "Blog",
    prefixes,
    properties: {
        title: { prefix: "rdf" },
        comment: { type: "uri", ref: Comment, prefix: "rdf", optional: true}
    }
}

const Blog = RDF.createModel(BlogSchema, req);

const comment1 = Comment.create({ content: "Dies ist ein kommentar", identifier: "comment1"})
const blog1 = Blog.create({ identifier: "Blog1", title: "Mein erster Blog", comment: "comment1"})

// comment1.save();
// blog1.save();

Blog.find().then(res => {
    console.log(res.result)
    res.populate("comment").then(res2 => {
        if (res2) {
            console.log(res2.result)
        }
    })
})

