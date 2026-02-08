import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  theme: 'base',
  themeVariables: {
    background: '#f5f7fa',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    fontSize: '14px',
    primaryColor: '#e8eef6',
    primaryBorderColor: '#b0c4de',
    primaryTextColor: '#2c3e50',
    lineColor: '#7ba0c9',
    secondaryColor: '#f0f4f8',
    tertiaryColor: '#dce6f0',
    edgeLabelBackground: '#f5f7fa',
    clusterBkg: '#f0f4f8',
    clusterBorder: '#b0c4de',
    nodeTextColor: '#2c3e50',
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
      setSvg(`<pre style="color:#c0392b">${err.message || err}</pre>`)
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
