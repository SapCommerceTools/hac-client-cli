import { useParams, Navigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
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
        rehypePlugins={[rehypeHighlight]}
        components={{
          code: ({ inline, className, children, ...props }) => {
            const match = /language-mermaid/.exec(className || '')
            if (!inline && match) {
              return <Mermaid chart={String(children).replace(/\n$/, '')} />
            }
            return <code className={className} {...props}>{children}</code>
          },
          pre: ({ children, ...props }) => {
            // If child is a Mermaid diagram, don't wrap in <pre>
            if (children?.props?.className === 'language-mermaid' ||
                children?.type === Mermaid) {
              return <>{children}</>
            }
            const codeElement = children?.props
            const className = codeElement?.className || ''
            const language = className.replace('language-', '') || 'text'
            return (
              <pre data-language={language} {...props}>
                {children}
              </pre>
            )
          },
          a: ({ href, children, ...props }) => {
            if (href?.startsWith('./') || href?.startsWith('../')) {
              const slug = href.replace(/^\.\//, '').replace(/\.md$/, '')
              return (
                <a href={`/docs/${slug}`} {...props}>
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
