import { Suspense, lazy, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BookOpen,
  CalendarDays,
  ExternalLink,
  Map,
  Pin,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { site } from '@/lib/site'
import { cx } from '@/lib/format'

const SearchDialog = lazy(() => import('@/components/SearchDialog'))

const primaryNav = [
  { to: '/path', label: 'Path' },
  { to: '/cheatsheets', label: 'Cheatsheets' },
  { to: '/startup', label: 'Startup' },
  { to: '/playbook', label: 'Playbook' },
]

const trustPrefixes = ['/methodology', '/sources', '/claims', '/trends', '/changelog', '/corrections']

function isTrustRoute(pathname: string) {
  return trustPrefixes.some((prefix) => pathname.startsWith(prefix))
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

function Header({ onOpenSearch }: { onOpenSearch: () => void }) {
  const { pathname } = useLocation()

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link
          to="/"
          className="shrink-0 text-[1.35rem] tracking-tight"
          aria-label="cs-pathway home"
        >
          <span className="serif">cs</span>
          <span className="text-accent">/</span>
          <span className="serif">pathway</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
          {primaryNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cx(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-surface-2 text-ink' : 'text-muted hover:text-ink',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/methodology"
            className={cx(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isTrustRoute(pathname) ? 'bg-surface-2 text-ink' : 'text-muted hover:text-ink',
            )}
          >
            Trust
          </NavLink>
        </nav>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onOpenSearch}
            className="inline-flex h-11 items-center gap-2 rounded-lg px-2.5 text-sm text-muted hover:bg-surface-2 hover:text-ink sm:px-3"
            aria-label="Search"
          >
            <Search size={17} aria-hidden="true" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="mono hidden rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] text-faint sm:inline">
              /
            </kbd>
          </button>
          <ThemeToggle />
          <div className="ml-1 hidden md:block">
            <ButtonLink to="/dashboard" variant="secondary" size="sm">
              My plan
            </ButtonLink>
          </div>
        </div>
      </div>
    </header>
  )
}

function MobileNav() {
  const items = [
    { to: '/path', label: 'Path', Icon: Map },
    { to: '/cheatsheets', label: 'Sheets', Icon: BookOpen },
    { to: '/dashboard', label: 'Plan', Icon: CalendarDays },
    { to: '/pins', label: 'Saved', Icon: Pin },
  ]
  return (
    <nav
      aria-label="Primary mobile"
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="grid grid-cols-4">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cx(
                  'flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium',
                  isActive ? 'text-accent' : 'text-muted',
                )
              }
            >
              <item.Icon size={19} aria-hidden="true" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="no-print mt-20 border-t border-line bg-surface/40 pb-24 pt-12 md:pb-12">
      <div className="container-page">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="text-xl">
              <span className="serif">cs</span>
              <span className="text-accent">/</span>
              <span className="serif">pathway</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">{site.tagline}</p>
            <p className="mono mt-4 text-[10px] uppercase leading-relaxed tracking-wider text-faint">
              Non-commercial · no ads
              <br />
              No tracking scripts · no paid tiers
            </p>
          </div>

          <FooterColumn
            title="Learn"
            links={[
              { label: 'The path', to: '/path' },
              { label: 'Cheatsheets', to: '/cheatsheets' },
              { label: 'Startup phase', to: '/startup' },
              { label: 'Startup tools', to: '/tools' },
              { label: 'Playbook', to: '/playbook' },
              { label: 'Glossary', to: '/glossary' },
            ]}
          />
          <FooterColumn
            title="Trust"
            links={[
              { label: 'Methodology', to: '/methodology' },
              { label: 'Sources', to: '/sources' },
              { label: 'Claim explorer', to: '/claims' },
              { label: '2027 trends', to: '/trends' },
              { label: 'Changelog', to: '/changelog' },
              { label: 'Corrections', to: '/corrections' },
            ]}
          />
          <FooterColumn
            title="Project"
            links={[
              { label: 'About', to: '/about' },
              { label: 'Privacy', to: '/privacy' },
              { label: 'Harnesses', to: '/harnesses' },
              { label: 'Agent safety', to: '/playbook/security' },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-5 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            Built by{' '}
            <a
              href={site.ownerUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="link-underline text-muted"
            >
              {site.ownerName}
            </a>
            . Started {new Date(`${site.founded}T00:00:00`).getFullYear()}.
          </p>
          <p className="inline-flex items-center gap-1.5">
            <ShieldCheck size={13} aria-hidden="true" />
            Public content stays public. Progress can be saved without an account.
          </p>
          <a
            href={site.contactUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 link-underline text-muted"
          >
            Report a correction
            <ExternalLink size={11} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: Array<{ label: string; to: string }>
}) {
  return (
    <div>
      <h2 className="eyebrow mb-3">{title}</h2>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="text-sm text-muted hover:text-ink">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PageFallback() {
  return (
    <div className="container-page py-16">
      <div className="skeleton h-4 w-28" />
      <div className="skeleton mt-5 h-10 w-3/4 max-w-xl" />
      <div className="skeleton mt-3 h-4 w-2/3 max-w-lg" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="skeleton h-32" />
        <div className="skeleton h-32" />
      </div>
    </div>
  )
}

export function Layout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable
      const isSlash = event.key === '/' && !typing
      const isCommandK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
      if (isSlash || isCommandK) {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:text-ink focus:shadow-lg"
      >
        Skip to content
      </a>
      <ScrollToTop />
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <main id="main" className="flex-1 pb-24 md:pb-0">
        <Suspense fallback={<PageFallback />}>
          <div key={pathname}>
            <Outlet />
          </div>
        </Suspense>
      </main>
      <Footer />
      <MobileNav />
      {searchOpen ? (
        <Suspense fallback={null}>
          <SearchDialog onClose={() => setSearchOpen(false)} />
        </Suspense>
      ) : null}
    </div>
  )
}
