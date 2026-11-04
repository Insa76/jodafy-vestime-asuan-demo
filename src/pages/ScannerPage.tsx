
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { BrowserQRCodeReader } from '@zxing/browser'
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  CircleAlert,
  LogOut,
  QrCode,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type ScanTicket = {
  name?: string
  accessCount?: number
  checkedInAt?: string | null
}

type ScanResult = {
  status: string
  message?: string
  error?: string
  ticket?: ScanTicket
}

export function ScannerPage() {
  const eventSlug = window.location.pathname.split('/').filter(Boolean).slice(-1)[0] || 'demo'
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)

  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [busy, setBusy] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [operator, setOperator] = useState('')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true)
      setError('Falta configurar Supabase en .env.local.')
      return
    }

    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setAuthReady(true)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setResult(null)
      setError('')
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  function stopCamera() {
    controlsRef.current?.stop()
    controlsRef.current = null
    setCameraActive(false)
  }

  useEffect(() => () => {
    controlsRef.current?.stop()
  }, [])

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) return

    setError('')
    setBusy(true)

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (loginError) setError(loginError.message)
    setBusy(false)
  }

  async function logout() {
    stopCamera()
    if (!supabase) return

    const { error: logoutError } = await supabase.auth.signOut()
    if (logoutError) setError(logoutError.message)
  }

  function tokenFromScan(value: string) {
    try {
      const url = new URL(value)
      const parts = url.pathname.split('/').filter(Boolean)
      const cardIndex = parts.indexOf('tarjeta')

      if (cardIndex >= 0 && parts[cardIndex + 1]) {
        return parts[cardIndex + 1]
      }
    } catch {
      // También se admite pegar directamente el token.
    }

    return value.trim()
  }

  async function validateToken(rawValue: string) {
    if (!supabase || busy) return

    const token = tokenFromScan(rawValue)
    if (!token) return

    setBusy(true)
    setError('')
    setResult(null)

    const { data, error: rpcError } = await supabase.rpc(
      'check_in_ticket',
      {
        p_event_slug: eventSlug,
        p_token: token,
        p_operator_label: operator.trim() || null,
      },
    )

    if (rpcError) {
      setError(rpcError.message)
    } else {
      setResult(data as ScanResult)

      if ((data as ScanResult)?.status === 'accepted') {
        stopCamera()
      }
    }

    setBusy(false)
  }

  async function startCamera() {
    setError('')
    setResult(null)

    if (!videoRef.current) {
      setError('No se encontró el visor de cámara.')
      return
    }

    try {
      const reader = new BrowserQRCodeReader()

      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (scan) => {
          if (scan && !busy) {
            controlsRef.current?.stop()
            controlsRef.current = null
            setCameraActive(false)
            void validateToken(scan.getText())
          }
        },
      )

      controlsRef.current = controls
      setCameraActive(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo abrir la cámara. Revisá los permisos del navegador.',
      )
    }
  }

  const status = result?.status
  const statusClass = status === 'accepted'
    ? 'scan-accepted'
    : status === 'already_used'
      ? 'scan-used'
      : 'scan-rejected'

  if (!isSupabaseConfigured) {
    return (
      <main className="scanner-page">
        <div className="scanner-container">
          <h1>Configuración pendiente</h1>
          <p>{error}</p>
        </div>
      </main>
    )
  }

  if (!authReady) {
    return (
      <main className="scanner-page">
        <div className="scanner-container">Verificando acceso...</div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="scanner-page">
        <header className="scanner-header">
          <a href="/admin/demo"><ArrowLeft size={16} /> Panel de invitados</a>
          <span><QrCode size={16} /> CONTROL DE ACCESO</span>
        </header>

        <div className="scanner-container">
          <span className="eyebrow">ACCESO DE PERSONAL</span>
          <h1>Iniciar sesión</h1>
          <p className="scanner-intro">
            El control de acceso requiere un usuario autorizado en Supabase.
          </p>

          <form className="admin-form" onSubmit={(event) => void login(event)}>
            <label>
              Correo electrónico
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              />
            </label>

            {error && <p className="admin-error">{error}</p>}

            <button className="button button-dark" type="submit" disabled={busy}>
              {busy ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="scanner-page">
      <header className="scanner-header">
        <a href="/admin/demo"><ArrowLeft size={16} /> Panel de invitados</a>
        <span><QrCode size={16} /> CONTROL DE ACCESO</span>
        <button
          className="scanner-logout"
          onClick={() => void logout()}
          title="Cerrar sesión"
        >
          <LogOut size={15} />
        </button>
      </header>

      <div className="scanner-container">
        <span className="eyebrow">EVENTO · {eventSlug.toUpperCase()}</span>
        <h1>Validar invitación</h1>
        <p className="scanner-intro">
          Escaneá el QR de la tarjeta desde el celular del personal de entrada.
          Cada tarjeta se valida una sola vez.
        </p>

        <label className="scanner-operator">
          Nombre del operador (opcional)
          <input
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            placeholder="Ej. Control puerta principal"
          />
        </label>

        <section className="scanner-camera">
          <video
            ref={videoRef}
            className={cameraActive ? 'camera-video active' : 'camera-video'}
            muted
            playsInline
          />

          {!cameraActive && (
            <div className="camera-placeholder">
              <Camera size={38} />
              <span>La cámara se activa cuando presiones el botón.</span>
            </div>
          )}

          {cameraActive && (
            <div className="scan-frame">
              <span /><span /><span /><span />
            </div>
          )}
        </section>

        <div className="scanner-buttons">
          {!cameraActive ? (
            <button
              className="button button-dark"
              onClick={() => void startCamera()}
              disabled={busy}
            >
              <Camera size={17} /> Activar cámara y escanear
            </button>
          ) : (
            <button className="button button-dark" onClick={stopCamera}>
              Detener cámara
            </button>
          )}

          {result && (
            <button
              className="button button-outline"
              onClick={() => {
                setResult(null)
                setError('')
                void startCamera()
              }}
            >
              <RefreshCw size={16} /> Escanear siguiente
            </button>
          )}
        </div>

        <form
          className="manual-scan"
          onSubmit={(event) => {
            event.preventDefault()
            if (manualCode.trim()) void validateToken(manualCode)
          }}
        >
          <label>
            O pegá el enlace o código manualmente
            <input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="https://.../tarjeta/código"
            />
          </label>

          <button
            className="button button-outline"
            disabled={busy || !manualCode.trim()}
            type="submit"
          >
            {busy ? 'Validando…' : 'Validar código'}
          </button>
        </form>

        {error && (
          <div className="scan-result scan-rejected">
            <CircleAlert />
            <div>
              <strong>No se pudo validar</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className={`scan-result ${statusClass}`}>
            {status === 'accepted'
              ? <CheckCircle2 />
              : status === 'already_used'
                ? <CircleAlert />
                : <XCircle />}

            <div>
              <strong>{result.message || result.error || 'Resultado de validación'}</strong>

              {result.ticket && (
                <>
                  <p>{result.ticket.name}</p>
                  <p>
                    {result.ticket.accessCount}{' '}
                    {result.ticket.accessCount === 1
                      ? 'acceso autorizado'
                      : 'accesos autorizados'}
                  </p>

                  {result.ticket.checkedInAt && (
                    <small>
                      Validado: {new Date(result.ticket.checkedInAt).toLocaleString('es-AR')}
                    </small>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <div className="scanner-note">
          <ShieldCheck size={17} />
          <p>
            La validación se realiza directamente en Supabase.
            El primer ingreso se registra de forma atómica y las lecturas
            posteriores se rechazan.
          </p>
        </div>
      </div>
    </main>
  )
}
