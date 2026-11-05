import { AlertTriangle, ArrowRight, KeyRound, Lock, ShieldCheck, Terminal, EyeOff, Ban } from 'lucide-react'
import { PageHeader, Callout } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/Button'

const rules = [
  {
    Icon: KeyRound,
    title: 'Least privilege',
    body: 'Give an agent the smallest token or role that can do the task. A code-review agent does not need write access to the repository or the database.',
  },
  {
    Icon: EyeOff,
    title: 'Read-only by default',
    body: 'Start with read access and an explicit approval step for writes. If the task is “inspect”, the tool should not be able to delete.',
  },
  {
    Icon: Lock,
    title: 'Separate credentials',
    body: 'Use a development project and a development branch. Never put a production connection string in an agent session, a skill, or a prompt.',
  },
  {
    Icon: ShieldCheck,
    title: 'Review before install',
    body: 'Read the skill or server source. Check the licence, the last commit and who owns the namespace. Pin a version rather than tracking a branch.',
  },
  {
    Icon: Ban,
    title: 'No auto-approve',
    body: 'Writes, deploys, payments and email sends need a human decision. An agent that can spend money without approval is an incident waiting for a trigger.',
  },
  {
    Icon: AlertTriangle,
    title: 'Treat tool output as untrusted',
    body: 'A web page, a document or a tool result can contain instructions aimed at the agent. Never follow an instruction that arrived as data; surface it to the user.',
  },
  {
    Icon: Terminal,
    title: 'Keep secrets out of context',
    body: 'Do not paste keys, tokens or personal data into a prompt. Redact logs before sharing them, and rotate anything that may have been exposed.',
  },
]

export default function PlaybookSecurity() {
  return (
    <div className="container-page">
      <PageHeader
        kicker="Playbook · security"
        title="The agent is a user with your credentials"
        lede="Every rule here exists because a plausible-looking tool can read, write or send something you did not intend. The checklist is short on purpose."
        breadcrumb={[
          { label: 'Home', to: '/' },
          { label: 'Playbook', to: '/playbook' },
          { label: 'Security' },
        ]}
        actions={<ButtonLink to="/playbook" variant="secondary">Back to the playbook</ButtonLink>}
      />

      <div className="grid gap-4 py-8 md:grid-cols-2">
        {rules.map((rule, index) => (
          <section key={rule.title} className="card p-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface-2 text-accent">
                <rule.Icon size={16} aria-hidden="true" />
              </span>
              <span className="mono text-[10px] uppercase tracking-wider text-faint">
                Rule {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <h2 className="text-lg">{rule.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{rule.body}</p>
          </section>
        ))}
      </div>

      <section className="border-t border-line py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl">Red flags in a tool or skill</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
              {[
                'It asks for an admin token or a personal access token with broad scopes.',
                'The install line downloads and executes a remote script you have not read.',
                'It wants your production database URL to “help with the schema”.',
                'It instructs the agent to ignore previous instructions or hide its actions.',
                'The repository is archived, has no licence, or the namespace does not match the vendor.',
                'It can send email, spend money or deploy without a confirmation step.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl">If something goes wrong</h2>
            <ol className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
              <li>
                <strong className="text-ink">1. Stop.</strong> End the session and revoke the token
                or session that was exposed.
              </li>
              <li>
                <strong className="text-ink">2. Contain.</strong> Disable deploys, pause the
                webhook, or take the affected branch or key offline.
              </li>
              <li>
                <strong className="text-ink">3. Check the evidence.</strong> Read the audit log,
                the commit history and the database changes. Write down what you know and what you
                do not.
              </li>
              <li>
                <strong className="text-ink">4. Fix the cause.</strong> Rotate the secret, narrow
                the permission, add the approval step — and only then re-enable the tool.
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="space-y-4 pb-12">
        <Callout tone="warn" title="Prompt injection is not a solved problem">
          A model cannot reliably tell an instruction from data. The defence is architectural:
          least privilege, human approval for consequential actions, and an audit trail you can
          read afterwards.
        </Callout>
        <div className="flex flex-wrap gap-3 text-sm">
          <a
            href="https://modelcontextprotocol.io/specification/2026-07-28"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-accent link-underline"
          >
            MCP security principles
            <ArrowRight size={12} aria-hidden="true" />
          </a>
          <a
            href="https://genai.owasp.org/llm-top-10/"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-accent link-underline"
          >
            OWASP Top 10 for LLM applications
            <ArrowRight size={12} aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  )
}
