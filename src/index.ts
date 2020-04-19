import { RDF } from "./Model";
import { RDFRequest } from "./RDFRequest";

const prefixes = {
    s: 'http://schemas.org/',
    rdf: 'http://rdf.com/',
};

const PersonSchema = {
    prefixes,
    resourceType: 'Person',
    resourceSchema: prefixes.s,
    properties: {
        id: {
            prefix: 'rdf',
        },
        firstname: {
            prefix:'s'
        },
        lastname: {
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

(async function() {

    // const user = new Person({ identifier: "DanielFott", id: 1, firstname: "Daniel", lastname: "Fott"});
    // await user.save(true);
    const user = await Person.findByIdentifier("DanielFott");
    // console.log(user)
    user.values.id = 123;
    await user.save();
    console.log(await Person.find());
}())


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