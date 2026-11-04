
export interface Ticket {
  id: string
  token: string
  eventId: string
  name: string
  email: string
  note: string
  accessCount: number
  checkedIn: boolean
  checkedInAt: string | null
  createdAt: string
  checkedInBy?: string
}

export interface PublicTicket {
  id: string
  token: string
  eventId: string
  name: string
  accessCount: number
  checkedIn: boolean
  checkedInAt: string | null
  createdAt: string
  event: {
    name: string
    eventDate: string | null
    eventTime: string | null
    venue: string | null
    address: string | null
    dressCode: string | null
    coverImage: string | null
    mapUrl: string | null
  }
}
