import { Menu, ArrowUpRight } from 'lucide-react'
import { Logo } from './Logo'

export function SiteHeader() {
  return (
    <header className="site-header">
      <Logo />
      <nav className="desktop-nav" aria-label="Navegación principal">
        <a href="#disenos">Diseños</a>
        <a href="#como-funciona">Cómo funciona</a>
        <a href="#planes">Planes</a>
      </nav>
      <a className="button button-dark header-cta" href="/invitacion/demo">
        Ver demo <ArrowUpRight size={16} />
      </a>
      <button className="mobile-menu" aria-label="Menú"><Menu size={22} /></button>
    </header>
  )
}
