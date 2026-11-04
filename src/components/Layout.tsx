import { Link, Outlet, ScrollRestoration, useNavigation } from 'react-router-dom'
import Brand from '@/components/Brand'
import Icon from '@/components/Icon'
import { isDemo } from '@/lib/config'
import { useAuth } from '@/features/auth/useAuth'

export default function Layout() {
  const navigation = useNavigation()
  const { session } = useAuth()
  return <>
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-forest focus:p-3 focus:text-white">Saltar al contenido</a>
    {isDemo ? <div className="bg-forest px-4 py-2 text-center text-xs leading-relaxed text-white/90">Conexión no disponible <span className="mx-2 opacity-40">·</span> Los enlaces requieren conexión a Supabase.</div> : null}
    <header className="border-b border-line bg-paper">
      <div className="page-shell flex h-21 items-center justify-between gap-4">
        <Brand />
        <nav aria-label="Navegación principal" className="hidden items-center gap-9 text-sm text-muted md:flex"><Link to="/#tests" className="nav-link">Los tests</Link><Link to="/#como-funciona" className="nav-link">Cómo funciona</Link></nav>
        <div className="flex items-center gap-2 sm:gap-3"><Link to={session ? '/profesional' : '/ingresar'} className="nav-link text-xs font-medium text-forest sm:text-sm">{session ? 'Mi panel' : 'Profesionales'}</Link><Link to="/retomar" className="btn btn-secondary min-h-10 px-3 text-xs sm:px-5 sm:text-sm">Retomar<span className="hidden sm:inline"> un test</span><Icon name="arrow" className="size-4" /></Link></div>
      </div>
    </header>
    {navigation.state === 'loading' ? <div role="status" className="fixed top-0 z-50 h-1 w-full animate-pulse bg-clay"><span className="sr-only">Cargando…</span></div> : null}
    <main id="main" className="min-h-[70vh]" tabIndex={-1}><Outlet /></main>
    <footer className="mt-20 border-t border-line py-8 sm:mt-28">
      <div className="page-shell flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><Brand /><p className="mt-2 text-xs text-muted">Un espacio para conocerte mejor.</p></div><p className="max-w-sm text-xs leading-relaxed text-muted">Los resultados son orientativos y no reemplazan la evaluación de un profesional de la salud mental.</p><Link to="/privacidad" className="text-xs underline decoration-line underline-offset-4 hover:decoration-forest">Privacidad y consentimiento</Link></div>
    </footer>
    <ScrollRestoration />
  </>
}
