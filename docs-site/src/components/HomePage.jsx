import { Link } from 'react-router-dom'

const featuredDocs = [
  {
    slug: 'installation',
    icon: '📦',
    title: 'Installation',
    description: 'Download a native executable — no Python required. Or install via pip.'
  },
  {
    slug: 'quick-start',
    icon: '🚀',
    title: 'Quick Start',
    description: 'Set up an environment, authenticate, and run your first commands in under a minute.'
  },
  {
    slug: 'configuration',
    icon: '⚙️',
    title: 'Configuration',
    description: 'Manage environments, endpoints, and multi-node setups.'
  },
  {
    slug: 'ci-automation',
    icon: '🤖',
    title: 'CI / Automation',
    description: 'Use the CLI in GitHub Actions, shell scripts, and non-interactive pipelines.'
  }
]

function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <h1>HAC Client CLI</h1>
        <p className="subtitle">
          Command-line interface for the SAP Commerce HAC (Hybris Administration Console).
          Execute Groovy, FlexibleSearch, Impex, and system updates from your terminal.
        </p>
        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/docs/installation" className="home-card" style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '10px 24px',
            background: 'var(--accent-primary)',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem'
          }}>
            Get Started →
          </Link>
          <a href="https://github.com/SapCommerceTools/hac-client-cli" className="home-card" style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '10px 24px',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            border: '1px solid var(--border-subtle)'
          }}>
            GitHub ↗
          </a>
        </div>
      </section>

      <section className="home-cards">
        {featuredDocs.map((doc) => (
          <Link key={doc.slug} to={`/docs/${doc.slug}`} className="home-card">
            <span className="home-card-icon">{doc.icon}</span>
            <h3>{doc.title}</h3>
            <p>{doc.description}</p>
          </Link>
        ))}
      </section>

      <section style={{ marginTop: '64px' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 600, 
          marginBottom: '24px',
          color: 'var(--text-primary)'
        }}>
          Commands
        </h2>
        
        <div style={{
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', color: 'var(--text-primary)', fontWeight: 600 }}>Command</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', color: 'var(--text-primary)', fontWeight: 600 }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['hac groovy', 'Execute Groovy scripts inline or from files'],
                ['hac flexsearch', 'Run FlexibleSearch queries (table, CSV, JSON)'],
                ['hac impex', 'Import Impex data with validation modes'],
                ['hac update', 'System updates, patches, and initialization'],
                ['hac session', 'Start, import, list, and clear sessions'],
                ['hac env', 'Manage environments'],
                ['hac endpoint', 'Manage endpoints within environments'],
                ['hac config', 'View and validate configuration']
              ].map(([cmd, desc], i) => (
                <tr key={cmd} style={{ 
                  borderBottom: i < 7 ? '1px solid var(--border-subtle)' : 'none'
                }}>
                  <td style={{ 
                    padding: '12px 20px', 
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent-primary)',
                    fontSize: '0.9rem',
                    whiteSpace: 'nowrap'
                  }}>
                    {cmd}
                  </td>
                  <td style={{ 
                    padding: '12px 20px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem'
                  }}>
                    {desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginTop: '64px' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 600, 
          marginBottom: '16px',
          color: 'var(--text-primary)'
        }}>
          Architecture
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
          This CLI is a thin adapter over{' '}
          <a href="https://github.com/SapCommerceTools/hac-client-core" style={{ color: 'var(--accent-primary)' }}>
            hac-client-core
          </a>
          . It maps command-line arguments to core library calls, handles configuration
          loading and output formatting, and contains no business logic — safe for automation and scripting.
        </p>
      </section>
    </div>
  )
}

export default HomePage
