import { assert } from "chai";
import blogData from "../src/BlogTestData";
import BlogTestData from "../src/BlogTestData";

describe("RDFResult", function() {
    before(async function() {
        await (await blogData.Blog.create(blogData.exampleBlog1)).save();
        await (await blogData.Blog.create(blogData.exampleBlog2)).save();
        await (await blogData.Comment.create(blogData.exampleComment1)).save();
        await (await blogData.Comment.create(blogData.exampleComment2)).save();
    })
    after(async function() {
        await blogData.Blog.delete();
        await blogData.Comment.delete();
    })
    it("should populate the comment property of a blog, that contains 2 comments", async function() {
        const blog2 = await blogData.Blog.findByIdentifier(blogData.exampleBlog2.identifier);

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