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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const toml_1 = __importDefault(require("toml"));
const TOML_PATH = '/.well-known/xahau.toml';
/**
 * Fetch .toml file from manifest domain.
 *
 * @param domain - To fetch the .toml file from.
 * @throws If there is an error fetching .toml file.
 * @returns Parsed .toml file.
 */
function fetchToml(domain) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://${domain}${TOML_PATH}`;
        return (0, axios_1.default)({
            method: 'get',
            url,
            responseType: 'text',
        })
            .then((resp) => __awaiter(this, void 0, void 0, function* () { return resp.data; }))
            .then((tomlData) => __awaiter(this, void 0, void 0, function* () { return toml_1.default.parse(tomlData); }));
    });
}
exports.default = fetchToml;
