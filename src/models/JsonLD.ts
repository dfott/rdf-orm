
export interface JsonLD {
    "@graph"?: JsonLDResource[]
    "@id"?: string;
    "@type"?: string;
    [propname: string]: any
    "@context"?: Context
}

export interface JsonLDResource {
    "@id": string;
    "@type": string;
    [propname: string]: string | string[];
}

export interface LDResource {
    "@id": string,
    "@type": string,
    "@context": Context,
    [propName: string]: any,
    save: () => Promise<void>,
    populate: (propertyName: string) => Promise<LDResource>,
}

export interface LDResourceList {
    "@graph": Array<LDResource>;
    "@context": Context;
    populate: (propertyName: string) => Promise<LDResourceList>;
}

export interface Context {
    [propName: string]: ContextObject
}

export interface ContextObject {
    "@id": string;
    "@type"?: string;
}