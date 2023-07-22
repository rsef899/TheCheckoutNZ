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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
// Scrape the paknsave API
var fs_1 = require("fs");
var get_token = (function () {
    var curr;
    return function () {
        return __awaiter(this, void 0, void 0, function () {
            var resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!curr || Date.now() >= curr.expires)) return [3 /*break*/, 2];
                        return [4 /*yield*/, fetch("https://www.paknsave.co.nz/CommonApi/Account/GetCurrentUser").then(function (x) { return x.json(); })];
                    case 1:
                        resp = _a.sent();
                        curr = {
                            token: resp.access_token,
                            expires: Date.parse(resp.expires_time)
                        };
                        _a.label = 2;
                    case 2: return [2 /*return*/, curr.token];
                }
            });
        });
    };
})();
function search(storeId, _a) {
    var _b;
    var search = _a.search, order = _a.order, page = _a.page, category = _a.category;
    return __awaiter(this, void 0, void 0, function () {
        var url;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    url = new URL("https://www.paknsave.co.nz/next/api/products/search");
                    url.searchParams.set("storeId", storeId);
                    url.searchParams.set("q", search);
                    url.searchParams.set("s", order !== null && order !== void 0 ? order : "popularity");
                    url.searchParams.set("pg", (_b = page === null || page === void 0 ? void 0 : page.toString()) !== null && _b !== void 0 ? _b : "1");
                    url.searchParams.set("ps", (999).toString());
                    if (category != null) {
                        url.searchParams.set("category", category);
                    }
                    return [4 /*yield*/, fetch(url).then(function (r) { return r.json(); }).then(function (j) {
                            if ('errors' in j) {
                                var errors = j.errors.map(function (x) { return "'".concat(x.status, ": ").concat(x.message, "'"); }).join(", ");
                                throw new Error("Errors occured: ".concat(errors));
                            }
                            return j;
                        })];
                case 1: return [2 /*return*/, _c.sent()];
            }
        });
    });
}
// TODO: Pre-check the database for existing barcodes
function get_barcode(productId, storeId) {
    return __awaiter(this, void 0, void 0, function () {
        var token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, get_token()];
                case 1:
                    token = _a.sent();
                    return [4 /*yield*/, fetch("https://api-prod.prod.fsniwaikato.kiwi/prod/mobile/store/".concat(storeId, "/product/").concat(productId), {
                            method: 'GET',
                            headers: {
                                "Authorization": "Bearer: ".concat(token)
                            }
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function get_stores() {
    return __awaiter(this, void 0, void 0, function () {
        var token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, get_token()];
                case 1:
                    token = _a.sent();
                    return [4 /*yield*/, fetch("https://api-prod.newworld.co.nz/v1/edge/store", {
                            method: 'GET',
                            headers: {
                                'Authorization': "Bearer ".concat(token),
                            }
                        }).then(function (x) { return x.json(); }).then(function (x) { return x.stores; })];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
var get_category_items = function (category, storeId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Checking category '".concat(category, "'"));
                return [4 /*yield*/, search(storeId, { search: "", category: category })
                        .then(function (j) { var _a; return (_a = j === null || j === void 0 ? void 0 : j.data) === null || _a === void 0 ? void 0 : _a.products; })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
function get_categories(storeId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, search(storeId, { search: "" })
                        .then(function (j) {
                        var _a, _b, _c;
                        console.log("Total expected items: ".concat((_a = j === null || j === void 0 ? void 0 : j.data) === null || _a === void 0 ? void 0 : _a.total));
                        return (_c = (_b = j === null || j === void 0 ? void 0 : j.data) === null || _b === void 0 ? void 0 : _b.facets) === null || _c === void 0 ? void 0 : _c.categories;
                    })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function get_items_from_store(storeId) {
    return __awaiter(this, void 0, void 0, function () {
        var categories, categoryPromises, categoryItems, items;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, get_categories(storeId)];
                case 1:
                    categories = _a.sent();
                    categoryPromises = Object.entries(categories).map(function (_a, i) {
                        var category = _a[0], numItems = _a[1];
                        return __awaiter(_this, void 0, void 0, function () {
                            var items;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (numItems > 1000) {
                                            throw new Error("Category ".concat(category, ", has more than 1000 items, and thus we cannot") +
                                                " retrieve all items. Note, category has ".concat(numItems, " items"));
                                        }
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 150 * i); })];
                                    case 1:
                                        _b.sent();
                                        return [4 /*yield*/, get_category_items(category, storeId)];
                                    case 2:
                                        items = _b.sent();
                                        if (items.length != numItems) {
                                            console.warn(">>> Expected ".concat(numItems, " for category ").concat(category, ", but found ").concat(items.length, " items"));
                                        }
                                        return [2 /*return*/, items];
                                }
                            });
                        });
                    });
                    return [4 /*yield*/, Promise.all(categoryPromises)];
                case 2:
                    categoryItems = _a.sent();
                    items = categoryItems.flat();
                    console.log("Found ".concat(items.length, " items"));
                    (0, fs_1.writeFileSync)("out_".concat(storeId, ".json"), JSON.stringify(items));
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var stores, _i, stores_1, store;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, get_stores()];
                case 1:
                    stores = _a.sent();
                    _i = 0, stores_1 = stores;
                    _a.label = 2;
                case 2:
                    if (!(_i < stores_1.length)) return [3 /*break*/, 5];
                    store = stores_1[_i];
                    console.log("Looking at store ".concat(store.name));
                    return [4 /*yield*/, get_items_from_store(store.id).catch(console.error)];
                case 3:
                    _a.sent();
                    console.log("Finished for store ".concat(store.name));
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    });
}
main();
