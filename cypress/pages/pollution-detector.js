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
var PollutionDetector = /** @class */ (function () {
    function PollutionDetector() {
        this._originalValues = new Map();
        this._saved = [];
    }
    PollutionDetector.prototype._traverse = function (_a) {
        var callback = _a.callback, done = _a.done, prefix = _a.prefix, root = _a.root, whitelist = _a.whitelist;
        return __awaiter(this, void 0, void 0, function () {
            var _i, _b, key, path, value, _error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (done.has(root)) {
                            return [2 /*return*/];
                        }
                        else {
                            done.add(root);
                        }
                        _i = 0, _b = Object.getOwnPropertyNames(root).sort();
                        _c.label = 1;
                    case 1:
                        if (!(_i < _b.length)) return [3 /*break*/, 8];
                        key = _b[_i];
                        path = prefix + "." + key;
                        if (
                        // whitelisted
                        whitelist.has(path) ||
                            // getter
                            (Object.getOwnPropertyDescriptor(root, key) || {}).get) {
                            return [3 /*break*/, 7];
                        }
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, root[key]];
                    case 3:
                        value = _c.sent();
                        if (!(callback(value, path) && Object(value) === value)) return [3 /*break*/, 5];
                        // object
                        return [4 /*yield*/, this._traverse({
                                callback: callback,
                                done: done,
                                prefix: path,
                                root: value,
                                whitelist: whitelist
                            })];
                    case 4:
                        // object
                        _c.sent();
                        _c.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        _error_1 = _c.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    PollutionDetector.prototype.save = function (prefix, root, whitelist) {
        if (whitelist === void 0) { whitelist = []; }
        return __awaiter(this, void 0, void 0, function () {
            var saved;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        whitelist = whitelist instanceof Set ? whitelist : new Set(whitelist);
                        this._saved.push({ prefix: prefix, root: root, whitelist: whitelist });
                        saved = new Set();
                        return [4 /*yield*/, this._traverse({
                                done: new Set(),
                                prefix: prefix,
                                root: root,
                                whitelist: whitelist,
                                callback: function (value, path) {
                                    _this._originalValues.set(path, { path: path, root: root, value: value });
                                    saved.add(path);
                                    return true;
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, saved];
                }
            });
        });
    };
    PollutionDetector.prototype.check = function () {
        return __awaiter(this, void 0, void 0, function () {
            var added, changed, missing, _i, _a, _b, prefix, root, whitelist;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        added = new Set();
                        changed = new Set();
                        missing = new Set(this._originalValues.keys());
                        _i = 0, _a = this._saved;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        _b = _a[_i], prefix = _b.prefix, root = _b.root, whitelist = _b.whitelist;
                        return [4 /*yield*/, this._traverse({
                                callback: function (value, path) {
                                    missing.delete(path);
                                    var original = _this._originalValues.get(path);
                                    if (typeof original === "undefined") {
                                        // new property
                                        added.add(path);
                                        return false;
                                    }
                                    else if (original.value !== original.value) {
                                        // NaN
                                        if (value === value) {
                                            changed.add(path);
                                        }
                                    }
                                    else {
                                        // object, primitve
                                        if (original.value !== value) {
                                            changed.add(path);
                                        }
                                    }
                                    return true;
                                },
                                done: new Set(),
                                prefix: prefix,
                                root: root,
                                whitelist: whitelist
                            })];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, { added: added, changed: changed, missing: missing }];
                }
            });
        });
    };
    PollutionDetector.prototype.clear = function () {
        this._originalValues.clear();
        this._saved.length = 0;
    };
    return PollutionDetector;
}());
export { PollutionDetector };
//# sourceMappingURL=pollution-detector.js.map