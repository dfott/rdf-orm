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
var RDFRequest_1 = require("./RDFRequest");
var request = new RDFRequest_1.RDFRequest("http://localhost:3030/test/query", "http://localhost:3030/test/update");
var RDFResult = /** @class */ (function () {
    function RDFResult(schema, values, query, result) {
        this.schema = schema;
        this.values = values;
        this.query = query;
        this.result = result;
        this.updated = false;
        this.builder = new QueryBuilder_1.QueryBuilder(this.schema, this.values);
        if (result) {
            this.values = this.extractPropertiesFromJsonLD(result);
            this.updated = true;
        }
    }
    RDFResult.prototype.save = function () {
        return __awaiter(this, void 0, void 0, function () {
            var insertQuery;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.updated) return [3 /*break*/, 2];
                        insertQuery = this.builder.buildInsert();
                        return [4 /*yield*/, request.update(insertQuery)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, Promise.resolve(insertQuery)];
                    case 2: return [2 /*return*/, this.update()];
                }
            });
        });
    };
    RDFResult.prototype.update = function () {
        return __awaiter(this, void 0, void 0, function () {
            var updateQuery;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateQuery = this.builder.buildUpdate(this.values);
                        return [4 /*yield*/, request.update(updateQuery)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, Promise.resolve(updateQuery)];
                }
            });
        });
    };
    RDFResult.prototype.extractPropertiesFromJsonLD = function (defaultJson) {
        var _this = this;
        var propertyValues = {};
        Object.keys(defaultJson).forEach(function (key) {
            if (_this.propertyExists(key, _this.schema.properties)) {
                propertyValues[key] = defaultJson[key];
            }
            else if (_this.propertyExists(key.split(":")[1], _this.schema.properties)) {
                propertyValues[key.split(":")[1]] = defaultJson[key];
            }
            else if (key === "@id") {
                // -------------- TODO -----------------------------
                // make sure that this function can be applied to most of the use cases + write tests to confirm
                var id = defaultJson["@id"];
                var split = id.split("/");
                if (split.length >= 2) {
                    propertyValues.identifier = split[split.length - 1];
                    //     const resourceSchema = this.schema.prefixes[split[0]];
                    //     propertyValues.identifier = `${resourceSchema}${
                    //         id.substr(id.indexOf(":") + 1)
                    //     }`;
                }
            }
        });
        return propertyValues;
    };
    RDFResult.prototype.propertyExists = function (key, properties) {
        return Object.keys(properties).indexOf(key) !== -1;
    };
    return RDFResult;
}());
exports.RDFResult = RDFResult;
