import express from 'express'
import cors from 'cors'
import { randomBytes } from 'node:crypto'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, 'data')
const dataFile = path.join(dataDir, 'tickets.json')
const app = express()
const PORT = Number(process.env.API_PORT || 8787)

app.use(cors())
app.use(express.json({ limit: '100kb' }))

// In production, serve the built React app from the same service as the API.
const distDir = path.resolve(__dirname, '../dist')
app.use(express.static(distDir))

await mkdir(dataDir, { recursive: true })
try {
  await readFile(dataFile, 'utf8')
} catch {
  await writeFile(dataFile, JSON.stringify({ events: [], tickets: [] }, null, 2))
}

async function readStore() {
  return JSON.parse(await readFile(dataFile, 'utf8'))
}
async function writeStore(store) {
  await writeFile(dataFile, JSON.stringify(store, null, 2), 'utf8')
}
function publicTicket(ticket) {
  const { token, ...safe } = ticket
  return { ...safe, token }
}
function makeToken() {
  return randomBytes(24).toString('base64url')
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'jodafy-api' }))

app.get('/api/events/:eventId/tickets', async (req, res) => {
  try {
    const store = await readStore()
    const tickets = store.tickets
      .filter((ticket) => ticket.eventId === req.params.eventId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    res.json({ tickets: tickets.map(publicTicket) })
  } catch {
    res.status(500).json({ error: 'No se pudo leer la lista de tarjetas.' })
  }
})

app.post('/api/events/:eventId/tickets', async (req, res) => {
  try {
    const { name, email = '', accessCount = 1, note = '' } = req.body ?? {}
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ error: 'Ingresá un nombre de entre 2 y 100 caracteres.' })
    }
    const count = Number(accessCount)
    if (!Number.isInteger(count) || count < 1 || count > 10) {
      return res.status(400).json({ error: 'Los accesos deben ser un número entero entre 1 y 10.' })
    }
    const store = await readStore()
    const ticket = {
      id: randomBytes(12).toString('hex'),
      token: makeToken(),
      eventId: req.params.eventId,
      name: name.trim(),
      email: typeof email === 'string' ? email.trim().slice(0, 150) : '',
      note: typeof note === 'string' ? note.trim().slice(0, 240) : '',
      accessCount: count,
      checkedIn: false,
      checkedInAt: null,
      createdAt: new Date().toISOString(),
    }
    store.tickets.push(ticket)
    await writeStore(store)
    res.status(201).json({ ticket: publicTicket(ticket) })
  } catch {
    res.status(500).json({ error: 'No se pudo crear la tarjeta.' })
  }
})

app.get('/api/tickets/:token', async (req, res) => {
  try {
    const store = await readStore()
    const ticket = store.tickets.find((item) => item.token === req.params.token)
    if (!ticket) return res.status(404).json({ error: 'La tarjeta no existe o el código no es válido.' })
    res.json({ ticket: publicTicket(ticket) })
  } catch {
    res.status(500).json({ error: 'No se pudo consultar la tarjeta.' })
  }
})

app.post('/api/events/:eventId/check-in/:token', async (req, res) => {
  try {
    const store = await readStore()
    const ticket = store.tickets.find((item) => item.token === req.params.token)
    if (!ticket) return res.status(404).json({ status: 'invalid', error: 'QR inválido: no encontramos esta tarjeta.' })
    if (ticket.eventId !== req.params.eventId) {
      return res.status(409).json({ status: 'wrong_event', error: 'Esta tarjeta pertenece a otro evento.', ticket: publicTicket(ticket) })
    }
    if (ticket.checkedIn) {
      return res.status(409).json({
        status: 'already_used',
        error: 'Este QR ya fue utilizado.',
        ticket: publicTicket(ticket),
      })
    }
    ticket.checkedIn = true
    ticket.checkedInAt = new Date().toISOString()
    ticket.checkedInBy = typeof req.body?.operator === 'string' ? req.body.operator.trim().slice(0, 80) : 'Control de acceso'
    await writeStore(store)
    res.json({ status: 'accepted', message: 'Ingreso autorizado.', ticket: publicTicket(ticket) })
  } catch {
    res.status(500).json({ error: 'No se pudo validar el QR. Intentá nuevamente.' })
  }
})

// SPA fallback: allow direct opening of /invitacion/demo, /admin/demo, etc.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next()
  res.sendFile(path.join(distDir, 'index.html'), (err) => { if (err) next(err) })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Jodafy API lista en http://localhost:${PORT}`)
})
