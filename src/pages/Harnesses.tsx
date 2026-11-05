import { ExternalLink } from 'lucide-react'
import { PageHeader, Callout } from '@/components/ui/Section'
import { SourceChip } from '@/components/SourceChip'
import { HARNESSES as harnesses } from '@/content/generated/harnesses'
import { formatDate } from '@/lib/format'

const supportLabel = { native: 'Native', partial: 'Partial', none: 'No' }

export default function Harnesses() {
  return (
    <div className="container-page">
      <PageHeader
        kicker="Harnesses"
        title="Compare the agent, not the marketing page"
        lede="Skills, MCP and project instructions are not equally supported. This table lists only the entries whose vendor documentation was checked and dated."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Harnesses' }]}
      />

      <div className="py-8">
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <caption className="sr-only">
              Agent harness support for skills, MCP and AGENTS.md
            </caption>
            <thead>
              <tr className="border-b border-line bg-surface-2">
                <th scope="col" className="px-4 py-3 font-medium text-muted">Harness</th>
                <th scope="col" className="px-4 py-3 font-medium text-muted">Skills</th>
                <th scope="col" className="px-4 py-3 font-medium text-muted">MCP</th>
                <th scope="col" className="px-4 py-3 font-medium text-muted">AGENTS.md</th>
                <th scope="col" className="px-4 py-3 font-medium text-muted">Checked</th>
              </tr>
            </thead>
            <tbody>
              {harnesses.map((harness) => (
                <tr key={harness.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <a
                      href={harness.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 font-medium text-ink hover:text-accent"
                    >
                      {harness.name}
                      <ExternalLink size={11} aria-hidden="true" />
                    </a>
                    <p className="text-xs text-faint">{harness.vendor}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{supportLabel[harness.skills]}</td>
                  <td className="px-4 py-3 text-muted">{supportLabel[harness.mcp]}</td>
                  <td className="px-4 py-3 text-muted">{supportLabel[harness.agentsMd]}</td>
                  <td className="mono px-4 py-3 text-xs text-faint">{formatDate(harness.verifiedOn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-faint">
          Only {harnesses.length} entries are verified so far. The table is intentionally
          incomplete; a blank row would imply knowledge we do not have. Support can also change
          between versions, so check the docs for the version you installed.
        </p>

        {harnesses.map((harness) => (
          <article key={harness.id} className="card mt-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg">{harness.name}</h2>
              <a
                href={harness.pricingUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs text-accent link-underline"
              >
                Vendor pricing
              </a>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{harness.notes}</p>
          </article>
        ))}
      </div>

      <section className="border-t border-line py-8">
        <h2 className="text-xl">How to check your harness in ten minutes</h2>
        <ol className="mt-3 grid gap-3 md:grid-cols-2">
          {[
            'Open the vendor docs for the exact version you installed, not the latest beta.',
            'Search the docs for “skills” and confirm the folder name and file contract.',
            'Search for “MCP” and find the config file path and the command shape.',
            'Search for “AGENTS.md” and confirm whether it is read, ignored, or replaced by another filename.',
            'Create a throwaway project with one skill, one MCP server and one instruction file.',
            'Ask the agent to state which of the three it loaded. If it cannot, the support is partial.',
          ].map((step, index) => (
            <li key={step} className="flex gap-3 rounded-lg border border-line bg-surface p-3 text-sm text-muted">
              <span className="mono shrink-0 text-[10px] text-accent">0{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <div className="mt-4">
          <Callout tone="accent" title="The portable minimum">
            A folder with a SKILL.md, a bounded name and description, and instructions loaded only
            when relevant is supported by a growing set of tools. <SourceChip claimId="C9" />
          </Callout>
        </div>
      </section>
    </div>
  )
}
