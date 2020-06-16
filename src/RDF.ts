import { RDFResult } from "./RDFResult"
import { QueryBuilder } from "./QueryBuilder"
import { RDFRequest } from "./RDFRequest"
export interface PrefixList {
    [prefix: string]: string,
}

export interface Property {
    prefix: string;
    optional?: boolean;
    type?: "uri";
    ref?: object;
    isKey?: boolean;
}

export interface PropertyList {
    [propertyName: string]: Property;
}

export interface PropertyValues {
    identifier: string;
    [propertyName: string]: any;
}

export interface Schema {
    resourceType: string;
    resourceSchema: string;
    prefixes: PrefixList;
    properties: PropertyList;
}

export interface FindParameters {
    [propertyName: string]: string | number;
}

export interface RawModel {
    [propertyName: string] : {
        type: string;
        value: string;
    }
}

export interface ObjectValues {
    [propertyName: string]: string;
}


export interface IRDFModel {
    create(values: PropertyValues): RDFResult
    find(findParameters?: FindParameters): Promise<RDFResult>
    findByIdentifier(identifier: string): Promise<RDFResult>
    delete(findParameters?: FindParameters): Promise<boolean>
    deleteByIdentifier(identifier: string): Promise<boolean>
}

/**
 * This is the main class, used to create a model. The model can then be used to perform all CRUD operations available.
 */
export class RDF {

    /**
     * Creates a model that can be used to perform all CRUD operations.
     * @param schema - schema that provides the necessary information about the model
     * @param request - request object, that will send http requests to a specified triplestore
     */
    public static createModel(schema: Schema, request: RDFRequest): IRDFModel {
        return new class Model implements IRDFModel {

            /**
             * Finds every group of tuples in a triplestore, that represent the created model schema and returns them.
             * @param findParameters? - optional object, that can contain properties and their values to filter the result 
             */
            async find(findParameters?: FindParameters): Promise<RDFResult> {
                const selectQuery = findParameters ? QueryBuilder.buildFindFiltered(schema, findParameters) : 
                    QueryBuilder.buildFind(schema);
                const result = await request.query(selectQuery, { "Accept": "application/ld+json" });
                return Promise.resolve(
                    new RDFResult(request, schema, {} as PropertyValues, selectQuery, result)
                );
            }

            /**
             * Finds a resource and its properties, based on the given identifier 
             * @param identifier 
             */
            async findByIdentifier(identifier: string): Promise<RDFResult> {
                const selectQuery = QueryBuilder.buildFindByIdentifier(schema, identifier);
                // console.log(selectQuery)
                const result = await request.query(selectQuery, { "Accept": "application/ld+json" }); 
                return Promise.resolve(
                    new RDFResult(request, schema, {} as PropertyValues, selectQuery, result)
                );
            }

            /**
             * Createas a RDFResult Object, which can then be used to for example save the given values in a triplestore.
             * @param values - values for every property, specified in the model schema
             */
            create(values: PropertyValues): RDFResult {
                return new RDFResult(request, schema, values);
            }

            /**
             * Deletes every group of tuples in a triplestore, if there is no findParameters object. If there is one, delete every
             * resource that is filtered by the given findParameters values
             * @param findParameters? - optional object, that can contain properties and their values to filter the result 
             */
            async delete(findParameters?: FindParameters): Promise<boolean>{
                const deleteQuery = findParameters ? QueryBuilder.buildDeleteFiltered(schema, findParameters) : 
                    QueryBuilder.buildDelete(schema);
                await request.update(deleteQuery);
                return Promise.resolve(true);
            }

            /**
             * Deletes a resource and its properties, based on the given identifier 
             * @param identifier 
             */
            async deleteByIdentifier(identifier: string): Promise<boolean> {
                const deleteQuery = QueryBuilder.buildDeleteByIdentifier(schema, identifier);
                await request.update(deleteQuery);
                return Promise.resolve(true);
            }

        }
    }
}
