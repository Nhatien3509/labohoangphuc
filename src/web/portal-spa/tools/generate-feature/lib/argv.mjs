/**
 * @param {string[]} argv
 * @returns {{
 *   command: string;
 *   slug: string | null;
 *   force: boolean;
 *   dryRun: boolean;
 *   noRoute: boolean;
 *   segment: string;
 *   withSampleApi: boolean;
 *   noFeatureFlag: boolean;
 * }}
 */
export function parseArgv(argv) {
  const args = argv.slice(2);
  let force = false;
  let dryRun = false;
  let noRoute = false;
  let withSampleApi = false;
  let noFeatureFlag = false;
  let segment = "items";
  const positional = [];

  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === undefined) break;
    if (a === "--force") {
      force = true;
      continue;
    }
    if (a === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (a === "--no-route") {
      noRoute = true;
      continue;
    }
    if (a === "--with-sample-api") {
      withSampleApi = true;
      continue;
    }
    if (a === "--no-feature-flag") {
      noFeatureFlag = true;
      continue;
    }
    if (a.startsWith("--segment=")) {
      segment = a.slice("--segment=".length).trim();
      continue;
    }
    if (a === "--segment") {
      const next = args[i + 1];
      if (!next || next.startsWith("--")) {
        throw new Error("--segment requires a value (e.g. --segment items).");
      }
      i += 1;
      segment = next;
      continue;
    }
    if (a.startsWith("--")) {
      throw new Error(`Unknown flag: ${a}`);
    }
    positional.push(a);
  }

  const command = positional[0] ?? "";
  const slug = positional[1] ?? null;

  return {
    command,
    slug,
    force,
    dryRun,
    noRoute,
    segment,
    withSampleApi,
    noFeatureFlag,
  };
}

export function printHelp() {
  console.log(`cloud-console-gen — scaffold a feature slice module (DBaaS-style layout)

Usage:
  pnpm gen:module <slug> [options]

Arguments:
  <slug>     Folder name under src/app/[locale]/ (kebab-case, e.g. my-service)

Options:
  --segment <name>   First route segment (default: items)
  --no-route         Only create module shell (no route folder)
  --with-sample-api  Add a sample GET helper in _apis/server.ts
  --no-feature-flag  Skip patching src/env.js, feature-flags/config.ts, .env.example
  --force            Overwrite existing module directory
  --dry-run          Print actions without writing files
  --help             Show this message

Examples:
  pnpm gen:module billing-widget
  pnpm gen:module my-api --segment home --with-sample-api
`);
}
