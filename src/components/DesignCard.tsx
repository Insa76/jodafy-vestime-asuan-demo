import { ArrowUpRight } from 'lucide-react'
import type { DesignId } from '../types/invitation'

interface Props {
  id: DesignId
  name: string
  category: string
  description: string
  image: string
  className: string
}

export function DesignCard({ id, name, category, description, image, className }: Props) {
  return (
    <article className={`design-card ${className}`}>
      <a className="design-image" href={`/invitacion/demo?diseno=${id}`} aria-label={`Ver diseño ${name}`}>
        <img src={image} alt={`Ejemplo de invitación ${name}`} loading="lazy" />
        <span className="design-open"><ArrowUpRight size={18} /></span>
        <span className="design-preview">Ver diseño</span>
      </a>
      <div className="design-meta">
        <div><span className="eyebrow">{category}</span><h3>{name}</h3></div>
        <a className="round-link" href={`/invitacion/demo?diseno=${id}`} aria-label={`Abrir ${name}`}><ArrowUpRight size={18} /></a>
      </div>
      <p>{description}</p>
    </article>
  )
}
