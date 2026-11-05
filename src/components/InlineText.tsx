import type { ReactNode } from 'react'

/**
 * Render a small subset of inline Markdown: `code` spans only.
 * Content is authored as plain text, so this keeps prose readable
 * without pulling in a full Markdown parser.
 */
export function InlineText({ text }: { text: string }): ReactNode {
  const parts = text.split(/(`[^`]+`)/g)
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return (
            <code
              key={index}
              className="rounded border border-line bg-surface-2 px-1 py-0.5 text-[0.875em] text-ink"
            >
              {part.slice(1, -1)}
            </code>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </>
  )
}
