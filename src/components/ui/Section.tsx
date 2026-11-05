import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cx } from '@/lib/format'

export function SectionHeader({
  eyebrow,
  title,
  lede,
  action,
  className,
}: {
  eyebrow?: string
  title: string
  lede?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cx('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className="max-w-2xl">
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h2 className="text-2xl sm:text-3xl">{title}</h2>
        {lede ? <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{lede}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function PageHeader({
  kicker,
  title,
  lede,
  breadcrumb,
  actions,
}: {
  kicker?: string
  title: string
  lede?: string
  breadcrumb?: Array<{ label: string; to?: string }>
  actions?: ReactNode
}) {
  return (
    <header className="border-b border-line pb-8 pt-8 sm:pt-12">
      {breadcrumb && breadcrumb.length > 0 ? (
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-faint">
            {breadcrumb.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                {index > 0 ? <ChevronRight size={12} aria-hidden="true" /> : null}
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-accent">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      {kicker ? <p className="eyebrow mb-3">{kicker}</p> : null}
      <div className="flex flex-wrap items-end justify-between gap-5">
        <h1 className="max-w-3xl text-3xl leading-[1.1] sm:text-4xl md:text-5xl">{title}</h1>
        {actions ? <div className="flex flex-wrap gap-2 no-print">{actions}</div> : null}
      </div>
      {lede ? <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{lede}</p> : null}
    </header>
  )
}

export function ProgressBar({
  value,
  label,
  showPercent = true,
  showLabel = true,
}: {
  value: number
  label: string
  showPercent?: boolean
  showLabel?: boolean
}) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div>
      {showLabel ? (
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <span className="text-xs font-medium text-muted">{label}</span>
          {showPercent ? <span className="mono tabular text-[11px] text-faint">{percent}%</span> : null}
        </div>
      ) : null}
      <div
        className="h-1.5 overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line px-6 py-12 text-center">
      {icon ? <div className="mb-3 text-faint">{icon}</div> : null}
      <h3 className="text-lg">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function Callout({
  tone = 'neutral',
  title,
  children,
}: {
  tone?: 'neutral' | 'accent' | 'warn'
  title?: string
  children: ReactNode
}) {
  const classes =
    tone === 'accent'
      ? 'border-accent/30 bg-accent-soft'
      : tone === 'warn'
        ? 'border-warn/30 bg-warn-soft'
        : 'border-line bg-surface-2'
  return (
    <div className={cx('rounded-lg border p-4', classes)}>
      {title ? <p className="mb-1 text-sm font-semibold text-ink">{title}</p> : null}
      <div className="text-sm leading-relaxed text-muted">{children}</div>
    </div>
  )
}
