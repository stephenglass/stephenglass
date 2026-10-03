export interface SiteConfig {
  name: string;
  description: string;
  email: string;
  githubUrl: string;
  tonelabsUrl: string;
  /** Browser UI colour; matches the paper. */
  themeColor: string;
}

export const site: SiteConfig = {
  name: "Stephen Glass",
  description: "Stephen Glass on GitHub, by email, and at Tonelabs.",
  email: "contact@stephen.glass",
  githubUrl: "https://github.com/stephenglass",
  tonelabsUrl: "https://tonelabs.io",
  themeColor: "#f7f6f4",
};
