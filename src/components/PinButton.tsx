import { Pin } from 'lucide-react'
import { togglePin, useGuestState } from '@/lib/store'
import { cx } from '@/lib/format'

export function PinButton({
  cheatId,
  className,
  compact = false,
}: {
  cheatId: string
  className?: string
  compact?: boolean
}) {
  const state = useGuestState()
  const pinned = Boolean(state.pins[cheatId])
  return (
    <button
      type="button"
      aria-pressed={pinned}
      onClick={() => togglePin(cheatId)}
      className={cx(
        'inline-flex min-h-9 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors',
        pinned
          ? 'border-accent/40 bg-accent-soft text-accent'
          : 'border-line bg-surface text-muted hover:border-line-strong hover:text-ink',
        className,
      )}
      aria-label={pinned ? `Unpin ${cheatId}` : `Pin ${cheatId}`}
    >
      <Pin size={12} fill={pinned ? 'currentColor' : 'none'} aria-hidden="true" />
      {compact ? null : pinned ? 'Pinned' : 'Pin'}
    </button>
  )
}
