export type DesignId = 'botanico' | 'editorial' | 'fiesta'

export interface Invitation {
  slug: string
  design: DesignId
  category: string
  title: string
  names: string
  intro: string
  dateLabel: string
  dateISO: string
  time: string
  venue: string
  address: string
  dressCode: string
  message: string
  coverImage: string
  mapUrl: string
  whatsapp: string
}
