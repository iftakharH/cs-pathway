import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  ExternalLink,
  Minus,
  RotateCcw,
  TriangleAlert,
} from 'lucide-react'
import { PageHeader, Callout } from '@/components/ui/Section'
import { HARNESSES } from '@/content/generated/harnesses'
import type { Harness } from '@/content/schema'
import { formatDate } from '@/lib/format'
import { cx } from '@/lib/format'

type Capability = 'skills' | 'mcp' | 'agentsMd'

const capabilityLabels: Record<Capability, string> = {
  skills: 'Skills',
  mcp: 'MCP',
  agentsMd: 'AGENTS.md',
}

const supportLabel = { native: 'Native', partial: 'Partial', none: 'No' } as const
const statusLabel = { active: 'Active', legacy: 'Legacy', preview: 'Preview' } as const

function SupportMark({ value }: { value: 'native' | 'partial' | 'none' }) {
  const Icon = value === 'native' ? Check : value === 'partial' ? TriangleAlert : Minus
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 text-xs',
        value === 'native' ? 'text-accent' : value === 'partial' ? 'text-warn' : 'text-faint',
      )}
    >
      <Icon size={13} aria-hidden="true" />
      {supportLabel[value]}
    </span>
  )
}

export default function Harnesses() {
  const [selectedId, setSelectedId] = useState(HARNESSES[0]?.id ?? '')
  const [capabilities, setCapabilities] = useState<Record<Capability, boolean>>({
    skills: false,
    mcp: false,
    agentsMd: false,
  })
  const [hideLegacy, setHideLegacy] = useState(false)

  const filtered = useMemo(
    () =>
      HARNESSES.filter((harness) => {
        if (hideLegacy && harness.status === 'legacy') return false
        return (Object.keys(capabilities) as Capability[]).every(
          (capability) => !capabilities[capability] || harness[capability] === 'native',
        )
      }),
    [capabilities, hideLegacy],
  )

  const selected: Harness | undefined =
    filtered.find((harness) => harness.id === selectedId) ?? filtered[0]

  const activeFilters = Object.values(capabilities).some(Boolean) || hideLegacy

  function toggle(capability: Capability) {
    setCapabilities((current) => ({ ...current, [capability]: !current[capability] }))
  }

  function reset() {
    setCapabilities({ skills: false, mcp: false, agentsMd: false })
    setHideLegacy(false)
  }

  return (
    <div className="container-page">
      <PageHeader
        title="The harness is not the model."
        lede="Six agent harnesses, checked against their own documentation. The table shows which primitives are first-class, where the files live, and what each vendor does not support."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Harnesses' }]}
      />

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line py-3 text-xs text-faint">
        <span>{HARNESSES.length} harnesses</span>
        <span>Checked 6 Nov 2026</span>
        <span>Skills · MCP · AGENTS.md</span>
      </div>

      <Callout tone="warn" title="Gemini CLI is marked legacy">
        Google says Gemini CLI was replaced by Antigravity CLI for unpaid and Google One users on
        18 June 2026. The row stays visible for readers on an existing setup, but check the notice
        on every Gemini CLI docs page before adopting it.
      </Callout>

      <div className="flex flex-wrap items-end justify-between gap-4 py-6">
        <div>
          <p className="text-xs font-medium text-ink">Show harnesses with native support for</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(capabilityLabels) as Capability[]).map((capability) => (
              <button
                key={capability}
                type="button"
                aria-pressed={capabilities[capability]}
                onClick={() => toggle(capability)}
                className={cx(
                  'min-h-11 rounded-sm border px-3 text-xs font-medium',
                  capabilities[capability]
                    ? 'border-accent bg-accent-soft text-accent'
                    : 'border-line bg-surface text-muted hover:text-ink',
                )}
              >
                {capabilityLabels[capability]}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={hideLegacy}
              onClick={() => setHideLegacy((value) => !value)}
              className={cx(
                'min-h-11 rounded-sm border px-3 text-xs font-medium',
                hideLegacy
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-line bg-surface text-muted hover:text-ink',
              )}
            >
              Hide legacy
            </button>
            {activeFilters ? (
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-9 items-center gap-1 px-1 text-xs text-faint hover:text-ink"
              >
                <RotateCcw size={12} aria-hidden="true" />
                Reset
              </button>
            ) : null}
          </div>
        </div>
        <p className="text-xs text-faint" aria-live="polite">
          Select a name for paths and limitations · {filtered.length} of {HARNESSES.length} shown
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="border-y border-line py-12 text-center">
          <p className="text-sm text-muted">No harness matches those filters.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-3 text-sm font-medium text-accent"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto border-y border-line">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Agent harness support for skills, MCP and AGENTS.md, checked against vendor docs.
              </caption>
              <thead>
                <tr className="border-b border-line text-[11px] text-faint">
                  <th scope="col" className="py-2.5 pr-3 font-medium">Harness</th>
                  <th scope="col" className="hidden px-3 py-2.5 font-medium sm:table-cell">Status</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Skills</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">MCP</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">AGENTS.md</th>
                  <th scope="col" className="hidden px-3 py-2.5 font-medium md:table-cell">Checked</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((harness) => {
                  const isSelected = selected?.id === harness.id
                  return (
                    <tr
                      key={harness.id}
                      className={cx(
                        'border-b border-line last:border-0',
                        isSelected ? 'bg-surface' : '',
                      )}
                    >
                      <td className="py-3 pr-3">
                        <button
                          type="button"
                          onClick={() => setSelectedId(harness.id)}
                          aria-pressed={isSelected}
                          className="text-left"
                        >
                          <span
                            className={cx(
                              'font-medium hover:text-accent',
                              isSelected
                                ? 'text-accent underline decoration-accent underline-offset-4'
                                : 'text-ink',
                            )}
                          >
                            {harness.name}
                          </span>
                          <span className="block text-xs text-faint">{harness.vendor}</span>
                          {harness.status === 'legacy' ? (
                            <span className="mt-0.5 block text-[10px] text-warn sm:hidden">
                              Legacy · replaced
                            </span>
                          ) : null}
                        </button>
                      </td>
                      <td className="hidden px-3 py-3 sm:table-cell">
                        <span
                          className={cx(
                            'text-xs',
                            harness.status === 'legacy' ? 'text-warn' : 'text-muted',
                          )}
                        >
                          {statusLabel[harness.status]}
                        </span>
                      </td>
                      <td className="px-3 py-3"><SupportMark value={harness.skills} /></td>
                      <td className="px-3 py-3"><SupportMark value={harness.mcp} /></td>
                      <td className="px-3 py-3"><SupportMark value={harness.agentsMd} /></td>
                      <td className="mono hidden px-3 py-3 text-[11px] text-faint md:table-cell">
                        {formatDate(harness.verifiedOn)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {selected ? (
            <aside
              key={selected.id}
              className="mt-6 grid gap-6 border-t border-ink pt-5 lg:grid-cols-[1.15fr_0.85fr]"
              aria-live="polite"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-3xl">{selected.name}</h2>
                    <p className="mt-0.5 text-sm text-muted">{selected.vendor}</p>
                  </div>
                  <span className="mono shrink-0 text-[10px] text-faint">
                    checked {formatDate(selected.verifiedOn)}
                  </span>
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{selected.notes}</p>

                <dl className="mt-5 divide-y divide-line border-y border-line text-sm">
                  {[
                    ['Skills live in', selected.skillsPath],
                    ['MCP config', selected.mcpConfig],
                    ['Instructions', selected.agentsFile],
                  ].map(([label, value]) =>
                    value ? (
                      <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[8rem_1fr]">
                        <dt className="text-xs text-faint">{label}</dt>
                        <dd className="mono text-[11px] leading-relaxed text-ink">{value}</dd>
                      </div>
                    ) : null,
                  )}
                </dl>
              </div>

              <div>
                {selected.limitations && selected.limitations.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold text-ink">Limitations</p>
                    <ul className="mt-1.5 space-y-1.5">
                      {selected.limitations.map((limitation) => (
                        <li key={limitation} className="flex gap-2 text-xs leading-relaxed text-muted">
                          <TriangleAlert size={13} className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs">
                  {[
                    ['Skills docs', selected.skillsUrl],
                    ['MCP docs', selected.mcpUrl],
                    ['AGENTS.md docs', selected.agentsMdUrl],
                    ['Vendor pricing', selected.pricingUrl],
                  ].map(([label, url]) =>
                    url ? (
                      <a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 font-medium text-accent underline decoration-line underline-offset-4"
                      >
                        {label}
                        <ExternalLink size={11} aria-hidden="true" />
                      </a>
                    ) : null,
                  )}
                </div>
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-4 inline-flex items-center gap-1 text-xs text-muted underline decoration-line underline-offset-4 hover:text-ink"
                >
                  Open the vendor documentation
                  <ArrowRight size={12} aria-hidden="true" />
                </a>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-3 text-xs">
                  <Link
                    to="/cheatsheet/skill-md"
                    className="font-medium text-accent underline decoration-line underline-offset-4"
                  >
                    Write a portable SKILL.md
                  </Link>
                  <Link
                    to="/cheatsheet/mcp-connect"
                    className="font-medium text-accent underline decoration-line underline-offset-4"
                  >
                    Connect a read-only MCP server
                  </Link>
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      )}

      <section className="border-t border-line py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl">What this table does not tell you</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
              <li>— Model quality, price or how well a harness plans a large change.</li>
              <li>— Whether an IDE extension supports the same feature as the CLI.</li>
              <li>— How stable a preview feature is, or when it will change.</li>
              <li>— Whether a third-party skill or MCP server is safe to install.</li>
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Support is a ceiling, not a guarantee. Read the docs for the version you installed,
              and test one skill, one MCP server and one instruction file in a throwaway repository.
            </p>
          </div>

          <div>
            <h2 className="text-2xl">Verify your harness in ten minutes</h2>
            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
              {[
                'Open the vendor docs for the exact version you installed, not the latest beta.',
                'Create a throwaway skill folder and confirm the harness lists it.',
                'Add one read-only MCP server and ask the agent to call it.',
                'Add AGENTS.md and ask the agent to quote one line from it.',
                'Remove each primitive and confirm the harness stops using it.',
                'Write down the version, date and what failed. That is your evidence.',
              ].map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="mono w-4 shrink-0 text-[10px] text-accent">{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  )
}
