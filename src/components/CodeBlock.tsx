import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cx } from '@/lib/format'

const labels: Record<string, string> = {
  bash: 'Shell',
  js: 'JavaScript',
  ts: 'TypeScript',
  tsx: 'TSX',
  python: 'Python',
  sql: 'SQL',
  json: 'JSON',
  yaml: 'YAML',
  http: 'HTTP',
  dockerfile: 'Dockerfile',
  ini: 'Config',
  toml: 'TOML',
  html: 'HTML',
  css: 'CSS',
  text: 'Text',
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      area.remove()
      return ok
    } catch {
      return false
    }
  }
}

export function CodeBlock({
  code,
  lang,
  caption,
  executed,
  className,
  compact = false,
}: {
  code: string
  lang: string
  caption?: string
  executed?: boolean
  className?: string
  compact?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  async function onCopy() {
    const ok = await copyText(code)
    if (!ok) return
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1800)
  }

  return (
    <figure className={cx('overflow-hidden rounded-lg border border-line bg-surface-2/60', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2">
        <figcaption className="min-w-0">
          <span className="mono text-[10px] uppercase tracking-wider text-faint">
            {labels[lang] ?? lang}
            {executed ? ' · executed' : ''}
          </span>
          {caption ? (
            <span className="ml-2 border-l border-line pl-2 text-xs text-muted">{caption}</span>
          ) : null}
        </figcaption>
        <button
          type="button"
          onClick={onCopy}
          className="no-print inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-xs font-medium text-muted hover:border-line-strong hover:text-ink"
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
          <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre
        tabIndex={0}
        aria-label={caption ?? `${lang} code sample`}
        className={cx(
          'overflow-x-auto px-4 py-3 text-[0.8125rem] leading-relaxed text-ink',
          compact ? 'max-h-72' : '',
        )}
      >
        <code>{code.replace(/\n$/, '')}</code>
      </pre>
    </figure>
  )
}
