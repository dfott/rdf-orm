import { LdConverter } from "./LdConverter"
import { QueryBuilder } from "./QueryBuilder"
import { RDFRequest } from "./RDFRequest"
import { Schema, IRDFModel, PropertyValues } from "./models/RDFModel";
import { LDResourceList, LDResource } from "./models/JsonLD";

export interface FindParameters {
    [propertyName: string]: string | number;
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

            public schema: Schema = schema;

            /**
             * Finds every group of tuples in a triplestore, that represent the created model schema and returns them.
             * @param findParameters? - optional object, that can contain properties and their values to filter the result 
             */
            async find(findParameters?: FindParameters): Promise<LDResourceList> {
                const selectQuery = findParameters ? QueryBuilder.buildFindFiltered(schema, findParameters) : 
                    QueryBuilder.buildFind(schema);
                const nquads = await request.query(selectQuery, { "Accept": "application/n-quads" });
                const rdfResult = new LdConverter(request, schema, nquads, true);
                const res = await rdfResult.toLDResourceList(schema.properties, schema.prefixes)
                return Promise.resolve(
                    res
                );
            }

            /**
             * Finds a resource and its properties, based on the given identifier 
             * @param identifier 
             */
            async findByIdentifier(identifier: string): Promise<LDResource> {
                const selectQuery = QueryBuilder.buildFindByIdentifier(schema, identifier);
                // console.log(selectQuery)
                const nquads = await request.query(selectQuery, { "Accept": "application/n-quads" }); 
                const rdfResult = new LdConverter(request, schema, nquads, true);
                const res = await rdfResult.toLDResource(schema.properties, schema.prefixes)
                return Promise.resolve(
                    res
                );
            }

            /**
             * Finds exactly one resource and its properties, if specified based on the findparameters
             * @param findParameters 
             */
            async findOne(findParameters?: FindParameters): Promise<LDResource> {
                let selectQuery = findParameters ? QueryBuilder.buildFindFiltered(schema, findParameters) : 
                    QueryBuilder.buildFind(schema);
                selectQuery = QueryBuilder.limit(1, selectQuery);
                const nquads = await request.query(selectQuery, { "Accept": "application/n-quads"});
                const rdfResult = new LdConverter(request, schema, nquads, true);
                const res = await rdfResult.toLDResource(schema.properties, schema.prefixes)
                return Promise.resolve(
                    res
                );
            }

            /**
             * Creates a LdConverter Object, which can then be used to for example save the given values in a triplestore.
             * @param values - values for every property, specified in the model schema
             */
            async create(values: PropertyValues): Promise<LDResource> {
                const rdfResult =  new LdConverter(request, schema, {}, false);
                const ld = await rdfResult.generateInitialLDResource(values);

                return Promise.resolve(ld);
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
