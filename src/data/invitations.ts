
import type { Invitation, DesignId } from '../types/invitation'

export const designs: {
  id: DesignId
  name: string
  category: string
  description: string
  image: string
  className: string
}[] = [
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

  title: '2026 · CUMPLIMOS 15 AÑOS',
  names: 'VESTIME ASUAN',

  intro: 'Y queremos celebrarlo con vos.',

  dateLabel: '20/11',
  dateISO: '2026-11-20T00:00:00-03:00',

  time: 'Horario a confirmar',

  venue: 'Frondizi 286',
  address: 'Resistencia, Chaco',

  dressCode: '100% VESTIME',

  message:
    'POR 15 AÑOS HACIENDO LO QUE AMAMOS. Sos parte de nuestra historia y queremos invitarte para festejarlo juntos.',

  coverImage: '/images/VA1.jpg',

  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=Frondizi+286+Resistencia+Chaco',

  whatsapp: '',
}

export function getInvitationDesign(search: string): DesignId {
  const params = new URLSearchParams(search)
  const value = params.get('diseno')

  if (
    value === 'editorial' ||
    value === 'fiesta' ||
    value === 'botanico'
  ) {
    return value
  }

  return demoInvitation.design
}
