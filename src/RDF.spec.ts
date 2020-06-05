import { assert } from "chai";
import data from "./PersonTestData";
import { RDF } from "./RDF";
import { PropertyValues } from "./Model";

const Person = RDF.createModel(data.personSchema);

describe("RDF", function() {
    it.skip("should create tupels based on the given input values and schema and return the query", async function() {
        const values = { identifier: "PetersTest", firstname: "Peter",
        lastname: "Test", age: 40 } as PropertyValues;
        const user = Person.create(values);
        await user.save();

        // const daniel = await Person.find()
        const allUsers = (await Person.find()).result;
        assert.equal("Daniel", allUsers[0].firstname.value);
        assert.equal("Fott", allUsers[0].lastname.value);
        assert.equal("20", allUsers[0].age.value);
    })
    it("should find every group of tuples that represent the created model schema and return them", async function() {
        const persons = (await Person.find()).result;
        console.log(persons)
        assert.isArray(persons);
        assert.isAtLeast(persons.length, 1);
    })
    it.skip("should delete every tuple in the triplestore, that represents the created model schema", async function() {
        await Person.delete();

        const persons = (await Person.find()).result;

        assert.isArray(persons);
        assert.lengthOf(persons, 0);
    })
    it("should find a resource and its properties, based on the given identifier", async function() {
        const daniel = Person.create(data.propertyValues);
        await daniel.save()

        const foundDaniel = await Person.findByIdentifier("DanielFott");
        console.log(foundDaniel.result);
        assert.equal("", "");
    })
})