import { Schema, PropertyValues, PropertyList } from "./Model";
import { QueryBuilder } from "./QueryBuilder";
import { RDFRequest } from "./RDFRequest";
import { defaultJsonLd } from "./LdConverter";

const request = new RDFRequest("http://localhost:3030/test/query", "http://localhost:3030/test/update");

export class RDFResult {

    private builder: QueryBuilder;
    private updated = false;

    constructor(private schema: Schema, public values: PropertyValues, public query?: string, public result?: any) {
        this.builder = new QueryBuilder(this.schema, this.values);
        if (result) { 
            this.values = this.extractPropertiesFromJsonLD(result);
            this.updated = true;
        } 
    }

    public async save(): Promise<string> {
        if (!this.updated) {
            const insertQuery = this.builder.buildInsert();
            await request.update(insertQuery);
            return Promise.resolve(insertQuery);
        } else {
            return this.update();
        }
    }

    private async update(): Promise<string> {
        const updateQuery = this.builder.buildUpdate(this.values);
        await request.update(updateQuery);
        return Promise.resolve(updateQuery);
    }

    private extractPropertiesFromJsonLD(defaultJson: defaultJsonLd) {
        const propertyValues = {} as PropertyValues;
        Object.keys(defaultJson).forEach((key: string) => {
            if (this.propertyExists(key, this.schema.properties)) {
                propertyValues[key] = defaultJson[key];
            } else if (this.propertyExists(key.split(":")[1], this.schema.properties)) {
                propertyValues[key.split(":")[1]] = defaultJson[key];
            } else if (key === "@id") {
                // -------------- TODO -----------------------------
                // make sure that this function can be applied to most of the use cases + write tests to confirm
                const id = defaultJson["@id"];
                const split = id.split("/");
                if (split.length >= 2) {
                    propertyValues.identifier = split[split.length - 1];
                //     const resourceSchema = this.schema.prefixes[split[0]];
                //     propertyValues.identifier = `${resourceSchema}${
                //         id.substr(id.indexOf(":") + 1)
                //     }`;
                }
            }
        })
        return propertyValues;
    } 

    private propertyExists(key: string, properties: PropertyList): boolean {
        return Object.keys(properties).indexOf(key) !== -1;
    }

}