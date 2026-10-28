import { useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, Heart, MapPin, Music2, Share2, Shirt, Sparkles } from 'lucide-react'
import { demoInvitation, getInvitationDesign } from '../data/invitations'
import type { DesignId } from '../types/invitation'

export function InvitationPage() {
  const design = getInvitationDesign(window.location.search)
  const invite = useMemo(() => ({ ...demoInvitation, design }), [design])
  const [guestName, setGuestName] = useState('')
  const [attendance, setAttendance] = useState<'yes' | 'no'>('yes')
  const [companions, setCompanions] = useState('0')
  const [submitted, setSubmitted] = useState(false)

  const designClass: Record<DesignId, string> = {
    botanico: 'invite-botanico',
    editorial: 'invite-editorial',
    fiesta: 'invite-fiesta',
  }

  function submitRSVP(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const key = `jodafy-rsvp-${invite.slug}`
    const previous = JSON.parse(localStorage.getItem(key) || '[]') as unknown[]
    previous.push({ guestName, attendance, companions: attendance === 'yes' ? Number(companions) : 0, createdAt: new Date().toISOString() })
    localStorage.setItem(key, JSON.stringify(previous))
    setSubmitted(true)
  }

  async function shareInvitation() {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: `Invitación de ${invite.names}`, text: '¡Te compartimos nuestra invitación!', url }) } catch { /* El usuario puede cerrar el diálogo */ }
    } else {
      await navigator.clipboard?.writeText(url)
      alert('Enlace copiado. Ya podés compartirlo.')
    }
  }

  return (
    <main className={`invitation-page ${designClass[invite.design]}`}>
      <div className="invite-topbar"><a href="/"><ArrowLeft size={16} /> Jodafy</a><button onClick={shareInvitation}><Share2 size={16} /> Compartir</button></div>
      <section className="invite-cover" style={{ backgroundImage: `linear-gradient(180deg, rgba(20,20,20,.12), rgba(20,20,20,.68)), url("${invite.coverImage}")` }}>
        <div className="invite-cover-content">
          <span className="invite-small-label"><Sparkles size={13} /> UNA CELEBRACIÓN ESPECIAL</span>
          <p className="invite-script">{invite.title}</p>
          <h1>{invite.names}</h1>
          <span className="invite-cover-date">{invite.dateLabel}</span>
          <a className="invite-scroll" href="#detalles">DESCUBRÍ LA INVITACIÓN <span>↓</span></a>
        </div>
      </section>
      <section className="invite-message" id="detalles">
        <span className="eyebrow">CON MUCHA ALEGRÍA</span>
        <div className="invite-heart"><Heart size={19} /></div>
        <p className="invite-intro">{invite.intro}</p>
        <p>{invite.message}</p>
        <div className="invite-divider">✳</div>
        <span className="invite-date-large">{invite.dateLabel}</span>
      </section>
      <section className="invite-details">
        <article><CalendarDays /><span className="eyebrow">CUÁNDO</span><h3>{invite.dateLabel}</h3><p><Clock3 size={15} /> {invite.time}</p></article>
        <article><MapPin /><span className="eyebrow">DÓNDE</span><h3>{invite.venue}</h3><p>{invite.address}</p>{invite.mapUrl && <a className="text-link" href={invite.mapUrl} target="_blank" rel="noreferrer">Cómo llegar ↗</a>}</article>
        <article><Shirt /><span className="eyebrow">TE ESPERAN</span><h3>{invite.dressCode}</h3><p>Una celebración para clientes e invitados.</p></article>
      </section>
      <section className="invite-rsvp" id="confirmar">
        <div className="rsvp-heading"><span className="eyebrow">VESTIME ASUAN · 15 AÑOS</span><h2>¿Nos acompañás?</h2><p>Confirmá tu asistencia para celebrar juntos nuestros 15 años.</p></div>
        {submitted ? <div className="rsvp-success"><CheckCircle2 size={38} /><h3>¡Gracias por responder!</h3><p>Tu respuesta quedó guardada en esta demo, en este navegador.</p><button className="button button-dark" onClick={() => setSubmitted(false)}>Volver a la invitación</button></div> :
          <form className="rsvp-form" onSubmit={submitRSVP}>
            <label>Tu nombre<input required value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Nombre y apellido" /></label>
            <fieldset><legend>¿Vas a venir?</legend><label className={`attendance-option ${attendance === 'yes' ? 'selected' : ''}`}><input type="radio" checked={attendance === 'yes'} onChange={() => setAttendance('yes')} /> ¡Sí, ahí estaré!</label><label className={`attendance-option ${attendance === 'no' ? 'selected' : ''}`}><input type="radio" checked={attendance === 'no'} onChange={() => setAttendance('no')} /> Esta vez no podré</label></fieldset>
            {attendance === 'yes' && <label>Acompañantes<select value={companions} onChange={(e) => setCompanions(e.target.value)}><option value="0">Solo yo</option><option value="1">1 acompañante</option><option value="2">2 acompañantes</option><option value="3">3 acompañantes</option></select></label>}
            <button className="button button-dark rsvp-submit" type="submit">Confirmar asistencia <Heart size={16} /></button>
            <small>Demo: la respuesta se guarda solo en este navegador. Todavía no le llega al anfitrión.</small>
          </form>
        }
      </section>
      <section className="invite-footer"><Music2 size={18} /><p>Quince años de estilo</p><h2>{invite.names}</h2><button onClick={shareInvitation} className="text-link">Compartir invitación <Share2 size={15} /></button><span>Creada con <a href="/">Jodafy by Signos</a></span></section>
    </main>
  )
}
