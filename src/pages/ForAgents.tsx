import { Link } from 'react-router-dom'
import { ArrowUpRight, Bot, FileText, ShieldCheck } from 'lucide-react'
import { PageHeader, Callout } from '@/components/ui/Section'
import { CodeBlock } from '@/components/CodeBlock'
import { SourceChip } from '@/components/SourceChip'
import { CONTENT_MANIFEST as manifest } from '@/content/generated/manifest'

const prompts = [
  {
    title: 'Plan the next four weeks',
    body: 'Use this when you know your hours and want a schedule, not a motivational speech.',
    prompt: `You are my study planner. Read https://cs-pathway.vercel.app/llms-full.txt first.
My level: <what I can already build>.
My weekly hours: <number>.
My target: <phase or role>.

Return a four-week plan. For each week: one module, one proof, the exact source links,
and a stop rule. Do not invent a module, resource, version or statistic that is not in
the file. Mark anything uncertain as "needs checking".`,
  },
  {
    title: 'Quiz me without inventing questions',
    body: 'Use the five sourced questions in a module. The agent may explain, but it may not add facts.',
    prompt: `Open https://cs-pathway.vercel.app/module/<module-id> and use only its five quiz questions.
Ask one at a time. After each answer, quote the explanation and the source URL from the page.
If my answer is wrong, tell me which source section to read before the next question.
Do not create new questions or add facts that are not on the page.`,
  },
  {
    title: 'Review a proof against the rubric',
    body: 'A useful review names the missing evidence. It does not rewrite the work for you.',
    prompt: `Open https://cs-pathway.vercel.app/module/<module-id>#proof.
Score my submitted proof against the three rubric criteria, 0-3 each.
For every score, quote the criterion and point to the missing evidence.
Give one concrete next action and one question I should answer myself.
Do not rewrite the proof and do not invent a score I did not justify.`,
  },
  {
    title: 'Check a claim before you reuse it',
    body: 'Claims carry a review date. Ask the agent to check the source, not to trust the summary.',
    prompt: `Open https://cs-pathway.vercel.app/claims and find claim <id>.
Read its source URL and compare the exact wording with the claim.
Say whether the source still supports it, whether the page is past its review date,
and what changed. If you cannot access the source, say "not verified" instead of guessing.`,
  },
]

export default function ForAgents() {
  return (
    <div className="container-page">
      <PageHeader
        title="Use an agent. Verify the answer."
        lede="This library is public and machine-readable. An agent can plan, quiz and review with you, but it is not a source. Every fact still points to a page with a date."
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'For agents' }]}
        actions={
          <a
            href="/llms.txt"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-accent underline decoration-line underline-offset-4"
          >
            <FileText size={15} aria-hidden="true" />
            Open llms.txt
          </a>
        }
      />

      <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14">
        <div className="min-w-0">
          <section>
            <h2 className="border-b border-ink pb-2 text-2xl">The three rules</h2>
            <ol className="border-t border-line">
              {[
                [
                  'Give it the source, not your memory.',
                  'Paste the page, the source URL and the date. A model without the source is guessing.',
                ],
                [
                  'Ask for the citation, not just the answer.',
                  'A useful answer names the section and date it came from. “It depends” is better than a confident invention.',
                ],
                [
                  'Verify before you act.',
                  'Run the command, open the official page, or test the snippet. The agent can be a study partner; it cannot take responsibility for the result.',
                ],
              ].map(([title, body]) => (
                <li key={title} className="border-b border-line py-4">
                  <p className="text-sm font-medium text-ink">{title}</p>
                  <p className="mt-1 max-w-[68ch] text-sm leading-relaxed text-muted">{body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-10">
            <h2 className="border-b border-ink pb-2 text-2xl">Prompts that work</h2>
            <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-muted">
              Each prompt tells the agent what it may use and what it must not invent. Replace the
              values in angle brackets. The links are canonical; the content is public.
            </p>
            <div className="mt-6 space-y-8">
              {prompts.map((item) => (
                <article key={item.title}>
                  <h3 className="text-lg">{item.title}</h3>
                  <p className="mt-1 max-w-[68ch] text-sm leading-relaxed text-muted">{item.body}</p>
                  <div className="mt-3">
                    <CodeBlock code={item.prompt} lang="text" compact />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-10 border-t border-ink pt-5">
            <h2 className="text-2xl">The 2027 lens</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold text-ink">Generation gets cheaper</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  A plausible answer is no longer the scarce part. A test that can fail, a measured
                  result, and a source that can be checked are.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">Agents change the loop</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  You will read more diffs and run more evaluations than you write from scratch.
                  Review, scope and verification become daily skills.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink">Evidence beats a tutorial list</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  A small product with users, tests and a README survives a model change. A folder
                  of unfinished courses does not.
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-[68ch] text-sm leading-relaxed text-muted">
              The argument that verification is the scarce skill is editorial, supported by the
              survey and skills-map sources. <SourceChip claimId="E1" />
            </p>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="border-t border-ink pt-3">
            <h2 className="text-xs font-semibold text-ink">Machine-readable</h2>
            <ul className="mt-2 space-y-2 text-xs">
              {[
                ['llms.txt', '/llms.txt', 'Short index and rules'],
                ['llms-full.txt', '/llms-full.txt', `${manifest.counts.modules} modules, ${manifest.counts.cheatsheets} cheatsheets`],
                ['sitemap.xml', '/sitemap.xml', 'Every public route'],
                ['Verification', '/verification', 'Claims, sources, stamps'],
              ].map(([label, href, note]) => (
                <li key={label}>
                  <a
                    href={href}
                    className="inline-flex items-center gap-1 font-medium text-accent underline decoration-line underline-offset-4"
                  >
                    {label}
                    <ArrowUpRight size={11} aria-hidden="true" />
                  </a>
                  <span className="block text-faint">{note}</span>
                </li>
              ))}
            </ul>
          </div>

          <Callout tone="accent" title="No account needed">
            The content is public. Do not paste a password, session cookie, API key or private note
            into an agent. If a task needs private data, keep it in this browser or use the account
            sync page.
          </Callout>

          <div className="border-t border-line pt-3">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              A cited answer can still be wrong. Open the source when the cost of being wrong is
              real.
            </p>
          </div>

          <Link to="/verification" className="inline-flex items-center gap-1 text-xs font-medium text-accent">
            <Bot size={13} aria-hidden="true" />
            See what was checked
          </Link>
        </aside>
      </div>
    </div>
  )
}
