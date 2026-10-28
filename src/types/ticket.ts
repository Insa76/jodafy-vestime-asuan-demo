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
