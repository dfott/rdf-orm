import { assert } from "chai"
import { StringGenerator } from "./StringGenerator" 
import { PrefixList, PropertyList, PropertyValues } from "./Model"

const propertyList = {
    firstname: { prefix: "rdf" },
    lastname: { prefix: "rdf" },
    age: { prefix: "s" }
} as PropertyList;

const prefixList = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "owl": "http://www.w3.org/2002/07/owl#",
    "schema": "http://schema.org/",
} as PrefixList;

const propertyValues = {
    identifier: "DanielFott",
    firstname: "Daniel",
    lastname: "Fott",
    age: 20
} as PropertyValues;

const resourceSchema = prefixList.schema; 
const resourceType = "Person";

describe("StringGenerator", function() {
    it("should generate a string, that correctly defines every given prefix and the corresponding schema", function() {
        const expectedPrefixString = 
`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX schema: <http://schema.org/>`;

        assert.equal(StringGenerator.prefixString(prefixList), expectedPrefixString);
    })

    it("should generate a string, which would identify every available property in the select clause of a SparQL query", function() {
        const expectedSelectionString = "?firstname ?lastname ?age";
        assert.equal(StringGenerator.selectString(propertyList), expectedSelectionString);
    })

    it("should generate a basic graph pattern string, which will be used in the where clause of a SparQL query to match it against the specified graph", function() {
        const expectedWhereString = 
`?Person rdf:firstname ?firstname
?Person rdf:lastname ?lastname
?Person s:age ?age`;
        assert.equal(StringGenerator.whereString(propertyList, resourceType), expectedWhereString);
    })

    it("should generate a string with RDF triples, that will be inserted into a triplestore", function() {
        const uri = `${resourceSchema}${resourceType}/${propertyValues.identifier}`;
        const expectedInsertString = 
`<${uri}> a <${resourceSchema}${resourceType}> .
<${uri}> rdf:firstname "${propertyValues.firstname}" .
<${uri}> rdf:lastname "${propertyValues.lastname}" .
<${uri}> s:age ${propertyValues.age} .`

        assert.equal(StringGenerator.insertString(propertyList, propertyValues, resourceSchema, resourceType), expectedInsertString);
    });
})