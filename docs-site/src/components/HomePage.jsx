import { Link } from 'react-router-dom'
import { docsSections } from '../docs/index'

const featuredDocs = [
  {
    slug: 'complete-workflow',
    icon: '🚀',
    title: 'Complete Workflow',
    description: 'End-to-end development workflow from scratch creation to publishing. Start here!'
  },
  {
    slug: 'quick-reference',
    icon: '⚡',
    title: 'Quick Reference',
    description: 'Command cheat sheet for daily operations. Common patterns and shortcuts.'
  },
  {
    slug: 'docker-network-setup',
    icon: '🔧',
    title: 'Docker Network Setup',
    description: 'Critical setup for .workspace.local DNS resolution and container networking.'
  },
  {
    slug: 'commerce-lifecycle-design',
    icon: '📐',
    title: 'Commerce Lifecycle',
    description: 'Architecture of the commerce CLI tool, Docker strategy, and snapshot system.'
  }
]

function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <h1>SAP Commerce Dev Tools</h1>
        <p className="subtitle">
          Modern, modular toolkit for SAP Commerce development, deployment, and publishing.
          Agent-first automation with human-friendly interfaces.
        </p>
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
          Quick Links by Role
        </h2>
        
        <div className="home-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="home-card" style={{ cursor: 'default' }}>
            <span className="home-card-icon">👩‍💻</span>
            <h3>New Developers</h3>
            <p>Start with Complete Workflow, then Docker Network Setup</p>
          </div>
          <div className="home-card" style={{ cursor: 'default' }}>
            <span className="home-card-icon">🤖</span>
            <h3>Automation Engineers</h3>
            <p>CLI Design Guide + COMMERCE_WORKSPACE + Quick Reference</p>
          </div>
          <div className="home-card" style={{ cursor: 'default' }}>
            <span className="home-card-icon">🧠</span>
            <h3>AI Agent Integration</h3>
            <p>COMMERCE_WORKSPACE + HAC Integration docs</p>
          </div>
          <div className="home-card" style={{ cursor: 'default' }}>
            <span className="home-card-icon">🏗️</span>
            <h3>System Architects</h3>
            <p>Lifecycle Design + CLI Guide + Publishing Architecture</p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '64px' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 600, 
          marginBottom: '24px',
          color: 'var(--text-primary)'
        }}>
          Tools Overview
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
                <th style={{ padding: '14px 20px', textAlign: 'left', color: 'var(--text-primary)', fontWeight: 600 }}>Tool</th>
                <th style={{ padding: '14px 20px', textAlign: 'left', color: 'var(--text-primary)', fontWeight: 600 }}>Purpose</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['scratch', 'Manage scratch branches'],
                ['checkout', 'Manage Git worktrees'],
                ['workspace', 'Manage SAP Commerce workspaces'],
                ['commerce', 'SAP Commerce lifecycle'],
                ['frontend', 'Frontend lifecycle'],
                ['proxy', 'Reverse proxy instances'],
                ['hac', 'HAC API interaction'],
                ['cch-publish', 'Publishing workflow']
              ].map(([tool, purpose], i) => (
                <tr key={tool} style={{ 
                  borderBottom: i < 7 ? '1px solid var(--border-subtle)' : 'none'
                }}>
                  <td style={{ 
                    padding: '12px 20px', 
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent-primary)',
                    fontSize: '0.9rem'
                  }}>
                    {tool}
                  </td>
                  <td style={{ 
                    padding: '12px 20px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem'
                  }}>
                    {purpose}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default HomePage

