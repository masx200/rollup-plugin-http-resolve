import { CacheType } from "./CacheType";
import { createHash } from "node:crypto";
import fse from "fs-extra";
import { homedir } from "node:os";
import path from "node:path";

export class fileCache implements CacheType {
    #cacheFolder = path.join(homedir(), "cache", "fetch");

    #getCachePath(key: string) {
        const hash = createHash("sha512");
        hash.update(key);
        const filename = hash.digest("base64");
        return path.join(this.#cacheFolder, filename);
    }
    async set(key: string, value: string) {
        const filepath = this.#getCachePath(key);
        await fse.ensureFile(filepath);
        return await fse.writeFile(filepath, value, { encoding: "utf-8" });
    }
    async get(key: string) {
        const filepath = this.#getCachePath(key);
        if (!fse.exists(filepath)) {
            return;
        }
        await fse.ensureFile(filepath);

        return await fse.readFile(filepath, "utf-8");
    }
}
