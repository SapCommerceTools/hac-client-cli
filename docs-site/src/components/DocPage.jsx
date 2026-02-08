import { useParams, Navigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { docsContent } from '../docs/index'

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
          pre: ({ children, ...props }) => {
            // Extract language from the code element if present
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
            // Handle internal links
            if (href?.startsWith('./') || href?.startsWith('../')) {
              const slug = href.replace(/^\.\//, '').replace(/\.md$/, '')
              return (
                <a href={`/docs/${slug}`} {...props}>
                  {children}
                </a>
              )
            }
            // External links
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

