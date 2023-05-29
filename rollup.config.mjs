import { defineConfig } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import external from "rollup-external-modules";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const plugins = [
    nodeResolve(),
    esbuild({
        // All options are optional
        include: [/\.[jt]sx?$/], // default, inferred from `loaders` option
        exclude: /node_modules/, // default
        sourceMap: true, // default
        minify: true,
        target: "esnext", // default, or 'es20XX', 'esnext'
        jsx: "preserve", // default, or 'preserve'
        jsxFactory: "React.createElement",
        jsxFragment: "React.Fragment",
        // Like @rollup/plugin-replace
        define: {},
        tsconfig: "tsconfig.json", // default
        // Add extra loaders
        loaders: {
            // Add .json files support
            // require @rollup/plugin-commonjs
            // ".json": "json",
            // Enable JSX in .js files too
            // ".js": "jsx",
        },
    }),
];
export default defineConfig([
    {
        external,
        input: "./src/index.ts",
        output: [
            {
                file: "./lib/index.js",
                format: "cjs",
                sourcemap: true,
            },
            {
                file: "./lib/index.mjs",
                format: "esm",
                sourcemap: true,
            },
        ],
        plugins,
    },
]);
