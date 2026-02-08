import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Fuse from 'fuse.js'
import { docsSections, docsContent } from '../docs/index'

// Build search index from all docs pages
const pages = docsSections.flatMap((section) =>
  section.items.map((item) => ({
    slug: item.slug,
    title: item.title,
    section: section.title,
    icon: item.icon,
    body: (docsContent[item.slug] || '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/[#*_`>\[\]()!|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  }))
)

const fuse = new Fuse(pages, {
  keys: [
    { name: 'title', weight: 3 },
    { name: 'section', weight: 2 },
    { name: 'body', weight: 1 },
  ],
  threshold: 0.35,
  includeMatches: true,
  minMatchCharLength: 2,
})

export default function SearchBox() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // Ctrl/Cmd+K to toggle
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const results = query.length >= 2 ? fuse.search(query, { limit: 8 }) : []

  function go(slug) {
    setOpen(false)
    navigate(`/docs/${slug}`)
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[active]) {
      go(results[active].item.slug)
    }
  }

  if (!open) {
    return (
      <button className="search-trigger" onClick={() => setOpen(true)}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="search-trigger-text">Search…</span>
        <kbd className="search-trigger-kbd">⌘K</kbd>
      </button>
    )
  }

  return (
    <div className="search-overlay" onMouseDown={() => setOpen(false)}>
      <div className="search-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="search-input-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Search documentation…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0) }}
            onKeyDown={onKeyDown}
          />
          <kbd className="search-esc" onClick={() => setOpen(false)}>Esc</kbd>
        </div>

        <div className="search-body">
          {query.length < 2 && (
            <p className="search-hint">Type to search across all pages…</p>
          )}

          {query.length >= 2 && results.length === 0 && (
            <p className="search-hint">No results for &ldquo;{query}&rdquo;</p>
          )}

          {results.map((r, i) => (
            <button
              key={r.item.slug}
              className={`search-hit${i === active ? ' search-hit-active' : ''}`}
              onMouseDown={() => go(r.item.slug)}
              onMouseEnter={() => setActive(i)}
            >
              <span className="search-hit-icon">{r.item.icon}</span>
              <span className="search-hit-text">
                <span className="search-hit-title">{r.item.title}</span>
                <span className="search-hit-section">{r.item.section}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
