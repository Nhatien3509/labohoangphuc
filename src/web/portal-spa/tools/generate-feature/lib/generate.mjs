import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  assertValidSegment,
  assertValidSlug,
  segmentToCamel,
  slugToCamel,
  slugToPascal,
  slugToRoutesKey,
} from "./slug.mjs";
import { renderTemplate } from "./render.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");
const TEMPLATES_DIR = path.join(__dirname, "../templates");

/**
 * @param {string} name
 */
async function readTpl(name) {
  const filePath = path.join(TEMPLATES_DIR, name);
  return fs.readFile(filePath, "utf8");
}

/**
 * @param {{
 *   slug: string;
 *   segment: string;
 *   noRoute: boolean;
 *   withSampleApi: boolean;
 * }} opts
 */
export async function buildFilePlan(opts) {
  const { slug, segment, noRoute, withSampleApi } = opts;
  assertValidSlug(slug);
  if (!noRoute) {
    assertValidSegment(segment);
  }

  const PASCAL = slugToPascal(slug);
  const CAMEL = slugToCamel(slug);
  const SEGMENT_CAMEL = segmentToCamel(segment);
  const ROUTES_KEY = slugToRoutesKey(slug);

  const vars = {
    SLUG: slug,
    PASCAL,
    CAMEL,
    SEGMENT: segment,
    SEGMENT_CAMEL,
    ROUTES_KEY,
  };

  /** @type {{ relativePath: string; contents: string }[]} */
  const files = [];

  const [
    apisIndex,
    serverEmpty,
    serverSample,
    actionsTpl,
    typesTpl,
    urnsTpl,
    libIndex,
    libConst,
    libHelpers,
    libValidators,
    messagesEn,
    messagesVi,
    pageTpl,
    schemasTpl,
  ] = await Promise.all([
    readTpl("_apis/index.ts.tpl"),
    readTpl("_apis/server.empty.ts.tpl"),
    readTpl("_apis/server.sample.ts.tpl"),
    readTpl("_apis/server.actions.ts.tpl"),
    readTpl("_apis/types.ts.tpl"),
    readTpl("_apis/urns.ts.tpl"),
    readTpl("_lib/index.ts.tpl"),
    readTpl("_lib/const.ts.tpl"),
    readTpl("_lib/helpers.ts.tpl"),
    readTpl("_lib/validators.ts.tpl"),
    readTpl("_messages/en.json.tpl"),
    readTpl("_messages/vi.json.tpl"),
    readTpl("page.tsx.tpl"),
    readTpl("schemas.ts.tpl"),
  ]);

  const layoutTpl = await readTpl(
    noRoute ? "layout.no-route.tsx.tpl" : "layout.tsx.tpl",
  );

  files.push(
    {
      relativePath: `${slug}/_apis/index.ts`,
      contents: renderTemplate(apisIndex, vars),
    },
    {
      relativePath: `${slug}/_apis/server.ts`,
      contents: renderTemplate(
        withSampleApi ? serverSample : serverEmpty,
        vars,
      ),
    },
    {
      relativePath: `${slug}/_apis/server.actions.ts`,
      contents: renderTemplate(actionsTpl, vars),
    },
    {
      relativePath: `${slug}/_apis/types.ts`,
      contents: renderTemplate(typesTpl, vars),
    },
    {
      relativePath: `${slug}/_apis/urns.ts`,
      contents: renderTemplate(urnsTpl, vars),
    },
    {
      relativePath: `${slug}/_lib/index.ts`,
      contents: renderTemplate(libIndex, vars),
    },
    {
      relativePath: `${slug}/_lib/const.ts`,
      contents: renderTemplate(libConst, vars),
    },
    {
      relativePath: `${slug}/_lib/helpers.ts`,
      contents: renderTemplate(libHelpers, vars),
    },
    {
      relativePath: `${slug}/_lib/validators.ts`,
      contents: renderTemplate(libValidators, vars),
    },
    {
      relativePath: `${slug}/_messages/en.json`,
      contents: renderTemplate(messagesEn, vars),
    },
    {
      relativePath: `${slug}/_messages/vi.json`,
      contents: renderTemplate(messagesVi, vars),
    },
    {
      relativePath: `${slug}/layout.tsx`,
      contents: renderTemplate(layoutTpl, vars),
    },
    { relativePath: `${slug}/_hooks/.gitkeep`, contents: "" },
    { relativePath: `${slug}/_stores/.gitkeep`, contents: "" },
  );

  if (!noRoute) {
    files.push(
      {
        relativePath: `${slug}/${segment}/page.tsx`,
        contents: renderTemplate(pageTpl, vars),
      },
      {
        relativePath: `${slug}/${segment}/_components/schemas.ts`,
        contents: renderTemplate(schemasTpl, vars),
      },
    );
  }

  return { files, localeDir: path.join(REPO_ROOT, "src/app/[locale]") };
}

/**
 * @param {{ files: { relativePath: string; contents: string }[]; localeDir: string }} plan
 * @param {{ force: boolean; dryRun: boolean }} opts
 */
export async function writeFilePlan(plan, opts) {
  const { files, localeDir } = plan;
  const targetRoot = localeDir;
  const moduleDir = path.join(
    targetRoot,
    files[0]?.relativePath.split("/")[0] ?? "",
  );

  if (!opts.force) {
    try {
      await fs.access(moduleDir);
      throw new Error(
        `Module directory already exists: ${moduleDir}\nUse --force to overwrite.`,
      );
    } catch (e) {
      if (/** @type {NodeJS.ErrnoException} */ (e).code !== "ENOENT") {
        throw e;
      }
    }
  } else if (!opts.dryRun) {
    await fs.rm(moduleDir, { recursive: true, force: true });
  }

  for (const f of files) {
    const abs = path.join(targetRoot, f.relativePath);
    if (opts.dryRun) {
      console.log(`[dry-run] write ${path.relative(REPO_ROOT, abs)}`);
      continue;
    }
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, f.contents, "utf8");
  }
}

export { REPO_ROOT };
