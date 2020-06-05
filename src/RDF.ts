import { PropertyValues, Schema } from "./Model"
import { RDFResult } from "./RDFResult"
import { QueryBuilder } from "./QueryBuilder"
import { RDFRequest } from "./RDFRequest"

interface IRDFModel {
    create(values: PropertyValues): RDFResult
    find(): Promise<RDFResult>
    findByIdentifier(identifier: string): Promise<RDFResult>
    delete(): Promise<boolean>
}

const request = new RDFRequest("http://localhost:3030/test/query", "http://localhost:3030/test/update");
export class RDF {

    public static createModel(schema: Schema): IRDFModel {
        return new class Model implements IRDFModel {

            /**
             * Finds every group of tuples in a triplestore, that represent the created model schema and returns them
             * in a list of object.
             */
            async find(): Promise<RDFResult> {
                const selectQuery = QueryBuilder.buildFind(schema);
                const result = await request.query(selectQuery);
                return Promise.resolve(
                    new RDFResult(schema, {} as PropertyValues, result.bindings)
                );
            }

            async findByIdentifier(identifier: string): Promise<RDFResult> {
                const selectQuery = QueryBuilder.buildFindByIdentifier(schema, identifier);
                const result = await request.query(selectQuery); 
                return Promise.resolve(
                    new RDFResult(schema, {} as PropertyValues, result.bindings)
                );
            }
            

            /**
             * Createas a RDFResult Object, which can then be used to for example save the given values in a triplestore.
             * @param values - values for every property, specified in the model schema
             */
            create(values: PropertyValues): RDFResult {
                return new RDFResult(schema, values);
            }

            async delete(): Promise<boolean>{
                const deleteQuery = QueryBuilder.buildDelete(schema);
                await request.update(deleteQuery);
                return Promise.resolve(true);
            }

        }
    }
}
