import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
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
