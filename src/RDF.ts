import { LdConverter } from "./LdConverter"
import { QueryBuilder } from "./QueryBuilder"
import { RDFRequest } from "./RDFRequest"
import { Schema, IRDFModel, PropertyValues } from "./models/RDFModel";
import { LDResourceList, LDResource } from "./models/JsonLD";
import { ResourceSchema } from "./ResourceSchema";

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
    public static createModel(schema: ResourceSchema, request: RDFRequest): IRDFModel {
        return new class Model implements IRDFModel {

            public schema: ResourceSchema = schema;
            public request: RDFRequest = request;
            public ldConverter: LdConverter = new LdConverter(request, schema, {});

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
                    const nquads = await this.request.query(selectQuery, { "Accept": "application/n-quads" });
                    if (nquadFunction) nquadFunction(new String(nquads));
                    this.ldConverter.nquads = nquads;
                    const res = await this.ldConverter.toLDResourceList(schema.properties, schema.prefixes)
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
                    const nquads = await this.request.query(selectQuery, { "Accept": "application/n-quads" }); 
                    if (nquadFunction) nquadFunction(new String(nquads));
                    this.ldConverter.nquads = nquads;
                    const res = await this.ldConverter.toLDResource(schema.properties, schema.prefixes)
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
                    const nquads = await this.request.query(selectQuery, { "Accept": "application/n-quads"});
                    if (nquadFunction) nquadFunction(new String(nquads));
                    this.ldConverter.nquads = nquads;
                    const res = await this.ldConverter.toLDResource(schema.properties, schema.prefixes)
                    return Promise.resolve(
                        res
                    );
                } catch (e) {
                    throw new Error(e)
                }
            }

            /**
             * Updates ressources, based on the given updateParameters. If no findParameters are specified, every tuple, that
             * represents the schema, will be updated.
             * @param updateParameters - object, that contains the changes 
             * @param findParameters 
             */
            async update(updateParameters: FindParameters, findParameters?: FindParameters): Promise<boolean> {
                const updateQuery = QueryBuilder.buildFilteredUpdate(schema, updateParameters, findParameters);
                try {
                    await this.request.update(updateQuery);
                    return Promise.resolve(true);
                } catch (e) {
                    throw new Error(e);
                }
            }

            /**
             * Updates a resource, identified by the given identifier.
             * @param identifier 
             * @param updateParameters - object, that contains the changes 
             */
            async updateByIdentifier(identifier: string, updateParameters: FindParameters): Promise<boolean> {
                const updateQuery = QueryBuilder.buildUpdateByIdentifier(schema, updateParameters, identifier);
                try {
                    await this.request.update(updateQuery);
                    return Promise.resolve(true);
                } catch (e) {
                    throw new Error(e);
                }
            }

            /**
             * Creates a LdConverter Object, which can then be used to for example save the given values in a triplestore.
             * @param values - values for every property, specified in the model schema
             */
            async create(values: PropertyValues): Promise<LDResource> {
                this.ldConverter.nquads = {};
                const ld = await this.ldConverter.generateInitialLDResource(values, this.preSaveHook);

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
                    await this.request.update(deleteQuery);
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
                    await this.request.update(deleteQuery);
                    return Promise.resolve(true);
                } catch (e) {
                    throw new Error(e);
                }
            }

            /**
             * Adds the given function as a lifecycle hook. 
             * @param type - type of the lifecycle, e.g. "save"
             * @param callback - function that is called at the specified lifecycle
             */
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
