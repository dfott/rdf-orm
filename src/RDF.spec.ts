import { assert } from "chai";
import data from "./PersonTestData";
import { RDF } from "./RDF";
import { PropertyValues } from "./Model";

describe("RDF", function() {
    it("should create tupels based on the given input values and schema and return the query", async function() {
        const Person = RDF.createModel(data.personSchema);
        const values = { identifier: "DanielFott", firstname: "Daniel",
        lastname: "Fott", age: 20 } as PropertyValues;
        const user = Person.create(values);
        await user.save();

        // const daniel = await Person.find()
        const allUsers = (await Person.find()).result;
        assert.equal("Daniel", allUsers[0].firstname.value);
        assert.equal("Fott", allUsers[0].lastname.value);
        assert.equal("20", allUsers[0].age.value);
    })
})