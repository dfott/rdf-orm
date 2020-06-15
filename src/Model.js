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
var QueryBuilder_1 = require("./QueryBuilder");
// const request = new RDFRequest('http://localhost:3030/test/query', 'http://localhost:3030/test/update');
var RDF = /** @class */ (function () {
    function RDF() {
    }
    RDF.createModel = function (schema, request) {
        return /** @class */ (function () {
            function Model(values) {
                this.schema = schema;
                this.edited = false;
                this.values = values;
                this.query = new QueryBuilder_1.QueryBuilder(this.schema, this.values);
            }
            Model.prototype.save = function (sendRequest) {
                return __awaiter(this, void 0, void 0, function () {
                    var query, e_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 3, , 4]);
                                query = this.edited ? this.query.generateUpdate(this.values) : this.query.generateCreate();
                                this.setEdited(true);
                                if (!sendRequest) return [3 /*break*/, 2];
                                return [4 /*yield*/, request.update(query)];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2: 
                            // console.log(query)
                            return [2 /*return*/, query];
                            case 3:
                                e_1 = _a.sent();
                                console.log(e_1);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                });
            };
            Model.find = function (findParameters) {
                return __awaiter(this, void 0, void 0, function () {
                    var query, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                query = QueryBuilder_1.QueryBuilder.generateFind(schema, findParameters);
                                return [4 /*yield*/, request.query(query)];
                            case 1:
                                result = _a.sent();
                                return [2 /*return*/, result.bindings];
                        }
                    });
                });
            };
            Model.findJSON = function (findParameters) {
                return __awaiter(this, void 0, void 0, function () {
                    var query;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                query = QueryBuilder_1.QueryBuilder.generateFindJSON(schema, findParameters);
                                return [4 /*yield*/, request.query(query)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                });
            };
            Model.findByIdentifier = function (identifier) {
                return __awaiter(this, void 0, void 0, function () {
                    var query, result, objValues, rdfObj;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                query = QueryBuilder_1.QueryBuilder.generateFindByIdentifier(schema, identifier);
                                return [4 /*yield*/, request.query(query)];
                            case 1:
                                result = _a.sent();
                                objValues = { identifier: identifier };
                                try {
                                    Object.keys(result.bindings[0]).forEach(function (prop) { return objValues[prop] = result.bindings[0][prop].value; });
                                    rdfObj = new RDFObject(objValues, schema, request);
                                    return [2 /*return*/, rdfObj];
                                }
                                catch (e) {
                                    return [2 /*return*/, {}];
                                }
                                return [2 /*return*/];
                        }
                    });
                });
            };
            Model.findByKey = function (keyValue) {
                return __awaiter(this, void 0, void 0, function () {
                    var query, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                query = QueryBuilder_1.QueryBuilder.generateFindByKey(schema, keyValue);
                                return [4 /*yield*/, request.query(query)];
                            case 1:
                                result = _a.sent();
                                return [2 /*return*/];
                        }
                    });
                });
            };
            Model["delete"] = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var query, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                query = QueryBuilder_1.QueryBuilder.generateDelete(schema);
                                return [4 /*yield*/, request.update(query)];
                            case 1:
                                result = _a.sent();
                                return [2 /*return*/];
                        }
                    });
                });
            };
            Model.prototype.setEdited = function (edited) {
                this.edited = edited;
            };
            return Model;
        }());
    };
    return RDF;
}());
exports.RDF = RDF;
var RDFObject = /** @class */ (function () {
    function RDFObject(values, schema, request) {
        this.values = values;
        this.schema = schema;
        this.request = request;
        this.query = new QueryBuilder_1.QueryBuilder(schema, values);
    }
    RDFObject.prototype.save = function () {
        return __awaiter(this, void 0, void 0, function () {
            var query, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        query = this.query.generateUpdate(this.values);
                        return [4 /*yield*/, this.request.update(query)];
                    case 1:
                        _a.sent();
                        console.log(query);
                        return [2 /*return*/, query];
                    case 2:
                        e_2 = _a.sent();
                        console.log(e_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return RDFObject;
}());
exports.RDFObject = RDFObject;
