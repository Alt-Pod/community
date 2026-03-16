/**
 * Converts a tool ID like "google.web_search" to its i18n key path "google.webSearch.name"
 * and resolves the translated display name using the provided translation function.
 *
 * Falls back to the raw tool ID if no translation is found.
 */

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export function getToolDisplayName(
  toolId: string,
  t: (key: string) => string
): string {
  const dotIndex = toolId.indexOf(".");
  if (dotIndex === -1) return toolId;

  const category = toolId.slice(0, dotIndex);
  const action = snakeToCamel(toolId.slice(dotIndex + 1));
  const key = `${category}.${action}.name`;

  try {
    const translated = t(key);
    // next-intl returns the key path if not found
    if (translated === key) return toolId;
    return translated;
  } catch {
    return toolId;
  }
}
