import { RDF } from "./Model";

const schemas = {
    s: 'http://schemas.org/',
    rdf: 'http://rdf.com/',
};

const PersonSchema = {
    schemas,
    type: 'Person',
    typeSchema: schemas.s,
    attributes: {
        id: {
            identifier: true,
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

const user = new Person({ name: 'daniel', omega: 'lul', id: 1240});

console.log(user.save());

user.values.name = 'peter';
user.values.omega = 'omaee';
user.values.id = 99;

console.log(user.save());
