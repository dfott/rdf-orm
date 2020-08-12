import { Schema, PrefixList, PropertyList } from "./models/RDFModel";

export class ResourceSchema {

    public resourceType: string;
    public baseURI: string;
    public prefixes: PrefixList;
    public properties: PropertyList;

    public label?: string;

    constructor(public schema: Schema) {
        this.resourceType = schema.resourceType;
        this.baseURI = schema.baseURI;
        this.prefixes = schema.prefixes;
        this.properties = schema.properties;
        this.label = schema.label;
    }

    public buildIdentifier(name: string): string {
        return `${this.baseURI}${this.resourceType}/${name}`;
    }

}