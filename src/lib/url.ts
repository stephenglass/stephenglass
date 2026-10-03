/** `import.meta.env.BASE_URL`, normalised to end in a slash. */
const BASE = import.meta.env.BASE_URL.replace(/\/?$/, "/");

/** Prefix a site path with the deploy base (e.g. "/stephenglass/"). */
export const withBase = (path = ""): string => BASE + path.replace(/^\//, "");

/** Absolute URL for a site path, including the deploy base. */
export const absoluteUrl = (path: string, site: URL | undefined): string =>
  new URL(withBase(path), site ?? "https://stephen.glass").href;
