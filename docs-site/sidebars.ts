import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/usage',
      ],
    },
    {
      type: 'category',
      label: 'Use Cases',
      items: [
        'use-cases/data-migration',
        'use-cases/data-analysis',
        'use-cases/agentic-coding',
        'use-cases/diagnostics',
        'use-cases/privileged-access',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/security',
        'reference/ci-automation',
      ],
    },
  ],
};

export default sidebars;
