import { HomePage } from './pages/HomePage'
import { InvitationPage } from './pages/InvitationPage'
import { AdminTicketsPage } from './pages/AdminTicketsPage'
import { GuestTicketPage } from './pages/GuestTicketPage'
import { ScannerPage } from './pages/ScannerPage'

export default function App() {
  const path = window.location.pathname
  if (path.startsWith('/tarjeta/')) return <GuestTicketPage />
  if (path.startsWith('/scanner/')) return <ScannerPage />
  if (path.startsWith('/admin/')) return <AdminTicketsPage />
  if (path.startsWith('/invitacion/')) return <InvitationPage />
  return <HomePage />
}
