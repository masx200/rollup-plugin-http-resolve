import type { CacheType } from "./CacheType";
import { Plugin } from "rollup";
import { fileCache } from "./fileCache";
import installNodeFetch from "@hattip/polyfills/node-fetch";
import path from "path";

export type ResolveIdFallback = (
    specifier: string,
    importer?: string
) => string | void;

function isHttpProtocol(id: string | undefined | null) {
    return id?.startsWith("http://") || id?.startsWith("https://");
}

const DEBUG = false;
const log = (...args: any) => DEBUG && console.log(...args);
export type HttpResolveOptions = {
    cache?: CacheType;
    fetcher?: (url: string) => Promise<string>;
    onRequest?: (url: string) => void;
    onUseCache?: (url: string) => void;
    resolveIdFallback?: ResolveIdFallback;
};
export const defaultCache = new Map();
export const httpResolve = function httpResolve_({
    cache = defaultCache,
    onRequest,
    onUseCache,
    fetcher,
    resolveIdFallback,
}: HttpResolveOptions = {}) {
    installNodeFetch();
    return {
        name: "rollup-plugin-http-resolve",
        async resolveId(id: string, importer: string) {
            if (/^https?:\/\//.test(id)) return id;
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
                    log(
                        "[http-reslove:end] return with host root",
                        `${protocol}//${host}${id}`
                    );
                    return `${protocol}//${host}${id}`;
                } else if (id.startsWith(".")) {
                    // pattern: ./xxx/yyy in https://esm.sh
                    const resolvedPathname = path.join(
                        path.dirname(pathname),
                        id
                    );
                    const newId = `${protocol}//${host}${resolvedPathname}`;
                    log("[http-resolve:end] return with relativePath", newId);
                    return newId;
                }
            } else if (resolveIdFallback) {
                const fallbacked = resolveIdFallback(id, importer);
                log("[http-resolve:end] use fallback to", id, "=>", fallbacked);
                if (fallbacked) {
                    return fallbacked;
                }
            }
        },
        async load(id: string) {
            log("[http-resolve:load]", id);
            if (id === null) {
                return;
            }
            if (isHttpProtocol(id)) {
                const cached = await cache.get(id);
                if (cached) {
                    onUseCache?.(id);
                    return cached;
                }
                onRequest?.(id);
                if (fetcher) {
                    const code = await fetcher(id);
                    await cache.set(id, code);
                    return code;
                } else {
                    const res = await fetch(id, {
                        headers: {
                            "User-Agent":
                                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.54",
                        },
                    });
                    if (!res.ok) {
                        throw res.statusText;
                    }
                    const code = await res.text();
                    await cache.set(id, code);
                    return code;
                }
            }
        },
    } as Plugin;
};
export { CacheType, fileCache };
