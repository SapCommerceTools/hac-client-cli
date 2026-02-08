import { useParams, Navigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { docsContent } from '../docs/index'
import Mermaid from './Mermaid'

function isMermaidChild(children) {
  if (!children?.props) return false
  const cls = children.props.className || ''
  if (cls.includes('language-mermaid')) return true
  if (children.type === Mermaid) return true
  return false
}

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
        rehypePlugins={[rehypeHighlight]}
        components={{
          code: ({ inline, className, children, ...props }) => {
            if (!inline && /language-mermaid/.test(className || '')) {
              return <Mermaid chart={String(children).replace(/\n$/, '')} />
            }
            return <code className={className} {...props}>{children}</code>
          },
          pre: ({ children, ...props }) => {
            if (isMermaidChild(children)) {
              return <>{children}</>
            }
            const codeElement = children?.props
            const className = codeElement?.className || ''
            const language = className.replace(/hljs\s*/g, '').replace('language-', '').trim() || 'text'
            return (
              <pre data-language={language} {...props}>
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
