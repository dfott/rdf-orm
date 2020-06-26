import { assert } from "chai";
import blogData from "../src/BlogTestData";
import { LdConverter } from "../src/LdConverter";
import { JsonLD } from "../src/models/JsonLD";

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
    it("should create a LDResource object, which contains valid json-ld based on a PropertyList", async function() {
        const values = blogData.exampleBlog1;

        const converter = new LdConverter(blogData.req, blogData.BlogSchema, {});
        const ldResource = await converter.generateInitialLDResource(values);

        const expectedIdentifier = `${BlogSchema.resourceSchema}${BlogSchema.resourceType}/${values.identifier}`;
        const expectedType = `${BlogSchema.resourceSchema}${BlogSchema.resourceType}`;

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
    it("should populate the comment property of a blog, that contains 2 comments", async function() {
        const blog2 = await Blog.findByIdentifier(blogData.exampleBlog2.identifier);

        assert.equal(blog2.title, blogData.exampleBlog2.title);
        assert.isArray(blog2.comment);
        assert.lengthOf(blog2.comment, 2);
        assert.typeOf(blog2.comment[0], "string");
        assert.typeOf(blog2.comment[1], "string");

        await blog2.populate("comment")

        if (blog2.result) {
            assert.typeOf(blog2.comment[0], "object");
            assert.typeOf(blog2.comment[1], "object");
        }
    })
})