import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { docsSections, docsContent } from '../docs/index'

// Build a flat index of all pages once
const searchIndex = docsSections.flatMap((section) =>
  section.items.map((item) => ({
    slug: item.slug,
    title: item.title,
    section: section.title,
    icon: item.icon,
    // Strip markdown syntax for plain-text search
    body: (docsContent[item.slug] || '')
      .replace(/```[\s\S]*?```/g, '')   // code blocks
      .replace(/[#*_`>\[\]()!|]/g, '')  // markdown chars
      .replace(/\n+/g, ' ')
      .toLowerCase(),
  }))
)

function SearchBox() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // Ctrl+K / Cmd+K to open
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const results = query.trim().length < 2
    ? []
    : searchIndex
        .map((page) => {
          const q = query.toLowerCase()
          let score = 0
          if (page.title.toLowerCase().includes(q)) score += 10
          if (page.section.toLowerCase().includes(q)) score += 5
          if (page.body.includes(q)) score += 1
          // Find a context snippet
          let snippet = ''
          if (score > 0 && page.body.includes(q)) {
            const idx = page.body.indexOf(q)
            const start = Math.max(0, idx - 40)
            const end = Math.min(page.body.length, idx + q.length + 60)
            snippet = (start > 0 ? '…' : '') + page.body.slice(start, end).trim() + (end < page.body.length ? '…' : '')
          }
          return { ...page, score, snippet }
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)

  const go = useCallback(
    (slug) => {
      setOpen(false)
      navigate(`/docs/${slug}`)
    },
    [navigate]
  )

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter' && results[selected]) {
      go(results[selected].slug)
    }
  }

  return (
    <>
      <button className="search-trigger" onClick={() => setOpen(true)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="search-trigger-text">Search docs…</span>
        <kbd className="search-trigger-kbd">Ctrl K</kbd>
      </button>

      {open && (
        <div className="search-overlay" onClick={() => setOpen(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-input-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                className="search-input"
                type="text"
                placeholder="Search documentation…"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
                onKeyDown={onKeyDown}
              />
              <kbd className="search-esc">Esc</kbd>
            </div>

            {query.trim().length >= 2 && (
              <div className="search-results">
                {results.length === 0 ? (
                  <div className="search-empty">No results for "{query}"</div>
                ) : (
                  results.map((r, i) => (
                    <button
                      key={r.slug}
                      className={`search-result ${i === selected ? 'search-result-active' : ''}`}
                      onClick={() => go(r.slug)}
                      onMouseEnter={() => setSelected(i)}
                    >
                      <span className="search-result-icon">{r.icon}</span>
                      <div className="search-result-body">
                        <span className="search-result-title">{r.title}</span>
                        <span className="search-result-section">{r.section}</span>
                        {r.snippet && (
                          <span className="search-result-snippet">{r.snippet}</span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {query.trim().length < 2 && (
              <div className="search-hint">Type at least 2 characters to search</div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default SearchBox
