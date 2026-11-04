
import { useEffect, useState, type FormEvent } from 'react'
import QRCode from 'qrcode'
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  LogOut,
  Plus,
  QrCode,
  Users,
  RefreshCw,
} from 'lucide-react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Ticket } from '../types/ticket'

const EVENT_SLUG = 'demo'
const EVENT_NAME = 'Vestime Asuan · 15 años'

type GuestRow = {
  name: string
  email: string | null
  note: string | null
}

type TicketRow = {
  id: string
  token: string
  access_count: number
  checked_in: boolean
  checked_in_at: string | null
  created_at: string
  guest: GuestRow | GuestRow[] | null
}

function ticketUrl(token: string) {
  return `${window.location.origin}/tarjeta/${encodeURIComponent(token)}`
}

export function AdminTicketsPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [eventId, setEventId] = useState('')
  const [eventStatus, setEventStatus] = useState('draft')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [accessCount, setAccessCount] = useState('1')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [error, setError] = useState('')
  const [qrData, setQrData] = useState<Record<string, string>>({})
  const [createdUrl, setCreatedUrl] = useState('')

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true)
      setError('Falta configurar la conexión con Supabase en .env.local.')
      return
    }

    let active = true

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      if (sessionError) setError(sessionError.message)
      setSession(data.session)
      setAuthReady(true)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setEventId('')
      setTickets([])
      setError('')
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!supabase || !session) return

    let cancelled = false

    async function initialize() {
      setError('')

      const { data, error: eventError } = await supabase!
        .from('events')
        .select('id, name, status')
        .eq('slug', EVENT_SLUG)
        .single()

      if (cancelled) return

      if (eventError || !data) {
        setError(
          'No se encontró el evento o tu usuario no tiene permisos. Verificá que el usuario tenga rol owner en event_members.',
        )
        return
      }

      setEventId(data.id)
      setEventStatus(data.status)
    }

    void initialize()

    return () => {
      cancelled = true
    }
  }, [session])

  async function loadTickets(currentEventId = eventId) {
    if (!supabase || !currentEventId) return

    setError('')

    const { data, error: queryError } = await supabase
      .from('tickets')
      .select(`
        id,
        token,
        access_count,
        checked_in,
        checked_in_at,
        created_at,
        guest:guests(name, email, note)
      `)
      .eq('event_id', currentEventId)
      .order('created_at', { ascending: false })

    if (queryError) {
      setError(`No se pudieron cargar las tarjetas: ${queryError.message}`)
      return
    }

    const rows = (data ?? []) as unknown as TicketRow[]

    setTickets(rows.map((row) => {
      const guest = Array.isArray(row.guest) ? row.guest[0] : row.guest

      return {
        id: row.id,
        token: row.token,
        eventId: EVENT_SLUG,
        name: guest?.name ?? 'Invitado',
        email: guest?.email ?? '',
        note: guest?.note ?? '',
        accessCount: row.access_count,
        checkedIn: row.checked_in,
        checkedInAt: row.checked_in_at,
        createdAt: row.created_at,
      }
    }))
  }

  useEffect(() => {
    if (eventId) void loadTickets(eventId)
  }, [eventId])

  useEffect(() => {
    let cancelled = false

    async function makeCodes() {
      const pairs = await Promise.all(
        tickets.map(async (ticket) => [
          ticket.token,
          await QRCode.toDataURL(ticketUrl(ticket.token), {
            width: 220,
            margin: 1,
            errorCorrectionLevel: 'M',
          }),
        ] as const),
      )

      if (!cancelled) setQrData(Object.fromEntries(pairs))
    }

    void makeCodes()

    return () => {
      cancelled = true
    }
  }, [tickets])

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return

    setLoginLoading(true)
    setError('')

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (loginError) setError(loginError.message)

    setLoginLoading(false)
  }

  async function logout() {
    if (!supabase) return

    const { error: logoutError } = await supabase.auth.signOut()

    if (logoutError) setError(logoutError.message)
  }

  async function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!supabase || !eventId) {
      setError('El evento todavía no está disponible.')
      return
    }

    setLoading(true)
    setError('')
    setCreatedUrl('')

    let guestId: string | null = null

    try {
      const { data: guest, error: guestError } = await supabase
        .from('guests')
        .insert({
          event_id: eventId,
          name: name.trim(),
          email: guestEmail.trim() || null,
          note: note.trim() || null,
        })
        .select('id')
        .single()

      if (guestError || !guest) {
        throw new Error(
          guestError?.message || 'No se pudo crear el invitado.',
        )
      }

      guestId = guest.id

      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          event_id: eventId,
          guest_id: guestId,
          access_count: Number(accessCount),
        })
        .select('id, token')
        .single()

      if (ticketError || !ticket) {
        throw new Error(
          ticketError?.message || 'No se pudo crear la tarjeta.',
        )
      }

      setCreatedUrl(ticketUrl(ticket.token))
      setName('')
      setGuestEmail('')
      setAccessCount('1')
      setNote('')

      await loadTickets(eventId)
    } catch (err) {
      if (guestId) {
        await supabase.from('guests').delete().eq('id', guestId)
      }

      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo crear la tarjeta.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      alert('Enlace copiado. Ya podés compartirlo por WhatsApp.')
    } catch {
      window.prompt('Copiá el enlace:', url)
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="admin-page">
        <div className="admin-container">
          <h1>Configuración pendiente</h1>
          <p>
            Completá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
            en el archivo .env.local.
          </p>
        </div>
      </main>
    )
  }

  if (!authReady) {
    return (
      <main className="admin-page">
        <div className="admin-container">Cargando acceso...</div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="admin-page">
        <header className="admin-header">
          <a href="/" className="admin-back">
            <ArrowLeft size={16} /> Jodafy
          </a>
          <span className="admin-tag">ACCESO ADMINISTRATIVO</span>
        </header>

        <div className="admin-container">
          <section className="admin-create">
            <span className="eyebrow">JODAFY · ADMINISTRACIÓN</span>
            <h1>Iniciar sesión</h1>
            <p>Ingresá con el usuario administrador creado en Supabase.</p>

            <form onSubmit={login} className="admin-form">
              <label>
                Correo electrónico
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                />
              </label>

              <label>
                Contraseña
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                />
              </label>

              {error && <p className="admin-error">{error}</p>}

              <button
                className="button button-dark"
                type="submit"
                disabled={loginLoading}
              >
                {loginLoading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <a href="/" className="admin-back">
          <ArrowLeft size={16} /> Jodafy
        </a>

        <div className="admin-tag">
          <span>{session.user.email}</span>
          <button onClick={() => void logout()} title="Cerrar sesión">
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <div className="admin-container">
        <div className="admin-title-row">
          <div>
            <span className="eyebrow">TARJETAS Y ACCESOS</span>
            <h1>Invitados</h1>
            <p>{EVENT_NAME}</p>
          </div>

          <div className="admin-total">
            <Users size={18} />
            <span>
              <strong>{tickets.length}</strong>
              <small>tarjetas creadas</small>
            </span>
          </div>
        </div>

        <div className="admin-warning">
          {eventStatus === 'published'
            ? 'Evento publicado. Las tarjetas individuales ya pueden abrirse y responder el RSVP.'
            : 'Evento en borrador. Podés preparar invitados y tarjetas; los enlaces públicos se habilitarán al publicar.'}
        </div>

        <section className="admin-create">
          <h2><Plus size={20} /> Crear tarjeta individual</h2>

          <form onSubmit={createTicket} className="admin-form">
            <label>
              Nombre del invitado
              <input
                required
                minLength={2}
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Martina González"
              />
            </label>

            <div className="admin-form-row">
              <label>
                Email (opcional)
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="martina@email.com"
                />
              </label>

              <label>
                Accesos autorizados
                <select
                  value={accessCount}
                  onChange={(e) => setAccessCount(e.target.value)}
                >
                  {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'persona' : 'personas'}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              Nota interna (opcional)
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={240}
                placeholder="Ej. Familia / mesa 4"
              />
            </label>

            <button
              className="button button-dark"
              type="submit"
              disabled={loading || !eventId}
            >
              {loading ? 'Creando...' : 'Crear tarjeta y QR'}
              <QrCode size={16} />
            </button>
          </form>

          {error && <p className="admin-error">{error}</p>}

          {createdUrl && (
            <div className="created-banner">
              <strong>¡Tarjeta creada!</strong>
              <span>Enlace individual listo para compartir.</span>

              <button
                onClick={() => void copyLink(createdUrl)}
                className="button button-dark"
              >
                Copiar enlace para WhatsApp <Copy size={15} />
              </button>

              <a href={createdUrl} target="_blank" rel="noreferrer">
                Abrir tarjeta <ExternalLink size={14} />
              </a>

              <a
                href={`/invitacion/${EVENT_SLUG}?token=${encodeURIComponent(createdUrl.split('/').pop() || '')}`}
                target="_blank"
                rel="noreferrer"
              >
                Abrir RSVP <ExternalLink size={14} />
              </a>
            </div>
          )}
        </section>

        <section className="admin-list-section">
          <div className="admin-list-heading">
            <h2>Tarjetas creadas</h2>
            <button
              onClick={() => void loadTickets()}
              className="admin-refresh"
            >
              <RefreshCw size={12} /> Actualizar lista
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="admin-empty">
              <QrCode size={28} />
              <p>Todavía no hay tarjetas. Creá la primera con el formulario.</p>
            </div>
          ) : (
            <div className="ticket-admin-grid">
              {tickets.map((ticket) => (
                <article className="ticket-admin-card" key={ticket.id}>
                  <div className="ticket-admin-info">
                    <span className={`ticket-status ${ticket.checkedIn ? 'used' : 'ready'}`}>
                      {ticket.checkedIn ? 'Ingresó' : 'Pendiente'}
                    </span>
                    <h3>{ticket.name}</h3>
                    <p>
                      {ticket.accessCount}{' '}
                      {ticket.accessCount === 1
                        ? 'acceso autorizado'
                        : 'accesos autorizados'}
                    </p>
                    {ticket.note && <small>{ticket.note}</small>}
                  </div>

                  {qrData[ticket.token] && (
                    <img
                      className="ticket-admin-qr"
                      src={qrData[ticket.token]}
                      alt={`QR de ${ticket.name}`}
                    />
                  )}

                  <div className="ticket-admin-actions">
                    <button onClick={() => void copyLink(ticketUrl(ticket.token))}>
                      <Copy size={14} /> Copiar enlace
                    </button>

                    <a
                      href={ticketUrl(ticket.token)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink size={14} /> Ver tarjeta
                    </a>

                    <a
                      href={`/invitacion/${EVENT_SLUG}?token=${encodeURIComponent(ticket.token)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      RSVP
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <a className="scanner-launch" href={`/scanner/${EVENT_SLUG}`}>
          <QrCode size={19} /> Abrir control de acceso / escáner QR
        </a>
      </div>
    </main>
  )
}
