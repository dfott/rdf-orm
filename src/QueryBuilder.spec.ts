import { assert } from "chai";

import data from "./PersonTestData";

import { QueryBuilder } from "./QueryBuilder";
import { StringGenerator } from "./StringGenerator";

describe("QueryBuilder", function() {
    it("should build an insert query, that could be used in a SparQL query to insert tupels, based on the given schema and values", function() {
        const builder = new QueryBuilder(data.personSchema, data.propertyValues);

        const expectedInsertString = 
`${StringGenerator.prefixString(data.prefixList)}

INSERT DATA {
${StringGenerator.insertString(data.propertyList, data.propertyValues, data.resourceSchema, data.resourceType)}
}`;

    assert.equal(builder.buildInsert(), expectedInsertString);
    })

    it("should build a select query, that would select every tuple that is modelling the specified schema", function() {
        const expectedSelectString = `${StringGenerator.prefixString(data.prefixList)}\n\n`
            .concat(`select ${StringGenerator.selectString(data.propertyList)}\n`)
            .concat(`where {\n`)
            .concat(`${StringGenerator.whereString(data.propertyList, data.resourceType)}\n`)
            .concat(`}`);
        assert.equal(QueryBuilder.buildFind(data.personSchema), expectedSelectString);
    })
})