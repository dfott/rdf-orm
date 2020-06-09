import { PropertyValues, Schema, FindParameters } from "./Model"
import { RDFResult } from "./RDFResult"
import { QueryBuilder } from "./QueryBuilder"
import { RDFRequest } from "./RDFRequest"

interface IRDFModel {
    create(values: PropertyValues): RDFResult
    find(findParameters?: FindParameters): Promise<RDFResult>
    findByIdentifier(identifier: string): Promise<RDFResult>
    delete(findParameters?: FindParameters): Promise<boolean>
    deleteByIdentifier(identifier: string): Promise<boolean>
}

// const request = new RDFRequest("http://localhost:3030/test/query", "http://localhost:3030/test/update");
export class RDF {

    public static createModel(schema: Schema, request: RDFRequest): IRDFModel {
        return new class Model implements IRDFModel {

            /**
             * Finds every group of tuples in a triplestore, that represent the created model schema and returns them
             * in a list of object.
             */
            async find(findParameters?: FindParameters): Promise<RDFResult> {
                const selectQuery = findParameters ? QueryBuilder.buildFindFiltered(schema, findParameters) : 
                    QueryBuilder.buildFind(schema);
                const result = await request.query(selectQuery, { "Accept": "application/ld+json" });
                return Promise.resolve(
                    new RDFResult(schema, {} as PropertyValues, selectQuery, result)
                );
            }

            async findByIdentifier(identifier: string): Promise<RDFResult> {
                const selectQuery = QueryBuilder.buildFindByIdentifier(schema, identifier);
                // console.log(selectQuery)
                const result = await request.query(selectQuery, { "Accept": "application/ld+json" }); 
                return Promise.resolve(
                    new RDFResult(schema, {} as PropertyValues, selectQuery, result)
                );
            }

            /**
             * Createas a RDFResult Object, which can then be used to for example save the given values in a triplestore.
             * @param values - values for every property, specified in the model schema
             */
            create(values: PropertyValues): RDFResult {
                return new RDFResult(schema, values);
            }

            async delete(findParameters?: FindParameters): Promise<boolean>{
                const deleteQuery = findParameters ? QueryBuilder.buildDeleteFiltered(schema, findParameters) : 
                    QueryBuilder.buildDelete(schema);
                await request.update(deleteQuery);
                return Promise.resolve(true);
            }

            async deleteByIdentifier(identifier: string): Promise<boolean> {
                const deleteQuery = QueryBuilder.buildDeleteByIdentifier(schema, identifier);
                await request.update(deleteQuery);
                return Promise.resolve(true);
            }

        }
    }
}
