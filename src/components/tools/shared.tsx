import { useEffect, useState, type ReactNode } from 'react'
import { Info } from 'lucide-react'
import { setToolState, useGuestState } from '@/lib/store'
import { Field, TextInput } from '@/components/ui/Field'

export function useToolState<T>(id: string, initial: T) {
  const state = useGuestState()
  const stored = state.tools[id] as T | undefined
  const [value, setValue] = useState<T>(() => stored ?? initial)

  useEffect(() => {
    const timer = window.setTimeout(() => setToolState(id, value), 350)
    return () => window.clearTimeout(timer)
  }, [id, value])

  return [value, setValue] as const
}

export function ToolPanel({
  title,
  description,
  children,
  note,
}: {
  title: string
  description: string
  children: ReactNode
  note?: string
}) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-xl">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
      </div>
      <div className="p-5">{children}</div>
      {note ? (
        <div className="flex items-start gap-2 border-t border-line bg-surface-2/60 px-5 py-3 text-xs leading-relaxed text-muted">
          <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>{note}</p>
        </div>
      ) : null}
    </div>
  )
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  hint,
  prefix,
  suffix,
  min = 0,
  step = 1,
}: {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  hint?: string
  prefix?: string
  suffix?: string
  min?: number
  step?: number
}) {
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <div className="relative">
        {prefix ? (
          <span className="mono pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-faint">
            {prefix}
          </span>
        ) : null}
        <TextInput
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={Number.isFinite(value) ? value : ''}
          onChange={(event) => onChange(event.target.value === '' ? 0 : Number(event.target.value))}
          className={prefix ? 'pl-7' : suffix ? 'pr-12' : undefined}
        />
        {suffix ? (
          <span className="mono pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-faint">
            {suffix}
          </span>
        ) : null}
      </div>
    </Field>
  )
}

export function Result({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note?: string
}) {
  return (
    <div className="rounded-lg border border-line bg-surface-2/60 p-4">
      <p className="eyebrow mb-1">{label}</p>
      <p className="mono tabular text-2xl text-ink">{value}</p>
      {note ? <p className="mt-1 text-xs leading-relaxed text-muted">{note}</p> : null}
    </div>
  )
}

export function Formula({ children }: { children: ReactNode }) {
  return (
    <p className="mono rounded-md border border-line bg-surface px-3 py-2 text-[11px] leading-relaxed text-muted">
      {children}
    </p>
  )
}
