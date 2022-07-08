import { RDFRequest } from "./RDFRequest";
import { RDF } from "./RDF";
import { ResourceSchema } from "./ResourceSchema";
import { PrefixList } from "./models/RDFModel";

const prefixes: PrefixList = {
    "example": "http://example.org/",
    "schema": "http://schema.org/",
};

const request = new RDFRequest("http://localhost:3030/test/query", "http://localhost:3030/test/update");

const ProjectSchema = new ResourceSchema({
    prefixes,
    resourceType: "Project",
    baseURI: prefixes.schema,
    properties: {
        title: { prefix: "example" },
        description: {prefix: "example", optional: true }
    }
});

const Project = RDF.createModel(ProjectSchema, request);

const PresentationSchema = new ResourceSchema({
    prefixes,
    resourceType: "Presentation",
    baseURI: prefixes.schema,
    properties: {
        content: { prefix: "ex" }
    }
});

const Presentation = RDF.createModel(PresentationSchema, request);


const PersonSchema = new ResourceSchema({
    prefixes,
    resourceType: "Person",
    baseURI: prefixes.schema,
    properties: {
        firstname: { prefix: "example" },
        password: { prefix: "example" },
        age: { prefix: "example", type: "integer" },
        project: { prefix: "example", type: "uri", optional: true, ref: Project },
        presentations: [{ prefix: "schema", type: "uri", optional: true, ref: Presentation }]
    }
});

const Person = RDF.createModel(PersonSchema, request);

// Person.pre("save", (next, values) => {
//     if (values) {
//         values.password = values.password + "GEHASHED";
//     }
//     next();
// });



(async() => {

    // await Person.initTupels();
    // await Project.initTupels();

    // const presentation = await Presentation.create({ identifier: "Pres1", content: "Dies ist meine erste Präsentation!"});
    // await presentation.save();

    // const presentation2 = await Presentation.create({ identifier: "Pres2", content: "Dies die zweite Präsentation!"});
    // await presentation2.save();

    // const project = await Project.create({ identifier: "Project1", title: "First Project"});
    // console.log(project)
    // await project.save();

    // // const meinrpoject = ;
    // // const person = await Person.create({ identifier: "DanielFott", firstname: "Daniel", password: "Daniel11", age: 20, project: (await Project.findOne({ title: "Hallo" }))["@id"]});
    // const person = await Person.create({ identifier: "DanielFott", firstname: "Daniel", password: "Daniel11", age: 20, project: ProjectSchema.buildIdentifier("Project1")});
    // console.log(person)
    // await person.save();
    console.log(
        await (await Person.findByIdentifier("DanielFott")).populate("project")
    )

    // const person2 = await Person.create({ identifier: "NeuePerson", firstname: "Neue", password: "Neue11", age: 20, presentations: [PresentationSchema.identifier("Pres1")]});
    // await person2.save();

    // const person2 = await Person.create({ identifier: "MaxMustermann", firstname: "Max", password: "Muster1", age: 20});
    // await person2.save();

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