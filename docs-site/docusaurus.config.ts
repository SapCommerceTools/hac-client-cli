import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'HAC Client CLI',
  tagline: 'Command-line interface for the SAP Commerce HAC',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://sapcommercetools.github.io',
  baseUrl: '/hac-client-cli/',

  organizationName: 'SapCommerceTools',
  projectName: 'hac-client-cli',

  onBrokenLinks: 'throw',

  markdown: {
    mermaid: true,
  },
  themes: [
    '@docusaurus/theme-mermaid',
    ['@easyops-cn/docusaurus-search-local', {
      hashed: true,
      indexBlog: false,
      docsRouteBasePath: '/docs',
    }],
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/SapCommerceTools/hac-client-cli/tree/master/docs-site/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'HAC Client CLI',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/SapCommerceTools/hac-client-cli',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://pypi.org/project/hac-client-cli/',
          label: 'PyPI',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Installation', to: '/docs/getting-started/installation'},
            {label: 'Usage', to: '/docs/getting-started/usage'},
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Core Library',
              href: 'https://sapcommercetools.github.io/hac-client-core/',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/SapCommerceTools/hac-client-cli',
            },
            {
              label: 'PyPI',
              href: 'https://pypi.org/project/hac-client-cli/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} SapCommerceTools. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'python', 'toml', 'groovy', 'yaml', 'powershell'],
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
