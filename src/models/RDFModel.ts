import { LdConverter } from "../LdConverter";
import { FindParameters } from "../RDF";
import { LDResourceList, LDResource } from "./JsonLD";

export interface PrefixList {
    [prefix: string]: string,
}

export interface Property {
    prefix: string;
    optional?: boolean;
    type?: "uri" | "integer";
    ref?: IRDFModel;
    isKey?: boolean;
}

export interface PropertyList {
    [propertyName: string]: Property | [Property];
}

export interface PropertyValues {
    identifier: string;
    [propertyName: string]: any;
}

export interface Schema {
    resourceType: string;
    resourceSchema: string;
    prefixes: PrefixList;
    properties: PropertyList;
}

export interface IRDFModel {
    schema?: Schema;
    create(values: PropertyValues): Promise<LDResource>
    find(findParameters?: FindParameters): Promise<LDResourceList>
    findByIdentifier(identifier: string): Promise<LDResource>
    findOne(findParameters?: FindParameters): Promise<LDResource>
    delete(findParameters?: FindParameters): Promise<boolean>
    deleteByIdentifier(identifier: string): Promise<boolean>
}