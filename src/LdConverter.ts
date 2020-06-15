import { Schema, PropertyList, PropertyValues, PrefixList } from "./RDF";

export interface defaultJsonLd {
    "@id": string;
    "@type": string;
    "@context": any;
    [propertyName: string]: string;

}

interface defaultContext {
    [propertyName: string]: string;
}

export class LdConverter {

    public static convert(schema: Schema, defaultJson: defaultJsonLd) {
        // console.log("context")
        // console.log(this.buildContext(defaultJson["@context"], schema.properties, schema.prefixes));
        // console.log("values")
        // console.log(this.buildPropertyValues(schema.properties, defaultJson));

        let final = {
            "@context": this.buildContext(defaultJson["@context"], schema.properties, schema.prefixes),
            "@type": defaultJson["@type"],
            "@id": defaultJson["@id"],
            ...this.buildPropertyValues(schema.properties, defaultJson),
        };
        console.log(final)
    }

    private static buildContext(context: defaultContext, properties: PropertyList, prefixes: PrefixList): defaultContext {
        const newContext = {} as defaultContext;
        Object.keys(properties).forEach((prop: string) => {
            newContext[prop] = `${prefixes[properties[prop].prefix]}${prop}`;
        })
        return newContext;
    }

    private static buildPropertyValues(properties: PropertyList, defaultJson: defaultJsonLd) {
        const propertyValues = {} as PropertyValues;
        Object.keys(defaultJson).forEach((key: string) => {
            if (this.propertyExists(key, properties)) {
                propertyValues[key] = defaultJson[key];
            } else if (this.propertyExists(key.split(":")[1], properties)) {
                propertyValues[key.split(":")[1]] = defaultJson[key];
            }
        })
        return propertyValues;
    }

    private static propertyExists(key: string, properties: PropertyList): boolean {
        return Object.keys(properties).indexOf(key) !== -1;
    }

}