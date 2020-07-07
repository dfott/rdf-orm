import { LdConverter } from "./LdConverter"
import { QueryBuilder } from "./QueryBuilder"
import { RDFRequest } from "./RDFRequest"
import { Schema, IRDFModel, PropertyValues } from "./models/RDFModel";
import { LDResourceList, LDResource } from "./models/JsonLD";

export interface FindParameters {
    [propertyName: string]: string | number;
}

export type NquadFunction = (nquads: String) => void;
export type QueryFunction = (query: string) => string;

export type NextFunction = () => void;
export type PreHookFunction = (next: NextFunction, values?: LDResource) => void;

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

            private preSaveHook?: PreHookFunction;

            /**
             * Finds every group of tuples in a triplestore, that represent the created model schema and returns them.
             * @param findParameters? - optional object, that can contain properties and their values to filter the result 
             */
            async find(findParameters?: FindParameters, nquadFunction?: NquadFunction, queryFunction?: QueryFunction): Promise<LDResourceList> {
                let selectQuery = findParameters ? QueryBuilder.buildFindFiltered(schema, findParameters) : 
                    QueryBuilder.buildFind(schema);
                if (queryFunction) selectQuery = queryFunction(selectQuery);
                try {
                    const nquads = await request.query(selectQuery, { "Accept": "application/n-quads" });
                    if (nquadFunction) nquadFunction(new String(nquads));
                    const rdfResult = new LdConverter(request, schema, nquads);
                    const res = await rdfResult.toLDResourceList(schema.properties, schema.prefixes)
                    return Promise.resolve(
                        res
                    );
                } catch (e) {
                    throw new Error(e);
                }
            }

            /**
             * Finds a resource and its properties, based on the given identifier 
             * @param identifier 
             */
            async findByIdentifier(identifier: string, nquadFunction?: NquadFunction, queryFunction?: QueryFunction): Promise<LDResource> {
                let selectQuery = QueryBuilder.buildFindByIdentifier(schema, identifier);
                if (queryFunction) selectQuery = queryFunction(selectQuery);
                try {
                    const nquads = await request.query(selectQuery, { "Accept": "application/n-quads" }); 
                    if (nquadFunction) nquadFunction(new String(nquads));
                    const rdfResult = new LdConverter(request, schema, nquads);
                    const res = await rdfResult.toLDResource(schema.properties, schema.prefixes)
                    return Promise.resolve(
                        res
                    );
                } catch (e) {
                    throw new Error(e);
                }
            }

            /**
             * Finds exactly one resource and its properties, if specified based on the findparameters
             * @param findParameters 
             */
            async findOne(findParameters?: FindParameters, nquadFunction?: NquadFunction, queryFunction?: QueryFunction): Promise<LDResource> {
                let selectQuery = findParameters ? QueryBuilder.buildFindFiltered(schema, findParameters) : 
                    QueryBuilder.buildFind(schema);
                selectQuery = QueryBuilder.limit(1, selectQuery);
                if (queryFunction) selectQuery = queryFunction(selectQuery);
                try {
                    const nquads = await request.query(selectQuery, { "Accept": "application/n-quads"});
                    if (nquadFunction) nquadFunction(new String(nquads));
                    const rdfResult = new LdConverter(request, schema, nquads);
                    const res = await rdfResult.toLDResource(schema.properties, schema.prefixes)
                    return Promise.resolve(
                        res
                    );
                } catch (e) {
                    throw new Error(e)
                }
            }

            /**
             * Creates a LdConverter Object, which can then be used to for example save the given values in a triplestore.
             * @param values - values for every property, specified in the model schema
             */
            async create(values: PropertyValues): Promise<LDResource> {
                const rdfResult =  new LdConverter(request, schema, {});
                const ld = await rdfResult.generateInitialLDResource(values, this.preSaveHook);

                return Promise.resolve(ld);
            }

            /**
             * Deletes every group of tuples in a triplestore, if there is no findParameters object. If there is one, delete every
             * resource that is filtered by the given findParameters values
             * @param findParameters? - optional object, that can contain properties and their values to filter the result 
             */
            async delete(findParameters?: FindParameters, queryFunction?: QueryFunction): Promise<boolean> {
                let deleteQuery = findParameters ? QueryBuilder.buildDeleteFiltered(schema, findParameters) : 
                    QueryBuilder.buildDelete(schema);
                if (queryFunction) deleteQuery = queryFunction(deleteQuery);
                try {
                    await request.update(deleteQuery);
                    return Promise.resolve(true);
                } catch (e) {
                    throw new Error(e);
                }
            }

            /**
             * Deletes a resource and its properties, based on the given identifier 
             * @param identifier 
             */
            async deleteByIdentifier(identifier: string, queryFunction?: QueryFunction): Promise<boolean> {
                let deleteQuery = QueryBuilder.buildDeleteByIdentifier(schema, identifier);
                if (queryFunction) deleteQuery = queryFunction(deleteQuery);
                try {
                    await request.update(deleteQuery);
                    return Promise.resolve(true);
                } catch (e) {
                    throw new Error(e);
                }
            }

            pre(type: string, callback: PreHookFunction) {
                switch(type) {
                    case "save":
                        this.preSaveHook = callback;
                        break;
                }
            }

        }
    }
}
