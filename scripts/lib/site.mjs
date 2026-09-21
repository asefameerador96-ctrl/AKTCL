import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Must equal site.url in src/content/site.ts; prerender.mjs fails the build if the app disagrees. */
export const SITE = "https://www.aktcl.com";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const dist = join(root, "dist");

/** dist/about-us/index.html for "/about-us", dist/index.html for "/". */
export const htmlFileFor = (route) => (route === "/" ? join(dist, "index.html") : join(dist, route, "index.html"));
