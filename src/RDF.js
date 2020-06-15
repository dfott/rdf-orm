"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var RDFResult_1 = require("./RDFResult");
var QueryBuilder_1 = require("./QueryBuilder");
// const request = new RDFRequest("http://localhost:3030/test/query", "http://localhost:3030/test/update");
var RDF = /** @class */ (function () {
    function RDF() {
    }
    RDF.createModel = function (schema, request) {
        return new /** @class */ (function () {
            function Model() {
            }
            /**
             * Finds every group of tuples in a triplestore, that represent the created model schema and returns them
             * in a list of object.
             * @param findParameters? - optional object, that can contain properties and their values to filter the result
             */
            Model.prototype.find = function (findParameters) {
                return __awaiter(this, void 0, void 0, function () {
                    var selectQuery, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                selectQuery = findParameters ? QueryBuilder_1.QueryBuilder.buildFindFiltered(schema, findParameters) :
                                    QueryBuilder_1.QueryBuilder.buildFind(schema);
                                return [4 /*yield*/, request.query(selectQuery, { "Accept": "application/ld+json" })];
                            case 1:
                                result = _a.sent();
                                return [2 /*return*/, Promise.resolve(new RDFResult_1.RDFResult(schema, {}, selectQuery, result))];
                        }
                    });
                });
            };
            /**
             * Finds a resource and its properties, based on the given identifier
             * @param identifier
             */
            Model.prototype.findByIdentifier = function (identifier) {
                return __awaiter(this, void 0, void 0, function () {
                    var selectQuery, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                selectQuery = QueryBuilder_1.QueryBuilder.buildFindByIdentifier(schema, identifier);
                                return [4 /*yield*/, request.query(selectQuery, { "Accept": "application/ld+json" })];
                            case 1:
                                result = _a.sent();
                                return [2 /*return*/, Promise.resolve(new RDFResult_1.RDFResult(schema, {}, selectQuery, result))];
                        }
                    });
                });
            };
            /**
             * Createas a RDFResult Object, which can then be used to for example save the given values in a triplestore.
             * @param values - values for every property, specified in the model schema
             */
            Model.prototype.create = function (values) {
                return new RDFResult_1.RDFResult(schema, values);
            };
            /**
             * Deletes every group of tuples in a triplestore, if there is no findParameters object. If there is one, delete every
             * resource that is filtered by the given findParameters values
             * @param findParameters? - optional object, that can contain properties and their values to filter the result
             */
            Model.prototype["delete"] = function (findParameters) {
                return __awaiter(this, void 0, void 0, function () {
                    var deleteQuery;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                deleteQuery = findParameters ? QueryBuilder_1.QueryBuilder.buildDeleteFiltered(schema, findParameters) :
                                    QueryBuilder_1.QueryBuilder.buildDelete(schema);
                                return [4 /*yield*/, request.update(deleteQuery)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/, Promise.resolve(true)];
                        }
                    });
                });
            };
            /**
             * Deletes a resource and its properties, based on the given identifier
             * @param identifier
             */
            Model.prototype.deleteByIdentifier = function (identifier) {
                return __awaiter(this, void 0, void 0, function () {
                    var deleteQuery;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                deleteQuery = QueryBuilder_1.QueryBuilder.buildDeleteByIdentifier(schema, identifier);
                                return [4 /*yield*/, request.update(deleteQuery)];
                            case 1:
                                _a.sent();
                                return [2 /*return*/, Promise.resolve(true)];
                        }
                    });
                });
            };
            return Model;
        }());
    };
    return RDF;
}());
exports.RDF = RDF;
