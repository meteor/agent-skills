import matter from "gray-matter";
import { load } from "js-yaml";

// gray-matter's default YAML engine still calls the removed v3 safeLoad API.
// Use v4's safe-by-default loader without changing gray-matter's global engines.
export function parseFrontmatter(raw) {
  return matter(raw, { engines: { yaml: { parse: load } } });
}
