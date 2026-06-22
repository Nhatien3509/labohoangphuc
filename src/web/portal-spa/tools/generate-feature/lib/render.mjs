/**
 * @param {string} template
 * @param {Record<string, string>} vars
 */
export function renderTemplate(template, vars) {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.split(`{{${key}}}`).join(value);
  }
  if (/\{\{[A-Z_]+\}\}/.test(out)) {
    const leftover = [...out.matchAll(/\{\{([A-Z_]+)\}\}/g)].map((m) => m[1]);
    throw new Error(`Unfilled template placeholders: ${leftover.join(", ")}`);
  }
  return out;
}
