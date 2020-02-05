import { RDF } from "./Model";

const schemas = {
    s: 'http://schemas.org/',
    rdf: 'http://rdf.com/',
};

const PersonSchema = {
    schemas,
    resourceType: 'Person',
    resourceSchema: schemas.s,
    properties: {
        id: {
            type: 'id',
            prefix: 'rdf',
        },
        name: {
            type: 'firstname',
            prefix:'s'
        },
        omega: {
            type: 'omeaglul',
            prefix: 's',
        },
    },
};

const Person = RDF.createModel(PersonSchema);

// const user = new Person({identifier: 123, name: 'peter', omega: 'ciaoi', id: 11});

// console.log(user.save(true));

Person.find();

function createUser(name: string, omega: string, id: number) {
    const user = new Person({identifier: name+omega, name, omega, id});
    user.save(true);
}