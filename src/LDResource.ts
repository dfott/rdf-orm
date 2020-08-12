import { Context } from "./models/JsonLD";

export interface ILDResource {
    "@id": string,
    "@type": string,
    "@context": Context,
    [propName: string]: any,
    save: () => Promise<void>,
    populate: (propertyName: string) => Promise<LDResourceTest>,
}

export class LDResourceTest implements ILDResource {

    [propName: string]: any;
    "@id": string;
    "@type": string;
    "@context": Context;

    constructor(ldResource: ILDResource) {
        Object.keys(ldResource).forEach(key => {
            this[key] = ldResource[key];
        })
    }

    public save(): Promise<void> {
        return Promise.resolve();
    }

    public populate(): Promise<LDResourceTest> {
        return Promise.resolve(new LDResourceTest({} as ILDResource));
    }

}