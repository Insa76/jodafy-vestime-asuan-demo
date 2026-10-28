import { useEffect, useState, type FormEvent } from 'react'
import QRCode from 'qrcode'
import { ArrowLeft, Copy, ExternalLink, Plus, QrCode, Users } from 'lucide-react'

type DemoTicket = { id: number; name: string; accessCount: number; note: string; url: string; qr: string }
const starterNames = [{ name: 'Martina González', accessCount: 2, note: 'Invitada especial' }, { name: 'Sofía Ramírez', accessCount: 1, note: 'Cliente' }]
export function AdminTicketsPage() {
  const [tickets, setTickets] = useState<DemoTicket[]>([])
  const [name, setName] = useState('')
  const [accessCount, setAccessCount] = useState('1')
  const [note, setNote] = useState('')
  useEffect(() => { void (async () => { const base = window.location.origin; const seeded = await Promise.all(starterNames.map(async (item, i) => { const url = `${base}/tarjeta/${i === 0 ? 'demo-invitado' : 'demo-invitada-2'}`; return { ...item, id: i + 1, url, qr: await QRCode.toDataURL(url, { width: 180, margin: 1 }) } })); setTickets(seeded) })() }, [])
  async function createTicket(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const id = Date.now(); const url = `${window.location.origin}/tarjeta/demo-${id}`; const qr = await QRCode.toDataURL(url, { width: 180, margin: 1 }); setTickets(old => [...old, { id, name, accessCount: Number(accessCount), note, url, qr }]); setName(''); setAccessCount('1'); setNote('') }
  async function copy(text: string) { try { await navigator.clipboard.writeText(text); alert('Copiado.')} catch { window.prompt('Copiá el contenido:', text) } }
  return <main className="admin-page">
    <header className="admin-header"><a href="/invitacion/demo" className="admin-back"><ArrowLeft size={16}/> Volver a invitación</a><span className="admin-tag">VESTIME ASUAN · 15 AÑOS</span></header>
    <div className="admin-container"><div className="admin-title-row"><div><span className="eyebrow">VISTA PREVIA DEL SISTEMA</span><h1>Tarjetas de invitados</h1><p>Así se verá la gestión de tarjetas individuales</p></div><div className="admin-total"><Users size={18}/><span><strong>{tickets.length}</strong><small>ejemplos visuales</small></span></div></div>
    <div className="admin-warning">DEMO VISUAL: podés probar el formulario, generar QR de muestra y abrir tarjetas. Los datos no se guardan en un servidor y los códigos no validan accesos.</div>
    <section className="admin-create"><h2><Plus size={20}/> Probar una tarjeta</h2><form onSubmit={createTicket} className="admin-form"><label>Nombre del invitado<input required minLength={2} maxLength={100} value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Martina González"/></label><div className="admin-form-row"><label>Accesos autorizados<select value={accessCount} onChange={e => setAccessCount(e.target.value)}>{[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n===1?'persona':'personas'}</option>)}</select></label><label>Nota (opcional)<input value={note} onChange={e => setNote(e.target.value)} placeholder="Ej. Invitada especial"/></label></div><button className="button button-dark" type="submit">Generar tarjeta de muestra <QrCode size={16}/></button></form></section>
    <section className="admin-list-section"><div className="admin-list-heading"><h2>Ejemplos de tarjetas</h2><span>Solo para revisión de diseño</span></div><div className="ticket-admin-grid">{tickets.map(t => <article className="ticket-admin-card" key={t.id}><div className="ticket-admin-info"><span className="ticket-status ready">Muestra</span><h3>{t.name}</h3><p>{t.accessCount} {t.accessCount===1?'acceso autorizado':'accesos autorizados'}</p>{t.note && <small>{t.note}</small>}</div><img className="ticket-admin-qr" src={t.qr} alt={`QR de muestra para ${t.name}`}/><div className="ticket-admin-actions"><button onClick={() => void copy(t.url)}><Copy size={14}/> Copiar enlace</button><a href={t.url} target="_blank" rel="noreferrer"><ExternalLink size={14}/> Ver tarjeta</a></div></article>)}</div></section>
    <a className="scanner-launch" href="/scanner/demo"><QrCode size={19}/> Ver pantalla de control de acceso</a>
    </div></main>
}
