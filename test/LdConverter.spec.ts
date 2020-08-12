import { assert } from "chai";
import blogData from "../src/BlogTestData";
import { LdConverter } from "../src/LdConverter";
import { JsonLD } from "../src/models/JsonLD";
import { PropertyList, PrefixList } from "../src/models/RDFModel";
import { StringGenerator } from "../src/StringGenerator";

const Blog = blogData.Blog;
const BlogSchema = blogData.BlogSchema;
const Comment = blogData.Comment;

describe("LdConverter", function() {
    before(async function() {
        await (await Blog.create(blogData.exampleBlog1)).save();
        await (await Blog.create(blogData.exampleBlog2)).save();
        await (await Comment.create(blogData.exampleComment1)).save();
        await (await Comment.create(blogData.exampleComment2)).save();
    })
    after(async function() {
        await blogData.Blog.delete();
        await blogData.Comment.delete();
    })
    it("should create an initial LDResource object, which contains valid json-ld based on a PropertyList", async function() {
        const values = blogData.exampleBlog1;

        const converter = new LdConverter(blogData.req, blogData.BlogSchema, {});
        const ldResource = await converter.generateInitialLDResource(values);

        const expectedIdentifier = `${BlogSchema.baseURI}${BlogSchema.resourceType}/${values.identifier}`;
        const expectedType = `${BlogSchema.baseURI}${BlogSchema.resourceType}`;

        assert.isNotNull(ldResource);
        assert.isObject(ldResource);
        assert.equal(ldResource["@id"], expectedIdentifier);
        assert.equal(ldResource["@type"], expectedType);
        assert.equal(ldResource.title, values.title);
        assert.isArray(ldResource.comment);
        assert.lengthOf(ldResource.comment, 1);
        assert.isObject(ldResource["@context"]);

    })
    it("should convert the values of a json-ld object, so that values are literals and no longer objects", async function() {
        const jsonld: JsonLD = {
            "@id": "Testid1",
            "@type": "Testtype1",
            "@context": {},
            "firstname": "Test",
            "lastname": "TestLastname",
            "age": { "@value": 12 },
        }

        const converter = new LdConverter(blogData.req, BlogSchema, {});

        converter.convertLDValues(jsonld);

        assert.equal(jsonld.firstname, "Test");
        assert.equal(jsonld.lastname, "TestLastname");
        assert.equal(jsonld.age, 12);
    })
    it("should build a context object, that can be used in json-ld and return it", function() {
        const converter = new LdConverter(blogData.req, BlogSchema, {});
        const prefixes: PrefixList = {
            "schema": "http://schema.org/",
            "rdf": "http://rdf.com/",
        };
        const properties: PropertyList = {
            firstname: { prefix: "schema" },
            lastname: { prefix: "rdf" },
            age: { prefix: "rdf", type: "integer" },
            knows: { prefix: "schema", type: "uri" }
        }
        const context = converter.buildContext(properties, prefixes); 

        const firstname = StringGenerator.getProperty(properties.firstname);
        const lastname = StringGenerator.getProperty(properties.lastname);
        const age = StringGenerator.getProperty(properties.age);
        const knows = StringGenerator.getProperty(properties.knows);

        assert.isNotNull(context);
        assert.isObject(context);
        assert.isObject(context.firstname);
        assert.isNotNull(context.firstname["@id"]);
        assert.equal(context.firstname["@id"], `${prefixes[firstname.prefix]}firstname`);
        assert.isNotNull(context.lastname["@id"]);
        assert.equal(context.lastname["@id"], `${prefixes[lastname.prefix]}lastname`);
        assert.isNotNull(context.age["@id"]);
        assert.isNotNull(context.age["@type"]);
        assert.equal(context.age["@id"], `${prefixes[age.prefix]}age`);
        assert.equal(context.age["@type"], "http://www.w3.org/2001/XMLSchema#integer");
        assert.isNotNull(context.knows["@id"]);
        assert.isNotNull(context.knows["@type"]);
        assert.equal(context.knows["@id"], `${prefixes[knows.prefix]}knows`);
        assert.equal(context.knows["@type"], "@id");
    })
    it("should populate the comment property of a blog, that contains 2 comments", async function() {
        const blog2 = await Blog.findByIdentifier(blogData.exampleBlog2.identifier);

        assert.equal(blog2.title, blogData.exampleBlog2.title);
        assert.isArray(blog2.comment);
        assert.lengthOf(blog2.comment, 2);
        assert.typeOf(blog2.comment[0], "string");
        assert.typeOf(blog2.comment[1], "string");

        await blog2.populate("comment")

        assert.typeOf(blog2.comment[0], "object");
        assert.typeOf(blog2.comment[1], "object");
    })
    it("should populate all comments in a list of blogs", async function() {
        const blogs = await Blog.find();

        assert.isNotNull(blogs["@graph"]);
        assert.lengthOf(blogs["@graph"], 2);

        assert.isNotNull(blogs["@graph"][0].comment);
        assert.isArray(blogs["@graph"][0].comment);
        assert.isString(blogs["@graph"][0].comment[0]);
        assert.isNotNull(blogs["@graph"][1].comment);
        assert.isArray(blogs["@graph"][1].comment);
        assert.isString(blogs["@graph"][1].comment[0]);

        await blogs.populate("comment");

        assert.isNotNull(blogs["@graph"][0].comment);
        assert.isArray(blogs["@graph"][0].comment);
        assert.isObject(blogs["@graph"][0].comment[0]);
        assert.equal(blogs["@graph"][0].comment[0]["@id"], "http://schema.org/Comment/comment1");
        assert.isNotNull(blogs["@graph"][1].comment);
        assert.isArray(blogs["@graph"][1].comment);
        assert.isObject(blogs["@graph"][1].comment[0]);
        assert.equal(blogs["@graph"][1].comment[0]["@id"], "http://schema.org/Comment/comment1");
    })
})