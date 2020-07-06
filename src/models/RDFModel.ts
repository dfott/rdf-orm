import { LdConverter } from "../LdConverter";
import { FindParameters, NquadFunction, QueryFunction } from "../RDF";
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
    find(findParameters?: FindParameters, nquadsFunction?: NquadFunction, queryFunction?: QueryFunction): Promise<LDResourceList>
    findByIdentifier(identifier: string, nquadsFunction?: NquadFunction, queryFunction?: QueryFunction): Promise<LDResource>
    findOne(findParameters?: FindParameters, nquadsFunction?: NquadFunction, queryFunction?: QueryFunction): Promise<LDResource>
    delete(findParameters?: FindParameters, queryFunction?: QueryFunction): Promise<boolean>
    deleteByIdentifier(identifier: string, queryFunction?: QueryFunction): Promise<boolean>
}