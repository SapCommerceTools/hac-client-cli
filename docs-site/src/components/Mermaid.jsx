import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  theme: 'base',
  themeVariables: {
    background: 'transparent',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
    fontSize: '15px',
    primaryColor: '#2a3a4e',
    primaryBorderColor: '#4a6a8a',
    primaryTextColor: '#e8edf3',
    lineColor: '#6a9fd8',
    secondaryColor: '#1e2d3d',
    tertiaryColor: '#243447',
    edgeLabelBackground: 'transparent',
    clusterBkg: '#1e2d3d',
    clusterBorder: '#4a6a8a',
    nodeTextColor: '#e8edf3',
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
