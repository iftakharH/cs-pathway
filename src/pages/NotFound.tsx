import { Compass, Search } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col justify-center py-20">
      <p className="mono text-[11px] uppercase tracking-[0.14em] text-faint">404</p>
      <h1 className="mt-3 max-w-2xl text-4xl">This page is not on the path.</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        The link may be old, or the page may have moved. Try the search — it covers every module,
        cheatsheet, claim and glossary term.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <ButtonLink to="/path">
          <Compass size={15} aria-hidden="true" />
          Go to the path
        </ButtonLink>
        <ButtonLink to="/cheatsheets" variant="secondary">
          Browse cheatsheets
        </ButtonLink>
        <span className="inline-flex items-center gap-1.5 text-xs text-faint">
          <Search size={13} aria-hidden="true" />
          Press / to search
        </span>
      </div>
    </div>
  )
}
