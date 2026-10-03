export interface SiteConfig {
  name: string;
  role: string;
  description: string;
  email: string;
  githubUrl: string;
  githubHandle: string;
  linkedinUrl: string;
  linkedinHandle: string;
  tonelabsUrl: string;
  sourceUrl: string;
  /** Browser UI colour; matches the paper field. */
  themeColor: string;
}

export const site: SiteConfig = {
  name: "Stephen Glass",
  role: "Software Engineer",
  description:
    "Stephen Glass is a software engineer. Find Stephen on GitHub and LinkedIn, or say hello by email.",
  email: "contact@stephen.glass",
  githubUrl: "https://github.com/stephenglass",
  githubHandle: "@stephenglass",
  linkedinUrl: "https://linkedin.com/in/stephen-glass",
  linkedinHandle: "in/stephen-glass",
  tonelabsUrl: "https://tonelabs.io",
  sourceUrl: "https://github.com/stephenglass/stephenglass",
  themeColor: "#f7f6f4",
};
