import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
      "react/index": "src/react/index.ts",
      "web/index": "src/web/index.ts",
      "node/index": "src/node/index.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    splitting: false, // keep single-file outputs per entry
    tsconfig: "tsconfig.build.json",
    minify: false,
    target: "es2021",
    outDir: "dist",
    skipNodeModulesBundle: true,
  },
]);
