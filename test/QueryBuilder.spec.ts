import { assert } from "chai";

import data from "../src/PersonTestData";

import { QueryBuilder } from "../src/QueryBuilder";
import { StringGenerator } from "../src/StringGenerator";

describe("QueryBuilder", function() {
    it("should build an insert query, that could be used in a SparQL query to insert tupels, based on the given schema and values", function() {
        const builder = new QueryBuilder(data.personSchema, data.danielValues);

        const expectedInsertString = 
`${StringGenerator.prefixString(data.prefixList)}

INSERT DATA {
${StringGenerator.insertString(data.propertyList, data.danielValues, data.resourceSchema, data.resourceType)}
}`;

    assert.equal(builder.buildInsert(), expectedInsertString);
    })

    it("should build a construct query, that would select every tuple that is modelling the specified schema", function() {
        const expectedSelectString = `${StringGenerator.prefixString(data.prefixList)}\n\n`
            .concat(`construct {\n`)
            .concat(StringGenerator.constructString(data.propertyList, data.resourceType))
            .concat(`\n}\n`)
            .concat(`where {\n`)
            .concat(`${StringGenerator.whereString(data.propertyList, data.resourceType)}\n`)
            .concat(`}`);
        assert.equal(QueryBuilder.buildFind(data.personSchema), expectedSelectString);
    })

    it("should build a construct query, that would select all filtered tuples, that model the specified schema", function() {
        const expectedSelectString = `${StringGenerator.prefixString(data.prefixList)}\n\n`
            .concat(`construct {\n`)
            .concat(StringGenerator.constructString(data.propertyList, data.resourceType))
            .concat(`\n}\n`)
            .concat(`where {\n`)
            .concat(`${StringGenerator.whereString(data.propertyList, data.resourceType)}\n`)
            .concat(`${StringGenerator.whereStringFiltered(data.propertyList, data.findParameterList, data.resourceType)}\n`)
            .concat(`}`);
        assert.equal(QueryBuilder.buildFindFiltered(data.personSchema, data.findParameterList), expectedSelectString);
    })
    
    it("should build a delete query, that would delete every tuple that is modelling the specified schema", function() {
        const whereString = `?Person rdf:firstname ?firstname .\n`
            .concat(`?Person rdf:lastname ?lastname .\n`)
            .concat(`?Person schema:age ?age .\n`)
            .concat(`?Person a ?type .\n`);
        const expectedDeleteString = `${StringGenerator.prefixString(data.prefixList)}\n\n`
            .concat(`delete {\n`)
            .concat(whereString)
            .concat(`} where {\n`)
            .concat(whereString)
            .concat(`}`);
        assert.equal(QueryBuilder.buildDelete(data.personSchema), expectedDeleteString);
    })



})