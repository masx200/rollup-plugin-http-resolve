"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpResolve = void 0;
const path_1 = __importDefault(require("path"));
function isHttpProtocol(id) {
    return (id === null || id === void 0 ? void 0 : id.startsWith("http://")) || (id === null || id === void 0 ? void 0 : id.startsWith("https://"));
}
const DEBUG = false;
const log = (...args) => DEBUG && console.log(...args);
const defaultCache = new Map();
const httpResolve = function httpResolve_({ cache = defaultCache, onRequest, onUseCache, fetcher, resolveIdFallback, } = {}) {
    return {
        name: "http-resolve",
        async resolveId(id, importer) {
            log("[http-resolve:resolveId:enter]", id, "from", importer);
            // on network resolve
            if (importer && isHttpProtocol(importer)) {
                if (id.startsWith("https://")) {
                    log("[http-reslove:end] return with https", id);
                    return id;
                }
                const { pathname, protocol, host } = new URL(importer);
                // for skypack
                if (id.startsWith("/")) {
                    // pattern: /_/ in https://cdn.skypack.dev
                    log("[http-reslove:end] return with host root", `${protocol}//${host}${id}`);
                    return `${protocol}//${host}${id}`;
                }
                else if (id.startsWith(".")) {
                    // pattern: ./xxx/yyy in https://esm.sh
                    const resolvedPathname = path_1.default.join(path_1.default.dirname(pathname), id);
                    const newId = `${protocol}//${host}${resolvedPathname}`;
                    log("[http-resolve:end] return with relativePath", newId);
                    return newId;
                }
            }
            else if (resolveIdFallback) {
                const fallbacked = resolveIdFallback(id, importer);
                log("[http-resolve:end] use fallback to", id, "=>", fallbacked);
                if (fallbacked) {
                    return fallbacked;
                }
            }
        },
        async load(id) {
            log("[http-resolve:load]", id);
            if (id === null) {
                return;
            }
            if (isHttpProtocol(id)) {
                const cached = await cache.get(id);
                if (cached) {
                    onUseCache === null || onUseCache === void 0 ? void 0 : onUseCache(id);
                    return cached;
                }
                onRequest === null || onRequest === void 0 ? void 0 : onRequest(id);
                if (fetcher) {
                    const code = await fetcher(id);
                    await cache.set(id, code);
                    return code;
                }
                else {
                    const res = await fetch(id);
                    if (!res.ok) {
                        throw res.statusText;
                    }
                    const code = await res.text();
                    await cache.set(id, code);
                    return code;
                }
            }
        },
    };
};
exports.httpResolve = httpResolve;
