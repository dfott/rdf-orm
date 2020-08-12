import { assert } from "chai";
import { StringGenerator } from "../src/StringGenerator";
import data from "../src/PersonTestData";
import blogData from "../src/BlogTestData";


describe("StringGenerator", function() {
    it("should generate a prefix string, that correctly defines every given prefix and the corresponding schema", function() {
        const expectedPrefixString = 
`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX schema: <http://schema.org/>`;

        assert.equal(StringGenerator.prefixString(data.prefixList), expectedPrefixString);
    })

    it("should generate a select string, which would identify every available property in the select clause of a SparQL query", function() {
        const expectedSelectionString = "?Person ?firstname ?lastname ?age ?type";
        assert.equal(StringGenerator.selectString(data.propertyList, data.resourceType), expectedSelectionString);
    })

    it("should generate a basic graph pattern where string, which will be used in the where clause of a SparQL query to match it against the specified graph", function() {
        const expectedWhereString = 
`?Person rdf:firstname ?firstname .
?Person rdf:lastname ?lastname .
?Person schema:age ?age .
?Person a ?type .`;
        assert.equal(StringGenerator.whereString(data.propertyList, data.resourceType), expectedWhereString);
    })

    it("should generate a basic graph pattern where string with an optional tupel", function() {
        const expectedWhereString = `?${data.personSchemaAdvanced.resourceType} rdf:firstname ?firstname .\n`
            .concat(`?${data.personSchemaAdvanced.resourceType} rdf:lastname ?lastname .\n`)
            .concat(`OPTIONAL { ?${data.personSchemaAdvanced.resourceType} rdf:knows ?knows } .\n`)
            .concat(`?${data.personSchemaAdvanced.resourceType} a ?type .`)
        assert.equal(StringGenerator.whereString(data.personSchemaAdvanced.properties, data.personSchemaAdvanced.resourceType), expectedWhereString);
    })

    it("should generate a basic graph pattern, that will construct all tupels based on the given properties", function() {
        const expectedConstructString = `?${data.personSchemaAdvanced.resourceType} rdf:firstname ?firstname .\n`
            .concat(`?${data.personSchemaAdvanced.resourceType} rdf:lastname ?lastname .\n`)
            .concat(`?${data.personSchemaAdvanced.resourceType} rdf:knows ?knows .\n`)
            .concat(`?${data.personSchemaAdvanced.resourceType} a ?type .`)
        assert.equal(StringGenerator.constructString(data.personSchemaAdvanced.properties, data.personSchemaAdvanced.resourceType), expectedConstructString);
    })

    it("should generate an insert string with RDF triples, that will be inserted into a triplestore", function() {
        const uri = `${data.baseURI}${data.resourceType}/${data.danielValues.identifier}`;
        const expectedInsertString = 
`<${uri}> a <${data.baseURI}${data.resourceType}> .
<${uri}> rdf:firstname "${data.danielValues.firstname}" .
<${uri}> rdf:lastname "${data.danielValues.lastname}" .
<${uri}> schema:age ${data.danielValues.age} .`

        const insertResult = StringGenerator.insertString(data.propertyList, data.danielValues, data.baseURI, data.resourceType)

        assert.equal(insertResult, expectedInsertString);
    });

    it("should generate an insert string, which correctly inserts an uri", function() {
        const blog = blogData.BlogSchema;
        const comment = blogData.CommentSchema;
        const blogValues = blogData.exampleBlog1;
        const uri = `${blog.baseURI}${blog.resourceType}/${blogValues.identifier}`;

        const expectedInsertString = `<${uri}> a <${blog.baseURI}${blog.resourceType}> .\n`
            .concat(`<${uri}> schema:title "${blogValues.title}" .\n`)
            .concat(`<${uri}> schema:comment <${blogValues.comment[0]}> .`);

        assert.equal(StringGenerator.insertString(blog.properties, blogValues, blog.baseURI, blog.resourceType),
            expectedInsertString);

    })

    it("should generate an insert string, which adds a new statement for every value in an array", function() {
        const blog = blogData.BlogSchema;
        const blogValues = blogData.exampleBlog2;
        const uri = `${blog.baseURI}${blog.resourceType}/${blogValues.identifier}`;
        const expectedInsertString = `<${uri}> a <${blog.baseURI}${blog.resourceType}> .\n`
            .concat(`<${uri}> schema:title "${blogValues.title}" .\n`)
            .concat(`<${uri}> schema:comment <${blogValues.comment[0]}> .\n`)
            .concat(`<${uri}> schema:comment <${blogValues.comment[1]}> .`);

        assert.equal(StringGenerator.insertString(blog.properties, blogValues, blog.baseURI, blog.resourceType),
            expectedInsertString);
    })

    it("should generate a graph pattern, that identifies tupels, based on the given list of properties and values", function() {
        const expectedGraphPattern = `?Person schema:age 20 .`;

        assert.equal(StringGenerator.whereStringFiltered(data.propertyList, data.findParameterList, data.resourceType),
            expectedGraphPattern);
    })
})