
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  MapPin,
  Share2,
  ShieldCheck,
  Ticket as TicketIcon,
  Users,
} from 'lucide-react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { PublicTicket } from '../types/ticket'
import { demoInvitation } from '../data/invitations'

export function GuestTicketPage() {
  const token = window.location.pathname.split('/').filter(Boolean).slice(-1)[0] || ''
  const [ticket, setTicket] = useState<PublicTicket | null>(null)
  const [qr, setQr] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadTicket() {
      if (!supabase || !isSupabaseConfigured) {
        setError('La conexión con Supabase todavía no está configurada.')
        setLoading(false)
        return
      }

      if (!token || token === 'demo-invitado') {
        setError('Este enlace no contiene un código individual válido.')
        setLoading(false)
        return
      }

      const { data, error: queryError } = await supabase.rpc(
        'get_public_ticket',
        { p_token: token },
      )

      if (cancelled) return

      if (queryError) {
        setError(`No se pudo consultar la invitación: ${queryError.message}`)
        setLoading(false)
        return
      }

      if (!data) {
        setError('La invitación no existe o el evento todavía no está publicado.')
        setLoading(false)
        return
      }

      const publicTicket = data as unknown as PublicTicket
      setTicket(publicTicket)

      try {
        const image = await QRCode.toDataURL(
          `${window.location.origin}/tarjeta/${encodeURIComponent(publicTicket.token)}`,
          {
            width: 320,
            margin: 2,
            errorCorrectionLevel: 'H',
          },
        )

        if (!cancelled) setQr(image)
      } catch {
        if (!cancelled) setError('No se pudo generar el código QR.')
      }

      if (!cancelled) setLoading(false)
    }

    void loadTicket()

    return () => {
      cancelled = true
    }
  }, [token])

  async function share() {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tarjeta de ${ticket?.name ?? 'invitado'} · Jodafy`,
          text: 'Tu invitación individual.',
          url,
        })
      } catch {
        // El usuario cerró el diálogo de compartir.
      }

      return
    }

    try {
      await navigator.clipboard.writeText(url)
      alert('Enlace copiado.')
    } catch {
      window.prompt('Copiá el enlace:', url)
    }
  }

  function formatDate(value: string | null | undefined) {
    if (!value) return 'Fecha a confirmar'

    return new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Argentina/Cordoba',
    }).format(new Date(`${value}T12:00:00`))
  }

  if (loading) {
    return (
      <main className="guest-ticket-page">
        <header className="guest-ticket-top">
          <a href="/"><ArrowLeft size={16} /> Jodafy</a>
        </header>
        <div className="guest-state">
          <TicketIcon size={28} />
          <p>Buscando tu invitación...</p>
        </div>
      </main>
    )
  }

  if (error || !ticket) {
    return (
      <main className="guest-ticket-page">
        <header className="guest-ticket-top">
          <a href="/"><ArrowLeft size={16} /> Jodafy</a>
        </header>
        <section className="guest-state">
          <CircleAlert size={32} />
          <h1>Invitación no disponible</h1>
          <p>{error || 'No encontramos esta tarjeta.'}</p>
          <a className="button button-dark" href="/invitacion/demo">
            Ver invitación del evento
          </a>
        </section>
      </main>
    )
  }

  const event = ticket.event
  const coverImage = event.coverImage || demoInvitation.coverImage
  const rsvpUrl = `/invitacion/demo?token=${encodeURIComponent(ticket.token)}#confirmar`

  return (
    <main className="guest-ticket-page">
      <header className="guest-ticket-top">
        <a href="/"><ArrowLeft size={16} /> Jodafy</a>
        <button onClick={() => void share()}>
          <Share2 size={16} /> Compartir
        </button>
      </header>

      <article className="guest-ticket">
        <div
          className="guest-ticket-cover"
          style={{
            backgroundImage: `linear-gradient(180deg, #18201822, #182018c9), url("${coverImage}")`,
          }}
        >
          <span>INVITACIÓN PERSONAL</span>
          <h1>{event.name || 'JODAFY'}</h1>
          <p>UNA CELEBRACIÓN ESPECIAL</p>
        </div>

        <div className="guest-ticket-body">
          <span className="guest-ticket-label">
            <TicketIcon size={15} /> TARJETA DE INVITACIÓN
          </span>

          <h2>{ticket.name}</h2>

          <p className="guest-ticket-access">
            <Users size={14} />
            {ticket.accessCount}{' '}
            {ticket.accessCount === 1
              ? 'persona autorizada'
              : 'personas autorizadas'}
          </p>

          <div className="guest-qr-wrap">
            {qr && (
              <img
                src={qr}
                alt={`Código QR individual de ${ticket.name}`}
              />
            )}
            <span>Presentá este código en la entrada</span>
          </div>

          <div className={ticket.checkedIn ? 'guest-used' : 'guest-valid'}>
            <ShieldCheck size={17} />
            {ticket.checkedIn
              ? `Ingreso registrado el ${new Date(ticket.checkedInAt || '').toLocaleString('es-AR')}.`
              : 'Invitación individual registrada.'}
          </div>

          <div className="guest-ticket-details">
            <p>
              <CalendarDays size={16} />
              {formatDate(event.eventDate)}
              {event.eventTime ? ` · ${event.eventTime}` : ''}
            </p>

            <p>
              <MapPin size={16} />
              {[event.venue, event.address].filter(Boolean).join(', ') || 'Lugar a confirmar'}
            </p>

            {event.dressCode && (
              <p><TicketIcon size={16} /> Dress code: {event.dressCode}</p>
            )}

            {event.mapUrl && (
              <a
                className="guest-map-link"
                href={event.mapUrl}
                target="_blank"
                rel="noreferrer"
              >
                Cómo llegar ↗
              </a>
            )}
          </div>
        </div>

        <div className="guest-ticket-bottom">
          <span>{event.name || 'JODAFY'}</span>
          <span>Invitación digital individual</span>
        </div>
      </article>

      {!ticket.checkedIn && (
        <div className="guest-ticket-rsvp">
          <p>¿Nos acompañás? Confirmá tu asistencia.</p>
          <a className="button button-dark" href={rsvpUrl}>
            Responder invitación
          </a>
        </div>
      )}

      <p className="guest-ticket-footnote">
        Esta tarjeta es personal. Presentá el código QR al ingresar al evento.
      </p>
    </main>
  )
}
