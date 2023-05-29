import { Plugin } from "rollup";
export declare type ResolveIdFallback = (
  specifier: string,
  importer?: string,
) => string | void;
declare type HttpResolveOptions = {
  cache?: any;
  fetcher?: (url: string) => Promise<string>;
  onRequest?: (url: string) => void;
  onUseCache?: (url: string) => void;
  resolveIdFallback?: ResolveIdFallback;
};
export declare const httpResolve: ({
  cache,
  onRequest,
  onUseCache,
  fetcher,
  resolveIdFallback,
}?: HttpResolveOptions) => Plugin;
export {};
