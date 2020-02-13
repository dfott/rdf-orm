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
            isKey: true,
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
//

const lul = async() => {
    console.log(await Person.findJSON());
}

lul();
// Person.delete();
// Person.findByIdentifier(11);
// initData();
// Person.findByKey(11);
// test();

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