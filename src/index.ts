import { RDF } from "./Model";
import { RDFRequest } from "./RDFRequest";

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
            isKey: true,
        },
        firstname: {
            type: 'firstname',
            prefix:'s'
        },
        omeaglul: {
            type: 'omeaglul',
            prefix: 's',
        },
    },
};

const request = new RDFRequest('http://localhost:3030/test/query', 'http://localhost:3030/test/update');

const Person = RDF.createModel(PersonSchema, request);

// const user = new Person({identifier: 123, name: 'peter', omega: 'ciaoi', id: 11});
// console.log(user.save(true));
//

const lul = async() => {
    // const res = await Person.find();
    // console.log(res.bindings);
    // const user = await Person.findByIdentifier("123");

    // user.values.id = 221133;
    // await user.save();
    // console.log(user);
}

const tt = async () => {
    // const user = new Person({identifier: 99, firstname: "Daniel", omeaglul: "Fott", id: 99});
    // await user.save(true);

    // console.log(await Person.findByIdentifier(99));
    console.log(await Person.findByKey(99));
}

tt();
// lul();
// Person.delete();
// Person.findByIdentifier(11);
// initData();
// Person.findByKey(11);
// test();
// new Person({identifier: 123, firstname: 'peter', omeaglul: 'csaoi', id: 11}).save(true);
// new Person({identifier: 456, firstname: 'daniel', omeaglul: 'omegalul', id: 12}).save(true);

async function test() {
    const user = new Person({identifier: 123, name: 'peter', omega: 'ciaoi', id: 11});
    await user.save(true);
    console.log(await Person.find());
    user.values.name = 'daniel';
    user.values.omega = 'lulul';
    await user.save(true);
    console.log(await Person.find());
}

function createUser(name: string, omega: string, id: number) {
    const user = new Person({identifier: name+omega, name, omega, id});
    user.save(true);
}

function initData() {
    createUser('Dulli', 'Peterson', 233);
    createUser('Daniel', 'Lulo', 234);
    createUser('Peter', 'Da', 235);
    createUser('DIeter', 'Wulli', 236);
}