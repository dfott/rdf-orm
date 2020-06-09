import { assert } from "chai";
import data from "../src/PersonTestData";
import { RDF } from "../src/RDF";
import { PropertyValues } from "../src/Model";
import { LdConverter } from "../src/LdConverter";

const Person = RDF.createModel(data.personSchema, data.request);

describe("RDF", function() {
    // before(async function() {
    //     await (Person.create(data.danielValues)).save();
    //     await (Person.create(data.peterValues)).save();
    //     await (Person.create(data.guterValues)).save();
    // })
    // after(async function() {
    //     await Person.delete();
    // })
    it.skip("should create tupels based on the given input values and schema and return the query", async function() {
        const userValues = { identifier: "CreateTupels", firstname: "Create", lastname: "Tupels", age: 20 };
        const user = Person.create(userValues);
        await user.save();

        const foundDaniel = (await Person.find({ firstname: userValues.firstname, lastname: userValues.lastname, age: userValues.age })).result[0];
        assert.equal(foundDaniel.firstname.value, userValues.firstname);
        assert.equal(foundDaniel.lastname.value, userValues.lastname);
        assert.equal(foundDaniel.age.value, userValues.age);
        await Person.delete({ firstname: "Create", lastname: "Tupels" });
    })
    it.skip("should find every group of tuples that represent the created model schema and return them", async function() {
        const persons = (await Person.find()).result;
        // console.log(persons)
        // assert.isArray(persons);
        // assert.isAtLeast(persons.length, 1);
        assert.equal("", "");
    })
    it.skip("should delete every tuple in the triplestore, that represents the created model schema", async function() {
        await Person.delete();

        const persons = (await Person.find()).result;

        assert.isArray(persons);
        assert.lengthOf(persons, 0);
    })
    it.skip("should delete resources and their properties, based on the given filters", async function() {
        const testo = Person.create({ identifier: "TestoMesto", firstname: "Testo", lastname: "Mesto", age: 25});
        await testo.save()

        let foundTesto = await Person.find({ firstname: "Testo" });
        assert.equal(foundTesto.result.length, 1);

        await Person.delete({ firstname: "Testo" });

        foundTesto = await Person.find({ firstname: "Testo" });

        assert.equal(foundTesto.result.length, 0);
    })
    it("should find a resource and its properties, based on the given identifier", async function() {
        // const daniel = Person.create(data.propertyValues);
        // await daniel.save()

        const foundDaniel = await Person.findByIdentifier("DanielFott");
        console.log(foundDaniel);
        // LdConverter.convert(data.personSchema, foundDaniel.result);
        // console.log(foundDaniel);
        assert.equal("", "");
    })
    it.skip("should find resources and their properties, based on the given filters", async function() {
        // const daniel = Person.create(data.propertyValues);
        // await daniel.save()

        const foundDaniel = await Person.find(data.findParameterList);
        assert.equal("", "");
    })
})