import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from '@/components/Layout'

function RouteFallback() {
  return (
    <div className="container-page py-16">
      <div className="skeleton h-64" />
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    HydrateFallback: RouteFallback,
    children: [
      { index: true, lazy: async () => ({ Component: (await import('@/pages/Home')).default }) },
      { path: 'start', lazy: async () => ({ Component: (await import('@/pages/Start')).default }) },
      { path: 'path', lazy: async () => ({ Component: (await import('@/pages/Path')).default }) },
      { path: 'plan', lazy: async () => ({ Component: (await import('@/pages/Plan')).default }) },
      {
        path: 'phase/:id',
        lazy: async () => ({ Component: (await import('@/pages/Phase')).default }),
      },
      {
        path: 'module/:id',
        lazy: async () => ({ Component: (await import('@/pages/Module')).default }),
      },
      {
        path: 'cheatsheets',
        lazy: async () => ({ Component: (await import('@/pages/Cheatsheets')).default }),
      },
      {
        path: 'cheatsheets/:topic',
        lazy: async () => ({ Component: (await import('@/pages/Cheatsheets')).default }),
      },
      {
        path: 'cheatsheet/:id',
        lazy: async () => ({ Component: (await import('@/pages/Cheatsheet')).default }),
      },
      {
        path: 'startup',
        lazy: async () => ({ Component: (await import('@/pages/Startup')).default }),
      },
      { path: 'tools', lazy: async () => ({ Component: (await import('@/pages/Tools')).default }) },
      {
        path: 'dashboard',
        lazy: async () => ({ Component: (await import('@/pages/Dashboard')).default }),
      },
      { path: 'pins', lazy: async () => ({ Component: (await import('@/pages/Pins')).default }) },
      { path: 'notes', lazy: async () => ({ Component: (await import('@/pages/Notes')).default }) },
      { path: 'review', lazy: async () => ({ Component: (await import('@/pages/Review')).default }) },
      { path: 'signin', lazy: async () => ({ Component: (await import('@/pages/SignIn')).default }) },
      { path: 'signup', lazy: async () => ({ Component: (await import('@/pages/SignUp')).default }) },
      { path: 'account', lazy: async () => ({ Component: (await import('@/pages/Account')).default }) },
      {
        path: 'glossary',
        lazy: async () => ({ Component: (await import('@/pages/Glossary')).default }),
      },
      {
        path: 'playbook',
        lazy: async () => ({ Component: (await import('@/pages/Playbook')).default }),
      },
      {
        path: 'playbook/security',
        lazy: async () => ({ Component: (await import('@/pages/PlaybookSecurity')).default }),
      },
      {
        path: 'playbook/:id',
        lazy: async () => ({ Component: (await import('@/pages/PlaybookEntry')).default }),
      },
      {
        path: 'harnesses',
        lazy: async () => ({ Component: (await import('@/pages/Harnesses')).default }),
      },
      { path: 'trends', lazy: async () => ({ Component: (await import('@/pages/Trends')).default }) },
      { path: 'claims', lazy: async () => ({ Component: (await import('@/pages/Claims')).default }) },
      {
        path: 'sources',
        lazy: async () => ({ Component: (await import('@/pages/Sources')).default }),
      },
      {
        path: 'methodology',
        lazy: async () => ({ Component: (await import('@/pages/Methodology')).default }),
      },
      {
        path: 'changelog',
        lazy: async () => ({ Component: (await import('@/pages/Changelog')).default }),
      },
      {
        path: 'corrections',
        lazy: async () => ({ Component: (await import('@/pages/Corrections')).default }),
      },
      {
        path: 'verification',
        lazy: async () => ({ Component: (await import('@/pages/Verification')).default }),
      },
      { path: 'about', lazy: async () => ({ Component: (await import('@/pages/About')).default }) },
      {
        path: 'privacy',
        lazy: async () => ({ Component: (await import('@/pages/Privacy')).default }),
      },
      { path: '*', lazy: async () => ({ Component: (await import('@/pages/NotFound')).default }) },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
