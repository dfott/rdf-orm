import { assert } from "chai";
import { StringGenerator } from "./StringGenerator";
import { PrefixList, PropertyList, PropertyValues } from "./Model";
import data from "./PersonTestData";


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
        const expectedSelectionString = "?firstname ?lastname ?age";
        assert.equal(StringGenerator.selectString(data.propertyList), expectedSelectionString);
    })

    it("should generate a basic graph pattern where string, which will be used in the where clause of a SparQL query to match it against the specified graph", function() {
        const expectedWhereString = 
`?Person rdf:firstname ?firstname .
?Person rdf:lastname ?lastname .
?Person schema:age ?age .`;
        assert.equal(StringGenerator.whereString(data.propertyList, data.resourceType), expectedWhereString);
    })

    it("should generate an insert string with RDF triples, that will be inserted into a triplestore", function() {
        const uri = `${data.resourceSchema}${data.resourceType}/${data.propertyValues.identifier}`;
        const expectedInsertString = 
`<${uri}> a <${data.resourceSchema}${data.resourceType}> .
<${uri}> rdf:firstname "${data.propertyValues.firstname}" .
<${uri}> rdf:lastname "${data.propertyValues.lastname}" .
<${uri}> schema:age ${data.propertyValues.age} .`

        assert.equal(StringGenerator.insertString(data.propertyList, data.propertyValues, data.resourceSchema, data.resourceType), expectedInsertString);
    });
})