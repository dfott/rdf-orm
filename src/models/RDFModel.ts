import { LdConverter } from "../LdConverter";
import { FindParameters, NquadFunction, QueryFunction, PreHookFunction } from "../RDF";
import { LDResourceList, LDResource } from "./JsonLD";
import { RDFRequest } from "../RDFRequest";
import { ResourceSchema } from "../ResourceSchema";

export interface PrefixList {
    [prefix: string]: string,
}

export interface Property {
    prefix: string;
    optional?: boolean;
    type?: "uri" | "integer";
    ref?: IRDFModel;
    // isKey?: boolean;
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
    baseURI: string;
    prefixes: PrefixList;
    properties: PropertyList;

    label?: string;
}

export interface IRDFModel {
    schema: ResourceSchema;
    request: RDFRequest;
    ldConverter: LdConverter;
    create(values: PropertyValues, preSaveHook?: PreHookFunction): Promise<LDResource>
    find(findParameters?: FindParameters, nquadsFunction?: NquadFunction, queryFunction?: QueryFunction): Promise<LDResourceList>
    findByIdentifier(identifier: string, nquadsFunction?: NquadFunction, queryFunction?: QueryFunction): Promise<LDResource>
    findOne(findParameters?: FindParameters, nquadsFunction?: NquadFunction, queryFunction?: QueryFunction): Promise<LDResource>
    delete(findParameters?: FindParameters, queryFunction?: QueryFunction): Promise<boolean>
    deleteByIdentifier(identifier: string, queryFunction?: QueryFunction): Promise<boolean>
    update(updateParameters: FindParameters, findParameters?: FindParameters): Promise<boolean>
    updateByIdentifier(identifiser: string, updateParameters: FindParameters): Promise<boolean>
    pre(type: string, callback: PreHookFunction): void
    initTupels(): Promise<boolean>
}