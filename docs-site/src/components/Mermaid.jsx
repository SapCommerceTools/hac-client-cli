import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#1e1e2e',
    primaryColor: '#89b4fa',
    primaryTextColor: '#cdd6f4',
    primaryBorderColor: '#585b70',
    lineColor: '#a6adc8',
    secondaryColor: '#f5c2e7',
    tertiaryColor: '#a6e3a1',
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
