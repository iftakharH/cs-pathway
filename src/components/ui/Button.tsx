import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cx } from '@/lib/format'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors ' +
  'disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink hover:opacity-90 active:opacity-80',
  secondary: 'border border-line bg-surface text-ink hover:bg-surface-2',
  ghost: 'text-ink hover:bg-surface-2',
  danger: 'bg-danger text-white hover:opacity-90',
}

const sizes: Record<Size, string> = {
  sm: 'min-h-11 px-3 text-sm',
  md: 'min-h-12 px-5 text-[0.9375rem]',
  lg: 'min-h-14 px-7 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button className={cx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  className,
  children,
  external,
  ariaLabel,
}: {
  to: string
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
  external?: boolean
  ariaLabel?: string
}) {
  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noreferrer noopener"
        className={cx(base, variants[variant], sizes[size], className)}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    )
  }
  return (
    <Link
      to={to}
      className={cx(base, variants[variant], sizes[size], className)}
      aria-label={ariaLabel}
    >
      {children}
    </Link>
  )
}

export function TextLink({
  to,
  children,
  className,
  external,
}: {
  to: string
  children: ReactNode
  className?: string
  external?: boolean
}) {
  if (external) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noreferrer noopener"
        className={cx('link-underline', className)}
      >
        {children}
      </a>
    )
  }
  return (
    <Link to={to} className={cx('link-underline', className)}>
      {children}
    </Link>
  )
}
