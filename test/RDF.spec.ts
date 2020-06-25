import { assert } from "chai";
import data from "../src/PersonTestData";
import { RDF } from "../src/RDF";

const Person = RDF.createModel(data.personSchema, data.request);

describe("RDF", function() {
    before(async function() {
        await (await Person.create(data.danielValues)).save();
        await (await Person.create(data.peterValues)).save();
        await (await Person.create(data.guterValues)).save();
    })
    after(async function() {
        await Person.delete();
    })
    it("should create tupels based on the given input values and schema and return the query", async function() {
        const userValues = { identifier: "CreateTupels", firstname: "Create", lastname: "Tupels", age: 20 };
        const user = await Person.create(userValues);
        await user.save();

        const foundDaniel = await Person.find({ firstname: userValues.firstname, lastname: userValues.lastname, age: userValues.age });

        assert.isNotNull(foundDaniel);
        assert.isArray(foundDaniel["@graph"])

        const daniel = foundDaniel["@graph"][0];
        assert.isNotNull(daniel);

        assert.equal(daniel.firstname, "Create");
        assert.equal(daniel.lastname, "Tupels");
        assert.equal(daniel.age, "20");
        await Person.delete({ firstname: "Create", lastname: "Tupels", age: 20 });
    })
    it("should find every group of tuples that represent the created model schema and return them", async function() {
        const persons = await Person.find();
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
        const testo = await Person.create({ identifier: "TestoMesto", firstname: "Testo", lastname: "Mesto", age: 25});
        await testo.save()
        const lesto = await Person.create({ identifier: "LestoMesto", firstname: "Lesto", lastname: "Mesto", age: 25});
        await lesto.save()

        const found = await Person.find({ age: 25});

        assert.isNotNull(found["@graph"]);
        assert.isArray(found["@graph"]);
        assert.lengthOf(found["@graph"], 2);

        let foundTesto = found["@graph"].find(res => res.firstname === "Testo");
        let foundLesto = found["@graph"].find(res => res.firstname === "Lesto");

        assert.isNotNull(foundTesto);
        assert.isNotNull(foundLesto);
        assert.equal(foundTesto!!.firstname, "Testo");
        assert.equal(foundLesto!!.firstname, "Lesto");

        await Person.delete({ age: 25 });

        let newestResult = await Person.find({ age: 25 });

        assert.isArray(newestResult["@graph"]);
        assert.isEmpty(newestResult["@graph"]);
    })
    it("should delete resources and their properties, based on the given identifier", async function() {
        const testo = await Person.create({ identifier: "TestoMesto", firstname: "Testo", lastname: "Mesto", age: 25});
        await testo.save()

        let foundTesto = await Person.findByIdentifier("TestoMesto");
        assert.equal(foundTesto.firstname, "Testo");

        await Person.deleteByIdentifier("TestoMesto");

        foundTesto = await Person.findByIdentifier("Testo");

        assert.isUndefined(foundTesto.firstname);
        assert.isUndefined(foundTesto.lastname);
        assert.isUndefined(foundTesto.age);
    })
    it("should find a resource and its properties, based on the given identifier", async function() {
        const foundDaniel = await Person.findByIdentifier("DanielFott");

        assert.equal(foundDaniel.firstname, data.danielValues.firstname);
        assert.equal(foundDaniel.lastname, data.danielValues.lastname);
        assert.equal(foundDaniel.age, data.danielValues.age);
        assert.equal(foundDaniel["@id"], `${data.resourceSchema}${data.resourceType}/${data.danielValues.identifier}`);
    })
    it("should update the firstname and lastname of the resource and save it in the triplestore", async function() {
        let daniel = await Person.findByIdentifier("DanielFott");

        assert.equal(daniel.firstname, data.danielValues.firstname);
        assert.equal(daniel.lastname, data.danielValues.lastname);

        daniel.firstname = "Dan";
        daniel.lastname = "Iel";

        await daniel.save();

        daniel = await Person.findByIdentifier("DanielFott");

        assert.equal(daniel.firstname, "Dan");
        assert.equal(daniel.lastname, "Iel");
    })
    it("should find resources and their properties, based on the given filters", async function() {
        const persons = (await Person.find({ age: "20" }))
        const results = persons;

        assert.isNotNull(results["@graph"]);
        assert.isArray(results["@graph"]);
        assert.lengthOf(results["@graph"], 2);
    })
    it("should delete every tuple in the triplestore, that represents the created model schema", async function() {
        await Person.delete();

        const persons = await Person.find();

        assert.isNotNull(persons)
        assert.isEmpty(persons["@graph"]);
    })
})