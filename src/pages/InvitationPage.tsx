import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  Heart,
  MapPin,
  Share2,
  Shirt,
  Sparkles,
} from 'lucide-react'
import { demoInvitation, getInvitationDesign } from '../data/invitations'


interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  finished: boolean
}

const EVENT_DATE = new Date('2026-11-20T00:00:00-03:00')

function getCountdown(): Countdown {
  const difference = EVENT_DATE.getTime() - Date.now()

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      finished: true,
    }
  }

  const totalSeconds = Math.floor(difference / 1000)

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    finished: false,
  }
}

function CountdownUnit({
  value,
  label,
}: {
  value: number
  label: string
}) {
  return (
    <div className="vestime-countdown-unit">
      <strong>{String(value).padStart(2, '0')}</strong>
      <span>{label}</span>
    </div>
  )
}

export function InvitationPage() {
  const design = getInvitationDesign(window.location.search)
  const invite = useMemo(() => ({ ...demoInvitation, design }), [design])

  const [countdown, setCountdown] = useState<Countdown>(getCountdown)


  useEffect(() => {
    const interval = window.setInterval(() => {
      setCountdown(getCountdown())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [])

  async function shareInvitation() {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SUNSET 15 AÑOS · Vestime Asuan',
          text: '¡Cumplimos 15 años y queremos celebrarlo con vos!',
          url,
        })
      } catch {
        // El usuario puede cerrar el diálogo sin compartir.
      }

      return
    }

    try {
      await navigator.clipboard.writeText(url)
      window.alert('Enlace copiado. Ya podés compartirlo por WhatsApp.')
    } catch {
      window.prompt('Copiá el enlace para compartir la invitación:', url)
    }
  }

  return (
    <main className="invitation-page vestime-public-invitation">
      <div className="invite-topbar">
        <a href="/">
          <ArrowLeft size={16} />
          Jodafy
        </a>

        <button type="button" onClick={() => void shareInvitation()}>
          <Share2 size={16} />
          Compartir
        </button>
      </div>

      <section
        className="invite-cover"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(20,20,20,.10), rgba(20,20,20,.72)), url("${invite.coverImage}")`,
        }}
      >
        <div className="invite-cover-content">
          <span className="invite-small-label">
            <Sparkles size={13} />
            VESTIME ASUAN
          </span>

          <p className="invite-script">SUNSET</p>

          <h1>15 AÑOS</h1>

          <span className="invite-cover-date">
            CUMPLIMOS 15 AÑOS
          </span>

          <a className="invite-scroll" href="#detalles">
            DESCUBRÍ LA INVITACIÓN <span>↓</span>
          </a>
        </div>
      </section>

      <section className="invite-message" id="detalles">
        <span className="eyebrow">
          15 AÑOS HACIENDO LO QUE AMAMOS
        </span>

        <div className="invite-heart">
          <Heart size={19} />
        </div>

        <p className="invite-intro">
          Queremos celebrarlo con vos.
        </p>

        <p>
          Sos parte de nuestra historia y queremos compartir este
          momento tan especial con todas nuestras clientas.
        </p>

        <div className="invite-divider">✳</div>

        <span className="invite-date-large">
          SUNSET 15 AÑOS
        </span>

        <p>
          Quince años de historias, encuentros y momentos compartidos.
          ¡Te esperamos para festejar juntos!
        </p>
      </section>

      <section className="vestime-countdown-section" aria-live="off">
        <span className="eyebrow">
          LA CUENTA REGRESIVA COMENZÓ
        </span>

        {countdown.finished ? (
          <div className="vestime-countdown-finished">
            <span>¡LLEGÓ EL DÍA!</span>
            <h2>¡Hoy celebramos juntos!</h2>
            <p>
              Vestime Asuan cumple 15 años y queremos compartirlo con vos.
            </p>
          </div>
        ) : (
          <>
            <h2>Falta cada vez menos</h2>

            <div className="vestime-countdown">
              <CountdownUnit value={countdown.days} label="DÍAS" />
              <CountdownUnit value={countdown.hours} label="HORAS" />
              <CountdownUnit value={countdown.minutes} label="MIN" />
              <CountdownUnit value={countdown.seconds} label="SEG" />
            </div>

            <p className="vestime-countdown-date">
              20 DE NOVIEMBRE DE 2026
            </p>
          </>
        )}
      </section>

      <section className="invite-details">
        <article>
          <CalendarDays />

          <span className="eyebrow">CUÁNDO</span>

          <h3>20/11/2026</h3>

          <p>Viernes 20 de noviembre</p>
        </article>

        <article>
          <MapPin />

          <span className="eyebrow">DÓNDE</span>

          <h3>Frondizi 286</h3>

          <p>Resistencia, Chaco</p>

          <a
            className="text-link"
            href={invite.mapUrl}
            target="_blank"
            rel="noreferrer"
          >
            Cómo llegar ↗
          </a>
        </article>

        <article>
          <Shirt />

          <span className="eyebrow">DRESS CODE</span>

          <h3>100% VESTIME</h3>

          <p>Vení con tu estilo y sé parte de esta celebración.</p>
        </article>
      </section>

      <section className="vestime-final-message">
        <span className="eyebrow">VESTIME ASUAN · 15 AÑOS</span>

        <Heart size={22} />

        <h2>Queremos celebrarlo con vos.</h2>

        <p>
          Gracias por ser parte de estos 15 años.
          Te esperamos para compartir una tarde muy especial.
        </p>

        <button
          type="button"
          className="button button-dark"
          onClick={() => void shareInvitation()}
        >
          <Share2 size={16} />
          Compartir invitación
        </button>
      </section>

      <footer className="invite-footer">
        <Heart size={19} />

        <p>Con cariño,</p>

        <h2>VESTIME ASUAN</h2>

        <span>
          15 AÑOS · 2026
        </span>
      </footer>
    </main>
  )
}