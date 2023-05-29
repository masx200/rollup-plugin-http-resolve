export interface CacheType {
    set(key: string, value: string): Promise<any> | any;
    get(key: string): Promise<string | undefined> | string | undefined;
}
