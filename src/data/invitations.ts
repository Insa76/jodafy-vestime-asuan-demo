import type { Invitation, DesignId } from '../types/invitation'

export const designs: { id: DesignId; name: string; category: string; description: string; image: string; className: string }[] = [
  {
    id: 'botanico',
    name: 'Botánico',
    category: 'Casamiento',
    description: 'Flores suaves, tonos naturales y elegancia atemporal.',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85',
    className: 'design-botanico',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    category: 'Minimalista',
    description: 'Tipografía protagonista y una estética limpia.',
    image: 'https://images.unsplash.com/photo-1519225421980-888cbf3b5c90?auto=format&fit=crop&w=900&q=85',
    className: 'design-editorial',
  },
  {
    id: 'fiesta',
    name: 'Noche de fiesta',
    category: 'Cumpleaños / XV',
    description: 'Color, energía y una invitación que anticipa la celebración.',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9de200b3?auto=format&fit=crop&w=900&q=85',
    className: 'design-fiesta',
  },
]

export const demoInvitation: Invitation = {
  slug: 'vestime-asuan-15-aniversario',
  design: 'editorial',
  category: 'Aniversario de marca',
  title: 'Celebramos 15 años',
  names: 'Vestime Asuan',
  intro: 'Quince años de estilo, encuentros y momentos compartidos.',
  dateLabel: 'Martes 10 de noviembre de 2026',
  dateISO: '2026-11-10T00:00:00-03:00',
  time: 'Horario a confirmar',
  venue: 'Lugar a confirmar',
  address: 'Te compartiremos los detalles próximamente.',
  dressCode: 'Celebración y novedades',
  message: 'Queremos celebrar este camino junto a nuestros clientes y amigos. Te esperamos para compartir una ocasión especial y descubrir las novedades de Vestime Asuan.',
  coverImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=90',
  mapUrl: '',
  whatsapp: '',
}

export function getInvitationDesign(search: string): DesignId {
  const params = new URLSearchParams(search)
  const value = params.get('diseno')
  if (value === 'editorial' || value === 'fiesta' || value === 'botanico') return value
  return demoInvitation.design
}
