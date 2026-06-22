import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  patchEnvExampleFeatureFlag,
  patchEnvJsFeatureFlag,
  patchFeatureFlagsConfigFile,
  previewFeatureFlagPatch,
} from "./patch-feature-flag.mjs";

test("previewFeatureFlagPatch", () => {
  const p = previewFeatureFlagPatch("billing-widget");
  assert.equal(p.envConst, "BILLING_WIDGET_ENABLE");
  assert.equal(p.camelKey, "billingWidget");
  assert.match(p.envExampleSnippet, /BILLING_WIDGET_ENABLE=false/);
});

test("patchEnvJsFeatureFlag inserts before container registry anchors", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "cc-gen-ff-"));
  const envDir = path.join(dir, "src");
  await fs.mkdir(envDir, { recursive: true });
  const body = `// stub
  server: {
    CONTAINER_REGISTRY_ENABLE: z.boolean().optional().default(false),
  },
  runtimeEnv: {
    CONTAINER_REGISTRY_ENABLE: toBoolean(process.env.CONTAINER_REGISTRY_ENABLE),
  },
`;
  await fs.writeFile(path.join(envDir, "env.js"), body, "utf8");

  const r = await patchEnvJsFeatureFlag(dir, "ZZZ_TEST_ENABLE", false);
  assert.equal(r.skipped, false);
  assert.equal(r.changed, true);

  const next = await fs.readFile(path.join(envDir, "env.js"), "utf8");
  assert.match(next, /ZZZ_TEST_ENABLE: z\.boolean/);
  assert.match(next, /ZZZ_TEST_ENABLE: toBoolean/);
});

test("patchEnvJsFeatureFlag skips when already present", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "cc-gen-ff-"));
  const envDir = path.join(dir, "src");
  await fs.mkdir(envDir, { recursive: true });
  await fs.writeFile(
    path.join(envDir, "env.js"),
    `    EXISTING_ENABLE: z.boolean().optional().default(false),
    CONTAINER_REGISTRY_ENABLE: z.boolean().optional().default(false),
  runtimeEnv: {
    CONTAINER_REGISTRY_ENABLE: toBoolean(process.env.CONTAINER_REGISTRY_ENABLE),
`,
    "utf8",
  );

  const r = await patchEnvJsFeatureFlag(dir, "EXISTING_ENABLE", false);
  assert.equal(r.skipped, true);
});

test("patchFeatureFlagsConfigFile inserts before containerRegistry", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "cc-gen-ff-"));
  const rel = path.join("src/common/lib/feature-flags");
  await fs.mkdir(path.join(dir, rel), { recursive: true });
  const cfg = `export const config = {
  dbaas: {
    enabled: env.DBAAS_ENABLE,
  },
  containerRegistry: {
    enabled: env.CONTAINER_REGISTRY_ENABLE,
  },
} as const;
`;
  await fs.writeFile(path.join(dir, rel, "config.ts"), cfg, "utf8");

  const r = await patchFeatureFlagsConfigFile(
    dir,
    "billingWidget",
    "BILLING_WIDGET_ENABLE",
    false,
  );
  assert.equal(r.changed, true);
  const next = await fs.readFile(path.join(dir, rel, "config.ts"), "utf8");
  assert.match(next, /billingWidget:\s*\{/);
  assert.match(next, /env\.BILLING_WIDGET_ENABLE/);
});

test("patchEnvExampleFeatureFlag inserts before Container registry section", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "cc-gen-ff-"));
  const raw = `# DBAAS
DBAAS_ENABLE=false

# Container registry
CONTAINER_REGISTRY_ENABLE=false
`;
  await fs.writeFile(path.join(dir, ".env.example"), raw, "utf8");

  const r = await patchEnvExampleFeatureFlag(
    dir,
    "billing-widget",
    "BILLING_WIDGET_ENABLE",
    false,
  );
  assert.equal(r.changed, true);
  const next = await fs.readFile(path.join(dir, ".env.example"), "utf8");
  assert.match(next, /BILLING_WIDGET_ENABLE=false/);
  assert.match(next, /# billing-widget/);
});
