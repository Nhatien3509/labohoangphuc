import fs from "node:fs/promises";
import path from "node:path";

import { slugToCamel, slugToFeatureEnvConst } from "./slug.mjs";

/** @param {string} repoRoot */
function envJsPath(repoRoot) {
  return path.join(repoRoot, "src/env.js");
}

/** @param {string} repoRoot */
function featureConfigPath(repoRoot) {
  return path.join(repoRoot, "src/common/lib/feature-flags/config.ts");
}

/** @param {string} repoRoot */
function envExamplePath(repoRoot) {
  return path.join(repoRoot, ".env.example");
}

const ENV_JS_SERVER_ANCHOR =
  "    CONTAINER_REGISTRY_ENABLE: z.boolean().optional().default(false),";
const ENV_JS_RUNTIME_ANCHOR =
  "    CONTAINER_REGISTRY_ENABLE: toBoolean(process.env.CONTAINER_REGISTRY_ENABLE),";

const CONFIG_ANCHOR = `  containerRegistry: {
    enabled: env.CONTAINER_REGISTRY_ENABLE,
  },`;

const ENV_EXAMPLE_ANCHOR =
  "\n# Container registry\nCONTAINER_REGISTRY_ENABLE=false\n";

/**
 * @param {string} slug
 */
export function previewFeatureFlagPatch(slug) {
  const envConst = slugToFeatureEnvConst(slug);
  const camelKey = slugToCamel(slug);
  return {
    envConst,
    camelKey,
    envExampleSnippet: `# ${slug} (module — gen:module)\n${envConst}=false\n`,
    serverLine: `    ${envConst}: z.boolean().optional().default(false),`,
    runtimeLine: `    ${envConst}: toBoolean(process.env.${envConst}),`,
    configSnippet: `  ${camelKey}: {\n    enabled: env.${envConst},\n  },\n`,
  };
}

/**
 * @param {string} repoRoot
 * @param {string} envConst
 * @param {boolean} dryRun
 * @returns {Promise<{ changed: boolean; skipped: boolean; reason?: string }>}
 */
export async function patchEnvJsFeatureFlag(repoRoot, envConst, dryRun) {
  const file = envJsPath(repoRoot);
  const raw = await fs.readFile(file, "utf8");
  if (raw.includes(`${envConst}:`)) {
    return {
      changed: false,
      skipped: true,
      reason: `src/env.js already declares ${envConst}`,
    };
  }
  if (
    !raw.includes(ENV_JS_SERVER_ANCHOR) ||
    !raw.includes(ENV_JS_RUNTIME_ANCHOR)
  ) {
    throw new Error(
      "src/env.js: expected CONTAINER_REGISTRY_ENABLE anchors not found; add feature flag manually.",
    );
  }
  const serverLine = `    ${envConst}: z.boolean().optional().default(false),\n${ENV_JS_SERVER_ANCHOR}`;
  const runtimeLine = `    ${envConst}: toBoolean(process.env.${envConst}),\n${ENV_JS_RUNTIME_ANCHOR}`;
  let next = raw.replace(ENV_JS_SERVER_ANCHOR, serverLine);
  next = next.replace(ENV_JS_RUNTIME_ANCHOR, runtimeLine);
  if (next === raw) {
    throw new Error("src/env.js: failed to insert feature flag.");
  }
  if (dryRun) {
    return { changed: false, skipped: true, reason: "dry-run" };
  }
  await fs.writeFile(file, next, "utf8");
  return { changed: true, skipped: false };
}

/**
 * @param {string} repoRoot
 * @param {string} camelKey
 * @param {string} envConst
 * @param {boolean} dryRun
 * @returns {Promise<{ changed: boolean; skipped: boolean; reason?: string }>}
 */
export async function patchFeatureFlagsConfigFile(
  repoRoot,
  camelKey,
  envConst,
  dryRun,
) {
  const file = featureConfigPath(repoRoot);
  const raw = await fs.readFile(file, "utf8");
  const keyLine = new RegExp(`^\\s{2}${camelKey}:\\s*\\{`, "m");
  if (keyLine.test(raw)) {
    return {
      changed: false,
      skipped: true,
      reason: `config.ts already has ${camelKey}`,
    };
  }
  if (!raw.includes(CONFIG_ANCHOR)) {
    throw new Error(
      "feature-flags/config.ts: expected containerRegistry block anchor not found; patch manually.",
    );
  }
  const insert = `  ${camelKey}: {\n    enabled: env.${envConst},\n  },\n${CONFIG_ANCHOR}`;
  const next = raw.replace(CONFIG_ANCHOR, insert);
  if (next === raw) {
    throw new Error("feature-flags/config.ts: failed to insert module flag.");
  }
  if (dryRun) {
    return { changed: false, skipped: true, reason: "dry-run" };
  }
  await fs.writeFile(file, next, "utf8");
  return { changed: true, skipped: false };
}

/**
 * @param {string} repoRoot
 * @param {string} slug
 * @param {string} envConst
 * @param {boolean} dryRun
 * @returns {Promise<{ changed: boolean; skipped: boolean; reason?: string }>}
 */
export async function patchEnvExampleFeatureFlag(
  repoRoot,
  slug,
  envConst,
  dryRun,
) {
  const file = envExamplePath(repoRoot);
  const raw = await fs.readFile(file, "utf8");
  if (raw.includes(`${envConst}=`)) {
    return {
      changed: false,
      skipped: true,
      reason: `.env.example already has ${envConst}`,
    };
  }
  if (!raw.includes(ENV_EXAMPLE_ANCHOR)) {
    throw new Error(
      ".env.example: expected Container registry section not found; add variable manually.",
    );
  }
  const block = `\n# ${slug} (module — gen:module)\n${envConst}=false${ENV_EXAMPLE_ANCHOR}`;
  const next = raw.replace(ENV_EXAMPLE_ANCHOR, block);
  if (next === raw) {
    throw new Error(".env.example: failed to insert feature flag.");
  }
  if (dryRun) {
    return { changed: false, skipped: true, reason: "dry-run" };
  }
  await fs.writeFile(file, next, "utf8");
  return { changed: true, skipped: false };
}

/**
 * @param {string} repoRoot
 * @param {string} slug
 * @param {{ dryRun: boolean }} opts
 * @returns {Promise<{ envJs: object; featureConfig: object; envExample: object }>}
 */
export async function applyFeatureFlagPatches(repoRoot, slug, opts) {
  const { dryRun } = opts;
  const envConst = slugToFeatureEnvConst(slug);
  const camelKey = slugToCamel(slug);

  const envJs = await patchEnvJsFeatureFlag(repoRoot, envConst, dryRun);
  const featureConfig = await patchFeatureFlagsConfigFile(
    repoRoot,
    camelKey,
    envConst,
    dryRun,
  );
  const envExample = await patchEnvExampleFeatureFlag(
    repoRoot,
    slug,
    envConst,
    dryRun,
  );

  return { envJs, featureConfig, envExample };
}
