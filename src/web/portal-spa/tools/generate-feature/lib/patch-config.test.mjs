import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { patchTsconfigPaths, patchVitestAlias } from "./patch-config.mjs";

test("patchTsconfigPaths is idempotent", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "cc-gen-"));
  const tsconfigFile = path.join(dir, "tsconfig.json");
  const base = `{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@dbaas/*": ["./src/app/[locale]/dbaas/*"]
    }
  }
}
`;
  await fs.writeFile(tsconfigFile, base, "utf8");

  const r1 = await patchTsconfigPaths(dir, "acme-widget");
  assert.equal(r1.changed, true);
  assert.equal(r1.skipped, false);

  const raw = await fs.readFile(tsconfigFile, "utf8");
  assert.match(raw, /"@acme-widget\/\*":/);

  const r2 = await patchTsconfigPaths(dir, "acme-widget");
  assert.equal(r2.changed, false);
  assert.equal(r2.skipped, true);
});

test("patchVitestAlias inserts after @dbaas", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "cc-gen-vitest-"));
  const vitestFile = path.join(dir, "vitest.config.ts");
  const content = `import path from "path";
export default {
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@common": path.resolve(__dirname, "src/common"),
      "@dbaas": path.resolve(__dirname, "src/app/[locale]/dbaas"),
    },
  },
};
`;
  await fs.writeFile(vitestFile, content, "utf8");

  const r1 = await patchVitestAlias(dir, "acme-widget");
  assert.equal(r1.changed, true);

  const next = await fs.readFile(vitestFile, "utf8");
  assert.match(next, /"@acme-widget": path\.resolve/);

  const r2 = await patchVitestAlias(dir, "acme-widget");
  assert.equal(r2.skipped, true);
});
