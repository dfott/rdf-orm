import { assert } from "chai";
import { StringGenerator } from "../src/StringGenerator";
import { PrefixList, PropertyList, PropertyValues } from "../src/Model";
import data from "../src/PersonTestData";


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

    it("should generate an insert string with RDF triples, that will be inserted into a triplestore", function() {
        const uri = `${data.resourceSchema}${data.resourceType}/${data.danielValues.identifier}`;
        const expectedInsertString = 
`<${uri}> a <${data.resourceSchema}${data.resourceType}> .
<${uri}> rdf:firstname "${data.danielValues.firstname}" .
<${uri}> rdf:lastname "${data.danielValues.lastname}" .
<${uri}> schema:age ${data.danielValues.age} .`

        assert.equal(StringGenerator.insertString(data.propertyList, data.danielValues, data.resourceSchema, data.resourceType), expectedInsertString);
    });

    it("should generate a graph pattern, that identifies tupels, based on the given list of properties and values", function() {
        const expectedGraphPattern = `?Person schema:age 20 .`;

        assert.equal(StringGenerator.whereStringFiltered(data.propertyList, data.findParameterList, data.resourceType),
            expectedGraphPattern);
    })
})