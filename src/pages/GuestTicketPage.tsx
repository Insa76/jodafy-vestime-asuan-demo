import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { ArrowLeft, CalendarDays, MapPin, Share2, ShieldCheck, Ticket as TicketIcon } from 'lucide-react'
import { demoInvitation } from '../data/invitations'

export function GuestTicketPage() {
  const token = window.location.pathname.split('/').filter(Boolean).slice(-1)[0] || 'invitado-demo'
  const guest = token === 'demo-invitado' ? 'Martina González' : 'Invitado de ejemplo'
  const [qr, setQr] = useState('')
  useEffect(() => { void QRCode.toDataURL(window.location.href, { width: 320, margin: 2, errorCorrectionLevel: 'H' }).then(setQr) }, [])
  async function share() {
    if (navigator.share) { try { await navigator.share({ title: `Tarjeta de ${guest}`, text: 'Tarjeta de muestra para el aniversario de Vestime Asuan', url: window.location.href }) } catch { /* El usuario cerró compartir */ } }
    else { try { await navigator.clipboard.writeText(window.location.href); alert('Enlace copiado.') } catch { window.prompt('Copiá el enlace:', window.location.href) } }
  }
  return <main className="guest-ticket-page">
    <header className="guest-ticket-top"><a href="/invitacion/demo"><ArrowLeft size={16}/> Jodafy</a><button onClick={share}><Share2 size={16}/> Compartir</button></header>
    <article className="guest-ticket">
      <div className="guest-ticket-cover" style={{ backgroundImage: `linear-gradient(180deg, #18201822, #182018b8), url("${demoInvitation.coverImage}")` }}>
        <span>VESTIME ASUAN · 15 AÑOS</span><h1>Vestime Asuan</h1><p>{demoInvitation.dateLabel}</p>
      </div>
      <div className="guest-ticket-body">
        <span className="guest-ticket-label"><TicketIcon size={15}/> TARJETA DE ACCESO · DEMO</span>
        <h2>{guest}</h2><p className="guest-ticket-access">2 personas autorizadas</p>
        <div className="guest-qr-wrap">{qr && <img src={qr} alt="Código QR de muestra"/>}<span>Presentá este código en la entrada</span></div>
        <div className="guest-valid"><ShieldCheck size={17}/> Vista previa — QR no conectado a control de acceso</div>
        <div className="guest-ticket-details"><p><CalendarDays size={16}/>{demoInvitation.dateLabel} · {demoInvitation.time}</p><p><MapPin size={16}/>{demoInvitation.venue}. {demoInvitation.address}</p></div>
      </div><div className="guest-ticket-bottom"><span>VESTIME ASUAN · JODAFY</span><span>Tarjeta de muestra para evaluación del diseño</span></div>
    </article><p className="guest-ticket-footnote">Esta tarjeta es una vista previa visual. El QR definitivo se generará al configurar el evento.</p>
  </main>
}
