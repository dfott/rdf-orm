import { Schema, PropertyValues, PropertyList } from "./Model";
import { QueryBuilder } from "./QueryBuilder";
import { RDFRequest } from "./RDFRequest";
import { defaultJsonLd } from "./LdConverter";

const request = new RDFRequest("http://localhost:3030/test/query", "http://localhost:3030/test/update");

export class RDFResult {

    private builder: QueryBuilder;

    constructor(private schema: Schema, public values: PropertyValues, public query?: string, public result?: any) {
        this.builder = new QueryBuilder(this.schema, this.values);
        if (result) this.values = this.extractPropertiesFromJsonLD(result);
    }

    public async save(): Promise<string> {
        const insertQuery = this.builder.buildInsert();
        await request.update(insertQuery);
        return Promise.resolve(insertQuery);
    }

    private extractPropertiesFromJsonLD(defaultJson: defaultJsonLd) {
        const propertyValues = {} as PropertyValues;
        Object.keys(defaultJson).forEach((key: string) => {
            if (this.propertyExists(key, this.schema.properties)) {
                propertyValues[key] = defaultJson[key];
            } else if (this.propertyExists(key.split(":")[1], this.schema.properties)) {
                propertyValues[key.split(":")[1]] = defaultJson[key];
            }
        })
        return propertyValues;
    } 
    private propertyExists(key: string, properties: PropertyList): boolean {
        return Object.keys(properties).indexOf(key) !== -1;
    }

}