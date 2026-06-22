#!/usr/bin/env node
import { parseArgv, printHelp } from "./lib/argv.mjs";
import { assertValidSlug, assertValidSegment } from "./lib/slug.mjs";
import { buildFilePlan, writeFilePlan, REPO_ROOT } from "./lib/generate.mjs";
import {
  patchTsconfigPaths,
  patchVitestAlias,
  previewTsconfigPatch,
  previewVitestPatch,
} from "./lib/patch-config.mjs";
import {
  applyFeatureFlagPatches,
  previewFeatureFlagPatch,
} from "./lib/patch-feature-flag.mjs";
import { printFollowUpSnippet } from "./lib/snippet.mjs";

async function main() {
  const opts = parseArgv(process.argv);

  if (opts.command === "help" || process.argv.includes("--help")) {
    printHelp();
    process.exit(0);
  }

  if (opts.command !== "module" || !opts.slug) {
    printHelp();
    process.exit(opts.command ? 1 : 0);
  }

  assertValidSlug(opts.slug);
  assertValidSegment(opts.segment);

  const plan = await buildFilePlan({
    slug: opts.slug,
    segment: opts.segment,
    noRoute: opts.noRoute,
    withSampleApi: opts.withSampleApi,
  });

  await writeFilePlan(plan, {
    force: opts.force,
    dryRun: opts.dryRun,
  });

  if (opts.dryRun) {
    const ts = previewTsconfigPatch(REPO_ROOT, opts.slug);
    const vt = previewVitestPatch(REPO_ROOT, opts.slug);
    console.log(
      "[dry-run] tsconfig would add:",
      JSON.stringify(ts.addPath, null, 2),
    );
    console.log("[dry-run] vitest would add line:", vt.line);
    if (!opts.noFeatureFlag) {
      const ff = previewFeatureFlagPatch(opts.slug);
      console.log("[dry-run] feature flag env:", ff.envConst);
      console.log(
        "[dry-run] feature flag config key:",
        `${ff.camelKey}.enabled`,
      );
      console.log("[dry-run] .env.example would add:\n", ff.envExampleSnippet);
    }
  } else {
    const ts = await patchTsconfigPaths(REPO_ROOT, opts.slug);
    const vt = await patchVitestAlias(REPO_ROOT, opts.slug);
    console.log(
      "tsconfig:",
      ts.skipped ? `skipped (${ts.reason})` : "paths updated",
    );
    console.log(
      "vitest:",
      vt.skipped ? `skipped (${vt.reason})` : "alias updated",
    );
    if (!opts.noFeatureFlag) {
      const ff = await applyFeatureFlagPatches(REPO_ROOT, opts.slug, {
        dryRun: false,
      });
      console.log(
        "env.js:",
        ff.envJs.skipped
          ? `skipped (${ff.envJs.reason})`
          : "feature flag added",
      );
      console.log(
        "feature-flags/config.ts:",
        ff.featureConfig.skipped
          ? `skipped (${ff.featureConfig.reason})`
          : "module flag added",
      );
      console.log(
        ".env.example:",
        ff.envExample.skipped
          ? `skipped (${ff.envExample.reason})`
          : "example var added",
      );
    }
  }

  printFollowUpSnippet({
    slug: opts.slug,
    segment: opts.segment,
    noRoute: opts.noRoute,
    noFeatureFlag: opts.noFeatureFlag,
  });
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
