import { Schema, PropertyValues } from "./Model";
import { QueryBuilder } from "./QueryBuilder";
import { RDFRequest } from "./RDFRequest";

const request = new RDFRequest("http://localhost:3030/test/query", "http://localhost:3030/test/update");

export class RDFResult {

    private builder: QueryBuilder;

    constructor(private schema: Schema, private values: PropertyValues, public query?: string, public result?: any) {
        this.builder = new QueryBuilder(this.schema, this.values);
    }

    public async save(): Promise<string> {
        const insertQuery = this.builder.buildInsert();
        await request.update(insertQuery);
        return Promise.resolve(insertQuery);
    }

}