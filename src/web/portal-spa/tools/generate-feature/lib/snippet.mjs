import {
  segmentToCamel,
  slugToCamel,
  slugToFeatureEnvConst,
  slugToPascal,
  slugToRoutesKey,
} from "./slug.mjs";

/**
 * @param {{ slug: string; segment: string; noRoute?: boolean; noFeatureFlag?: boolean }} p
 */
export function printFollowUpSnippet(p) {
  const { slug, segment, noRoute, noFeatureFlag } = p;
  const envConst = slugToFeatureEnvConst(slug);
  const routesKey = slugToRoutesKey(slug);
  const pascal = slugToPascal(slug);
  const camel = slugToCamel(slug);
  const segmentKey = segmentToCamel(segment);

  const routesBlock = noRoute
    ? `  ${routesKey}: {
    home: "/${slug}",
  },`
    : `  ${routesKey}: {
    home: "/${slug}",
    ${segmentKey}: "/${slug}/${segment}",
  },`;

  console.log(`
--- Manual follow-up (not modified by this tool) ---

1) Add routes in src/common/lib/core/routes.js (inside ROUTES), e.g.:

${routesBlock}

  Then replace string paths in src/app/[locale]/${slug}/layout.tsx
  (moduleConfig / destPath) with ROUTES.${routesKey}.* when ready.

2) Optional: add sidebar/breadcrumb keys to common layout messages
   (src/common/lib/_messages/*.json) if you switch from the generated
   "shell" namespace to shared layout.* keys.

3) Run: pnpm exec tsc --noEmit

4) Feature flag (first touch): unless you used --no-feature-flag, the generator
   adds ${envConst} to src/env.js (server + runtimeEnv), registers ${camel}.enabled
   in src/common/lib/feature-flags/config.ts, and documents ${envConst}=false in
   .env.example. Copy the variable into your local .env; gate routes/layout with
   getFeatureFlags() / FeatureKey "${camel}.enabled" when you are ready (see
   docs/content/handbook/philosophy.md).

Module alias for imports: @${slug}/… (e.g. @${slug}/_apis/types)
Suggested ROUTES key: ${routesKey}  (camelCase of "${slug}")
Layout component prefix: ${pascal}  / config var: ${camel}
${noFeatureFlag ? "\n(You passed --no-feature-flag: add env + config + .env.example manually if needed.)\n" : ""}`);
}
