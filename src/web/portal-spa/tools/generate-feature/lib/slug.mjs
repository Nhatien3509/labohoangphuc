/** @param {string} slug */
export function assertValidSlug(slug) {
  if (!slug) {
    throw new Error("Module slug is required (kebab-case, e.g. my-service).");
  }
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(
      `Invalid slug "${slug}". Use kebab-case: lowercase letters, digits, single hyphens (e.g. object-storage).`,
    );
  }
}

/** @param {string} segment */
export function assertValidSegment(segment) {
  assertValidSlug(segment);
}

/** @param {string} slug kebab-case */
export function slugToPascal(slug) {
  return slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

/** @param {string} slug kebab-case */
export function slugToCamel(slug) {
  const pascal = slugToPascal(slug);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/** @param {string} segment route segment (kebab-case) */
export function segmentToCamel(segment) {
  return slugToCamel(segment);
}

/** @param {string} slug kebab-case — key inside ROUTES in routes.js */
export function slugToRoutesKey(slug) {
  return slugToCamel(slug);
}

/** @param {string} slug */
export function tsconfigPathKey(slug) {
  return `@${slug}/*`;
}

/** @param {string} slug */
export function vitestAliasKey(slug) {
  return `@${slug}`;
}

/**
 * Env name for a module master feature flag (matches .env.example / src/env.js).
 * @param {string} slug kebab-case
 * @returns {string} e.g. my-service → MY_SERVICE_ENABLE
 */
export function slugToFeatureEnvConst(slug) {
  return (
    slug
      .split("-")
      .map((part) => part.toUpperCase())
      .join("_") + "_ENABLE"
  );
}
