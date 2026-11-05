import {
  AlertTriangle,
  BarChart3,
  CircleCheck,
  Clock,
  FileText,
  PenLine,
  TrendingUp,
} from 'lucide-react'
import type { ClaimKind, Module, PhaseId, SourceTier } from '@/content/schema'
import { cx } from '@/lib/format'

const phaseNames: Record<PhaseId, string> = {
  F: 'Foundations',
  '1': 'Full-stack',
  '2': 'AI engineer',
  '3': 'ML engineer',
  S: 'Startup',
}

export function PhaseBadge({ phase, showName = false }: { phase: PhaseId; showName?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="mono inline-flex h-6 min-w-6 items-center justify-center rounded border border-line bg-surface-2 px-1 text-[11px] font-semibold text-ink">
        {phase}
      </span>
      {showName ? <span className="text-sm text-muted">{phaseNames[phase]}</span> : null}
    </span>
  )
}

const evidenceStyles: Record<ClaimKind, { label: string; className: string }> = {
  'observed-data': {
    label: 'Observed data',
    className: 'border-accent/30 bg-accent-soft text-accent',
  },
  'spec-fact': {
    label: 'Official docs',
    className: 'border-line bg-surface-2 text-ink',
  },
  editorial: {
    label: 'Editorial',
    className: 'border-line bg-transparent text-muted',
  },
  forecast: {
    label: 'Forecast — not data',
    className: 'border-warn/40 bg-warn-soft text-warn',
  },
}

export function EvidenceBadge({ kind }: { kind: ClaimKind }) {
  const style = evidenceStyles[kind]
  const Icon =
    kind === 'observed-data'
      ? BarChart3
      : kind === 'spec-fact'
        ? FileText
        : kind === 'forecast'
          ? TrendingUp
          : PenLine
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium',
        style.className,
      )}
    >
      <Icon size={12} aria-hidden="true" />
      {style.label}
    </span>
  )
}

export function StaleBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-warn/40 bg-warn-soft px-2 py-1 text-[11px] font-medium text-warn">
      <AlertTriangle size={12} aria-hidden="true" />
      Needs re-check
    </span>
  )
}

export function TierBadge({ tier }: { tier: SourceTier }) {
  const label = tier === 'primary' ? 'Primary source' : tier === 'secondary' ? 'Secondary source' : 'Community source'
  return (
    <span className="mono inline-flex items-center rounded border border-line bg-surface-2 px-2 py-1 text-[10px] uppercase tracking-wider text-muted">
      {label}
    </span>
  )
}

const notStarted = { label: 'Not started', className: 'text-faint', Icon: Clock }

const statusStyles: Record<string, { label: string; className: string; Icon: typeof CircleCheck }> = {
  done: { label: 'Done', className: 'text-accent', Icon: CircleCheck },
  proof_submitted: { label: 'Proof submitted', className: 'text-accent', Icon: CircleCheck },
  in_progress: { label: 'In progress', className: 'text-warn', Icon: Clock },
  skipped: { label: 'Skipped', className: 'text-faint', Icon: Clock },
  'not-started': notStarted,
}

export function StatusBadge({ status }: { status?: string }) {
  const style = (status ? statusStyles[status] : undefined) ?? notStarted
  const Icon = style.Icon
  return (
    <span className={cx('inline-flex items-center gap-1.5 text-xs font-medium', style.className)}>
      <Icon size={13} aria-hidden="true" />
      {style.label}
    </span>
  )
}

export function ModuleMeta({ module }: { module: Module }) {
  return (
    <span className="mono inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-faint">
      <span>
        {module.estHours.min}–{module.estHours.max} h
      </span>
      <span aria-hidden="true">·</span>
      <span>{module.quiz.length} questions</span>
      <span aria-hidden="true">·</span>
      <span>{module.cheatsheetIds.length} sheets</span>
    </span>
  )
}
