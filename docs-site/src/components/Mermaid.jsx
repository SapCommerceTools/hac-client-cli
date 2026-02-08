import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    darkMode: true,
    background: 'transparent',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    fontSize: '14px',
    primaryColor: '#313244',
    primaryTextColor: '#f5f5f5',
    primaryBorderColor: '#6c7086',
    lineColor: '#9399b2',
    secondaryColor: '#45475a',
    tertiaryColor: '#585b70',
    edgeLabelBackground: '#1e1e2e',
    nodeTextColor: '#f5f5f5',
  },
})

let idCounter = 0

export default function Mermaid({ chart }) {
  const ref = useRef(null)
  const [svg, setSvg] = useState('')

  useEffect(() => {
    const id = `mermaid-${idCounter++}`
    mermaid.render(id, chart).then(({ svg }) => {
      setSvg(svg)
    }).catch((err) => {
      console.error('Mermaid render error:', err)
      setSvg(`<pre style="color:#f38ba8">${err.message || err}</pre>`)
    })
  }, [chart])

  return (
    <div
      ref={ref}
      className="mermaid-diagram"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
