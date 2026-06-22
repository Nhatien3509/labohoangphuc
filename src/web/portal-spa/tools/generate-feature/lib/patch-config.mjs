import fs from "node:fs/promises";
import path from "node:path";

/** @param {string} repoRoot */
function tsconfigPath(repoRoot) {
  return path.join(repoRoot, "tsconfig.json");
}

/** @param {string} repoRoot */
function vitestPath(repoRoot) {
  return path.join(repoRoot, "vitest.config.ts");
}

const dbaasPathsLine = '      "@dbaas/*": ["./src/app/[locale]/dbaas/*"]';

/**
 * tsconfig.json may contain comments — patch textually after the @dbaas path entry.
 * @param {string} repoRoot
 * @param {string} slug
 * @returns {{ changed: boolean; skipped: boolean; reason?: string }}
 */
export async function patchTsconfigPaths(repoRoot, slug) {
  const file = tsconfigPath(repoRoot);
  const raw = await fs.readFile(file, "utf8");
  const key = `"@${slug}/*"`;
  if (raw.includes(`${key}:`)) {
    return {
      changed: false,
      skipped: true,
      reason: `paths ${key} already present`,
    };
  }

  if (!raw.includes(dbaasPathsLine)) {
    throw new Error(
      "tsconfig.json: expected @dbaas/* paths line not found; add alias manually.",
    );
  }

  const insertLine = `      "@${slug}/*": ["./src/app/[locale]/${slug}/*"],\n`;
  const next = raw.replace(
    dbaasPathsLine,
    `${dbaasPathsLine},\n${insertLine.trimEnd()}`,
  );
  if (next === raw) {
    throw new Error("tsconfig.json: failed to insert paths alias.");
  }
  await fs.writeFile(file, next, "utf8");
  return { changed: true, skipped: false };
}

/**
 * Insert Vitest alias after @dbaas line when possible.
 * @param {string} repoRoot
 * @param {string} slug
 * @returns {{ changed: boolean; skipped: boolean; reason?: string }}
 */
export async function patchVitestAlias(repoRoot, slug) {
  const file = vitestPath(repoRoot);
  const raw = await fs.readFile(file, "utf8");
  const aliasKey = `"@${slug}"`;
  if (raw.includes(`${aliasKey}:`)) {
    return {
      changed: false,
      skipped: true,
      reason: `vitest resolve.alias ${aliasKey} already present`,
    };
  }

  const dbaasLine =
    '"@dbaas": path.resolve(__dirname, "src/app/[locale]/dbaas"),';
  if (!raw.includes(dbaasLine)) {
    throw new Error(
      "vitest.config.ts: expected @dbaas alias line not found; patch manually.",
    );
  }

  const insertLine = `      "@${slug}": path.resolve(__dirname, "src/app/[locale]/${slug}"),\n`;
  const next = raw.replace(dbaasLine, `${dbaasLine}\n${insertLine.trimEnd()}`);
  if (next === raw) {
    throw new Error("vitest.config.ts: failed to insert alias.");
  }
  await fs.writeFile(file, next, "utf8");
  return { changed: true, skipped: false };
}

/**
 * @param {string} repoRoot
 * @param {string} slug
 */
export function previewTsconfigPatch(repoRoot, slug) {
  const key = `@${slug}/*`;
  return {
    file: tsconfigPath(repoRoot),
    addPath: { [key]: [`./src/app/[locale]/${slug}/*`] },
  };
}

/**
 * @param {string} repoRoot
 * @param {string} slug
 */
export function previewVitestPatch(repoRoot, slug) {
  return {
    file: vitestPath(repoRoot),
    line: `      "@${slug}": path.resolve(__dirname, "src/app/[locale]/${slug}"),`,
  };
}
