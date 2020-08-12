import { RDFRequest } from "./RDFRequest";
import { RDF } from "./RDF";
import { ResourceSchema } from "./ResourceSchema";
import { PrefixList } from "./models/RDFModel";


// ResourceSchema.buildIdentifier besser!!!

// im Dokument Mongoose + meine Ausführung gegenüber stellen.
// + neben der Beispiele für Funktionsausführungen auch die Tupel darstellen, die durch diese Zeilen erstellt wurden.

// bei PropertyValues beim create ein LDResource oder LDResourceList erlauben

// hooks erweitern + selbst nutzen


// update funktionsübergabe für bsp age +1

const prefixes: PrefixList = {
    "ex": "http://example.org/",
    "schema": "http://schema.org/",
};

const request = new RDFRequest("http://localhost:3030/test/query", "http://localhost:3030/test/update");

const ProjectSchema = new ResourceSchema({
    prefixes,
    resourceType: "Project",
    resourceSchema: prefixes.schema,
    properties: {
        title: { prefix: "ex" }
    }
});

const Project = RDF.createModel(ProjectSchema, request);

const PresentationSchema = new ResourceSchema({
    prefixes,
    resourceType: "Presentation",
    resourceSchema: prefixes.schema,
    properties: {
        content: { prefix: "ex" }
    }
});

const Presentation = RDF.createModel(PresentationSchema, request);


const PersonSchema = new ResourceSchema({
    prefixes,
    resourceType: "Person",
    resourceSchema: prefixes.schema,
    properties: {
        firstname: { prefix: "ex" },
        password: { prefix: "ex" },
        age: { prefix: "ex", type: "integer" },
        project: { prefix: "ex", type: "uri", optional: true, ref: Project },
        presentations: [{ prefix: "schema", type: "uri", optional: true, ref: Presentation }]
    }
});

const Person = RDF.createModel(PersonSchema, request);

Person.pre("save", (next, values) => {
    if (values) {
        values.password = values.password + "GEHASHED";
    }
    next();
});



(async() => {

    // const presentation = await Presentation.create({ identifier: "Pres1", content: "Dies ist meine erste Präsentation!"});
    // await presentation.save();

    // const presentation2 = await Presentation.create({ identifier: "Pres2", content: "Dies die zweite Präsentation!"});
    // await presentation2.save();

    // const project = await Project.create({ identifier: "Project1", title: "First Project"});
    // await project.save();

    // // const meinrpoject = ;
    // // const person = await Person.create({ identifier: "DanielFott", firstname: "Daniel", password: "Daniel11", age: 20, project: (await Project.findOne({ title: "Hallo" }))["@id"]});
    // const person = await Person.create({ identifier: "DanielFott", firstname: "Daniel", password: "Daniel11", age: 20, project: ProjectSchema.identifier("Project1")});
    // await person.save();

    // const person2 = await Person.create({ identifier: "NeuePerson", firstname: "Neue", password: "Neue11", age: 20, presentations: [PresentationSchema.identifier("Pres1")]});
    // await person2.save();

    const person2 = await Person.create({ identifier: "MaxMustermann", firstname: "Max", password: "Muster1", age: 20});
    await person2.save();

    // let foundNeue = await Person.findByIdentifier("NeuePerson");
    // await foundNeue.populate("presentations");
    // console.log(foundNeue)
    // foundNeue.presentations.push(PresentationSchema.identifier("Pres2"));
    // await foundNeue.save();

    // const foundPerson = await Person.findByIdentifier("DanielFott");
    // await foundPerson.populate("project")

    // const result = await Person.find();
    // const result = await Person.findOne();
    // const result = await Person.findByIdentifier();

    // await Person.update({ age: 20 }, { firstname: "Daniel"});
    // await Person.updateByIdentifier();

    // await Person.delete();
    // await Person.deleteByIdentifier();

    // const person = await Person.findByIdentifier("NeuePerson");
    // await person.populate("presentations")

})()