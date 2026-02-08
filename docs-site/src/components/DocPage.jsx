import { useParams, Navigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import hljs from 'highlight.js'
import { docsContent } from '../docs/index'
import Mermaid from './Mermaid'

function DocPage() {
  const { slug } = useParams()
  const content = docsContent[slug]

  if (!content) {
    return <Navigate to="/" replace />
  }

  return (
    <article className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ inline, className, children, ...props }) => {
            const langMatch = /language-(\w+)/.exec(className || '')
            const lang = langMatch ? langMatch[1] : ''
            const text = String(children).replace(/\n$/, '')

            // Mermaid → render as diagram, no code block
            if (!inline && lang === 'mermaid') {
              return <Mermaid chart={text} />
            }

            // Syntax-highlighted code
            if (!inline && lang && hljs.getLanguage(lang)) {
              const html = hljs.highlight(text, { language: lang }).value
              return (
                <code
                  className={`hljs language-${lang}`}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              )
            }

            return <code className={className} {...props}>{children}</code>
          },
          pre: ({ children, ...props }) => {
            // Mermaid diagrams are returned directly from code — unwrap the <pre>
            const childType = children?.type
            if (childType === Mermaid) {
              return <>{children}</>
            }

            const cls = children?.props?.className || ''
            const lang = cls.replace(/hljs\s*/g, '').replace('language-', '').trim() || 'text'
            return (
              <pre data-language={lang} {...props}>
                {children}
              </pre>
            )
          },
          a: ({ href, children, ...props }) => {
            if (href?.startsWith('./') || href?.startsWith('../')) {
              const aSlug = href.replace(/^\.\//, '').replace(/\.md$/, '')
              return (
                <a href={`/docs/${aSlug}`} {...props}>
                  {children}
                </a>
              )
            }
            if (href?.startsWith('http')) {
              return (
                <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                  {children}
                </a>
              )
            }
            return <a href={href} {...props}>{children}</a>
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}

export default DocPage
