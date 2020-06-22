import { assert } from "chai";
import data from "../src/PersonTestData";
import { RDF } from "../src/RDF";
import { PropertyValues } from "../src/RDF";
import { LdConverter } from "../src/LdConverter";

const Person = RDF.createModel(data.personSchema, data.request);

describe("RDF", function() {
    before(async function() {
        await (Person.create(data.danielValues)).save();
        await (Person.create(data.peterValues)).save();
        await (Person.create(data.guterValues)).save();
    })
    after(async function() {
        await Person.delete();
    })
    it("should create tupels based on the given input values and schema and return the query", async function() {
        const userValues = { identifier: "CreateTupels", firstname: "Create", lastname: "Tupels", age: 20 };
        const user = Person.create(userValues);
        await user.save();

        const foundDaniel = (await Person.find({ firstname: userValues.firstname, lastname: userValues.lastname, age: userValues.age })).result;
        assert.equal(foundDaniel.firstname, "Create");
        assert.equal(foundDaniel.lastname, "Tupels");
        assert.equal(foundDaniel.age, "20");
        await Person.delete({ firstname: "Create", lastname: "Tupels", age: 20 });
    })
    it("should find every group of tuples that represent the created model schema and return them", async function() {
        const persons = (await Person.find()).result;
        assert.isNotNull(persons["@graph"]);
        assert.isArray(persons["@graph"]);
        assert.lengthOf(persons["@graph"], 3);

        const personsObjects = persons["@graph"];
        const daniel = personsObjects.find((person: any) => person.firstname === data.danielValues.firstname);
        const guter = personsObjects.find((person: any) => person.firstname === data.guterValues.firstname);
        const peter = personsObjects.find((person: any) => person.firstname === data.peterValues.firstname);

        assert.isNotNull(daniel);
        assert.isNotNull(guter);
        assert.isNotNull(peter);

    })
    it("should delete resources and their properties, based on the given filters", async function() {
        const testo = Person.create({ identifier: "TestoMesto", firstname: "Testo", lastname: "Mesto", age: 25});
        await testo.save()
        const lesto = Person.create({ identifier: "LestoMesto", firstname: "Lesto", lastname: "Mesto", age: 25});
        await lesto.save()

        let foundTesto = await Person.find({ firstname: "Testo" });
        assert.equal(foundTesto.result.firstname, "Testo");
        let foundLesto = await Person.find({ firstname: "Lesto" });
        assert.equal(foundLesto.result.firstname, "Lesto");

        await Person.delete({ age: 25 });
        foundTesto = await Person.find({ age: 25 });

        assert.isUndefined(foundTesto.result.firstname);
        assert.isUndefined(foundTesto.result.lastname);
        assert.isUndefined(foundTesto.result.age);
        assert.isUndefined(foundTesto.result["@graph"]);
    })
    it("should delete resources and their properties, based on the given identifier", async function() {
        const testo = Person.create({ identifier: "TestoMesto", firstname: "Testo", lastname: "Mesto", age: 25});
        await testo.save()

        let foundTesto = await Person.findByIdentifier("TestoMesto");
        assert.equal(foundTesto.result.firstname, "Testo");
        await Person.deleteByIdentifier("TestoMesto");

        foundTesto = await Person.findByIdentifier("Testo");

        assert.isUndefined(foundTesto.result.firstname);
        assert.isUndefined(foundTesto.result.lastname);
        assert.isUndefined(foundTesto.result.age);
        assert.isUndefined(foundTesto.result["@graph"]);
    })
    it("should find a resource and its properties, based on the given identifier", async function() {
        const foundDaniel = await Person.findByIdentifier("DanielFott");

        assert.equal(foundDaniel.result.firstname, data.danielValues.firstname);
        assert.equal(foundDaniel.result.lastname, data.danielValues.lastname);
        assert.equal(foundDaniel.result.age, data.danielValues.age);
        assert.equal(foundDaniel.result["@id"], `${data.resourceSchema}${data.resourceType}/${data.danielValues.identifier}`);
    })
    it.skip("should update the firstname and lastname of the resource and save it in the triplestore", async function() {
        let daniel = await Person.findByIdentifier("DanielFott");

        assert.equal(daniel.result.firstname, data.danielValues.firstname);
        assert.equal(daniel.result.lastname, data.danielValues.lastname);

        daniel.values.firstname = "Dan";
        daniel.values.lastname = "Iel";
        await daniel.save();

        daniel = await Person.findByIdentifier("DanielFott");

        assert.equal(daniel.result.firstname, "Dan");
        assert.equal(daniel.result.lastname, "Iel");
    })
    it("should find resources and their properties, based on the given filters", async function() {
        const results = (await Person.find({ age: 20 })).result;

        assert.isNotNull(results["@graph"]);
        assert.isArray(results["@graph"]);
        assert.lengthOf(results["@graph"], 2);
    })
    it("should delete every tuple in the triplestore, that represents the created model schema", async function() {
        await Person.delete();

        const persons = (await Person.find()).result;

        assert.isUndefined(persons["@id"]);
        assert.isUndefined(persons["@type"]);
        assert.isUndefined(persons["@graph"]);
    })
})