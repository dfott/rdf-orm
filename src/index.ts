interface SchemaList {
   [prefix: string]: string,
}
interface Attribute {
    type: string;
    schema: string;
}
interface AttributeList {
    [attrName: string]: Attribute
}
interface Schema {
    schemas: SchemaList;
    attributes: AttributeList;
}

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

export class RDFModel {
    private schemas: SchemaList;
    private attributes: AttributeList;

    constructor(schema: Schema) {
        this.schemas = schema.schemas;
        this.attributes = schema.attributes;
    }
}

const Model = new RDFModel(Person);


