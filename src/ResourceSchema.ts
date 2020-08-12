import { Schema, PrefixList, PropertyList } from "./models/RDFModel";

export class ResourceSchema {

    public resourceType: string;
    public resourceSchema: string;
    public prefixes: PrefixList;
    public properties: PropertyList;

    constructor(public schema: Schema) {
        this.resourceType = schema.resourceType;
        this.resourceSchema = schema.resourceSchema;
        this.prefixes = schema.prefixes;
        this.properties = schema.properties;
    }

    public identifier(name: string): string {
        return `${this.resourceSchema}${this.resourceType}/${name}`;
    }

}