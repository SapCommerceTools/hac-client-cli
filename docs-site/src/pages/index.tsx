import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

const commands = [
  ['hac groovy', 'Execute Groovy scripts inline or from files'],
  ['hac flexsearch', 'Run FlexibleSearch queries (table, CSV, JSON)'],
  ['hac impex', 'Import Impex data with validation modes'],
  ['hac update', 'System updates, patches, and initialization'],
  ['hac session', 'Start, import, list, and clear sessions'],
  ['hac env', 'Manage environments'],
  ['hac endpoint', 'Manage endpoints within environments'],
  ['hac config', 'View and validate configuration'],
];

function Hero(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className="hero hero--dark" style={{padding: '4rem 0'}}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle" style={{maxWidth: 600}}>
          Command-line interface for the SAP Commerce HAC (Hybris Administration
          Console). Execute Groovy, FlexibleSearch, Impex, and system updates
          from your terminal.
        </p>
        <div style={{display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap'}}>
          <Link
            className="button button--primary button--lg"
            to="/docs/getting-started/installation">
            Get Started →
          </Link>
          <Link
            className="button button--outline button--lg button--secondary"
            href="https://github.com/SapCommerceTools/hac-client-cli">
            GitHub ↗
          </Link>
        </div>
      </div>
    </header>
  );
}

function Commands(): JSX.Element {
  return (
    <section style={{padding: '3rem 0'}}>
      <div className="container">
        <h2>Commands</h2>
        <table>
          <thead>
            <tr>
              <th>Command</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {commands.map(([cmd, desc]) => (
              <tr key={cmd}>
                <td><code>{cmd}</code></td>
                <td>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Architecture(): JSX.Element {
  return (
    <section style={{padding: '0 0 4rem'}}>
      <div className="container">
        <h2>Architecture</h2>
        <p>
          This CLI is a thin adapter over{' '}
          <a href="https://github.com/SapCommerceTools/hac-client-core">
            hac-client-core
          </a>
          . It maps command-line arguments to core library calls, handles
          configuration loading and output formatting, and contains no business
          logic — safe for automation and scripting.
        </p>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  return (
    <Layout description="CLI for SAP Commerce HAC">
      <Hero />
      <main>
        <Commands />
        <Architecture />
      </main>
    </Layout>
  );
}
