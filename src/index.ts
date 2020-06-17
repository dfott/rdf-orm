import { RDFRequest } from "./RDFRequest";
import { RDF, Schema } from "./RDF";

import data from "./PersonTestData"
import { RDFResult } from "./RDFResult";

const req = new RDFRequest("http://localhost:3030/person/query", "http://localhost:3030/person/update");
const Person = RDF.createModel(data.personSchemaAdvanced, req);

const prefixList = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "owl": "http://www.w3.org/2002/07/owl#",
    "schema": "http://schema.org/",
};

const CommentSchema: Schema = {
    prefixes: prefixList,
    resourceSchema: prefixList.schema,
    resourceType: "Comment",
    properties: {
        content: { prefix: "rdf" }
    }
}

const Comment = RDF.createModel(CommentSchema, req);

const BlogSchema: Schema = {
    prefixes: prefixList,
    resourceSchema: prefixList.schema,
    resourceType: "Blog",
    properties: {
        title: { prefix: "schema" },
        comment: [{ prefix: "schema", optional: true, type: "uri", ref: Comment}]
    }
}

const Blog = RDF.createModel(BlogSchema, req);

const blog1 = Blog.create({
    identifier: "Blog1", title: "Mein zweiter Blog", comment: ["comment1", "comment2"]
});

// blog1.save().then(_ => {
// });

Blog.find().then((res: RDFResult) => {
    // console.log(res.query)
    // console.log(res)
    res.populate("comment").then(res => {
        console.log(res?.result);
    }) 
})

// const c1 = Comment.create({
//     identifier: "comment1", content:"Im the first comment"
// });
// c1.save();

// const c2 = Comment.create({
//     identifier: "comment2", content: "Im the second comment ever!"
// })
// c2.save()


// console.log(personSchemaAdvanced.properties.knows)