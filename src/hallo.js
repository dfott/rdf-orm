const { RDFModel } = require("../dist");

const schemas = {
    s: 'https://schemas.com/',
    r: 'https://rdf.com/',
};

const Person = {
    schemas,
    attributes: {
        name: {
            type: 'firstName',
            schema: schemas.s,
        },
        omega: {
            type: 'NewType',
            schema: schemas.r,
        },
    }
};

const Test = new RDFModel(Person);
console.log(Test);

