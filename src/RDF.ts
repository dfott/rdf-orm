import { PropertyValues, Schema } from "./Model"
import { RDFResult } from "./RDFResult"
import { QueryBuilder } from "./QueryBuilder"
import { RDFRequest } from "./RDFRequest"

interface IRDFModel {
    create(values: PropertyValues): RDFResult
    find(): Promise<RDFResult>
}

const request = new RDFRequest("http://localhost:3030/test/query", "http://localhost:3030/test/update");
export class RDF {

    public static createModel(schema: Schema): IRDFModel {
        return new class Model implements IRDFModel {
            
            async find(): Promise<RDFResult> {
                const selectQuery = QueryBuilder.buildFind(schema);
                const result = await request.query(selectQuery);
                return Promise.resolve(
                    new RDFResult(schema, {} as PropertyValues, result.bindings)
                );
            }

            create(values: PropertyValues): RDFResult {
                return new RDFResult(schema, values);
            }

        }
    }
}
