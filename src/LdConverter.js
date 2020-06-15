"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var LdConverter = /** @class */ (function () {
    function LdConverter() {
    }
    LdConverter.convert = function (schema, defaultJson) {
        // console.log("context")
        // console.log(this.buildContext(defaultJson["@context"], schema.properties, schema.prefixes));
        // console.log("values")
        // console.log(this.buildPropertyValues(schema.properties, defaultJson));
        var final = __assign({ "@context": this.buildContext(defaultJson["@context"], schema.properties, schema.prefixes), "@type": defaultJson["@type"], "@id": defaultJson["@id"] }, this.buildPropertyValues(schema.properties, defaultJson));
        console.log(final);
    };
    LdConverter.buildContext = function (context, properties, prefixes) {
        var newContext = {};
        Object.keys(properties).forEach(function (prop) {
            newContext[prop] = "" + prefixes[properties[prop].prefix] + prop;
        });
        return newContext;
    };
    LdConverter.buildPropertyValues = function (properties, defaultJson) {
        var _this = this;
        var propertyValues = {};
        Object.keys(defaultJson).forEach(function (key) {
            if (_this.propertyExists(key, properties)) {
                propertyValues[key] = defaultJson[key];
            }
            else if (_this.propertyExists(key.split(":")[1], properties)) {
                propertyValues[key.split(":")[1]] = defaultJson[key];
            }
        });
        return propertyValues;
    };
    LdConverter.propertyExists = function (key, properties) {
        return Object.keys(properties).indexOf(key) !== -1;
    };
    return LdConverter;
}());
exports.LdConverter = LdConverter;
