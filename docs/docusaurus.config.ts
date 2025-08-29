import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "LOST Documentation",
  tagline: "",
  favicon: "img/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://docs.lost.training",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "L3bm GmbH", // Usually your GitHub org/user name.
  projectName: "l3p-cv/lost", // Usually your repo name.

  trailingSlash: false,
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/l3p-cv/lost/tree/master/docs/",
        },
        blog: false,
        // blog: {
        //   showReadingTime: true,
        //   feedOptions: {
        //     type: ["rss", "atom"],
        //     xslt: true,
        //   },
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl:
        //     "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        //   // Useful options to enforce blogging best practices
        //   onInlineTags: "warn",
        //   onInlineAuthors: "warn",
        //   onUntruncatedBlogPosts: "warn",
        // },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      style: "primary",
      title: "Documentation",
      logo: {
        alt: "LOST logo",
        src: "img/lost_logo.png",
      },
      items: [
        {
          to: "/",
          position: "left",
          label: "Welcome",
        },
        {
          to: "/docs",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://github.com/l3p-cv/lost",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        // {
        //   title: "Docs",
        //   items: [
        //     // {
        //     //   label: "Docs",
        //     //   to: "/docs/",
        //     // },
        //   ],
        // },
        // {
        //   title: "Community",
        //   items: [
        //     // {
        //     //   label: "GitHub",
        //     //   href: "https://github.com/l3p-cv/lost",
        //     // },
        //   ],
        // },
        // {
        //   title: "More",
        //   items: [
        //     // {
        //     //   label: "L3bm GmbH",
        //     //   href: "https://l3bm.com",
        //     // },
        //   ],
        // },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} L3bm GmbH, Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
