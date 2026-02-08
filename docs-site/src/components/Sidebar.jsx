import { NavLink } from 'react-router-dom'
import { docsSections } from '../docs/index'

function Sidebar() {
  return (
    <aside className="sidebar">
      {docsSections.map((section) => (
        <div key={section.title} className="sidebar-section">
          <div className="sidebar-section-title">{section.title}</div>
          <nav>
            <ul className="sidebar-nav">
              {section.items.map((item) => (
                <li key={item.slug}>
                  <NavLink
                    to={`/docs/${item.slug}`}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                  >
                    <span className="sidebar-link-icon">{item.icon}</span>
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className={`badge badge-${item.badge.type}`}>
                        {item.badge.text}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ))}
    </aside>
  )
}

export default Sidebar

