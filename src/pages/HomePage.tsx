import { ArrowDown, ArrowRight, Check, Heart, Image as ImageIcon, MessageCircle, Sparkles } from 'lucide-react'
import { SiteHeader } from '../components/SiteHeader'
import { DesignCard } from '../components/DesignCard'
import { designs } from '../data/invitations'

export function HomePage() {
  return (
    <div className="home-page">
      <SiteHeader />
      <main>
        <section className="hero section-wrap">
          <div className="hero-copy">
            <span className="eyebrow hero-kicker"><Sparkles size={14} /> MOMENTOS QUE MERECEN ALGO ESPECIAL</span>
            <h1>Tu historia.<br /><em>Tu invitación.</em><br />Tu gran día.</h1>
            <p className="hero-description">Invitaciones digitales que emocionan desde el primer clic. Personalizá, compartí y disfrutá de organizar tu evento.</p>
            <div className="hero-actions">
              <a className="button button-dark" href="#disenos">Encontrá tu diseño <ArrowRight size={17} /></a>
              <a className="text-link" href="/invitacion/demo">Explorar una invitación <ArrowDown size={15} /></a>
            </div>
            <div className="hero-proof"><div className="proof-icons"><span>♥</span><span>✦</span><span>✿</span></div><p><strong>Un link, todos los detalles.</strong><br />Simple para vos. Especial para tus invitados.</p></div>
          </div>
          <div className="hero-visual">
            <div className="hero-orbit orbit-one"></div><div className="hero-orbit orbit-two"></div>
            <div className="hero-photo"><img src={designs[0].image} alt="Celebración de casamiento" /></div>
            <div className="floating-note note-top"><span className="note-icon"><Heart size={16} /></span><span><strong>Hecho para vos</strong><small>Personalizá cada detalle</small></span></div>
            <div className="floating-note note-bottom"><span className="note-icon note-green"><Check size={17} /></span><span><strong>¡Confirmado!</strong><small>Una respuesta menos que perseguir</small></span></div>
            <div className="hero-stamp">EL DÍA<br />QUE SOÑASTE</div>
          </div>
        </section>

        <section className="trust-strip">
          <span>UNA INVITACIÓN, MIL RECUERDOS</span><span className="trust-divider"></span><span>DISEÑOS PARA CADA HISTORIA</span><span className="trust-divider"></span><span>LISTA PARA COMPARTIR</span>
        </section>

        <section className="designs-section section-wrap" id="disenos">
          <div className="section-heading">
            <div><span className="eyebrow">LA PRIMERA IMPRESIÓN</span><h2>Un diseño que<br /><em>se siente como vos.</em></h2></div>
            <p>Elegí una estética, imaginá tu celebración y hacela propia. Cada detalle está pensado para que tus invitados empiecen a vivir el momento antes de llegar.</p>
          </div>
          <div className="design-grid">
            {designs.map((design) => <DesignCard key={design.id} {...design} />)}
          </div>
          <div className="center-cta"><a className="text-link" href="/invitacion/demo">Ver una invitación de ejemplo <ArrowRight size={16} /></a></div>
        </section>

        <section className="how-section" id="como-funciona">
          <div className="section-wrap">
            <div className="section-heading how-heading"><div><span className="eyebrow">ASÍ DE SIMPLE</span><h2>De la idea al <em>“¡ahí estaremos!”</em></h2></div><p>Todo lo importante en un mismo lugar. Sin imprimir, sin complicarte.</p></div>
            <div className="steps-grid">
              <article className="step-card"><span className="step-number">01</span><div className="step-icon"><Sparkles /></div><h3>Elegí y personalizá</h3><p>Partí de un diseño y sumá tus nombres, fecha, lugar, fotos y todos esos detalles que importan.</p></article>
              <article className="step-card"><span className="step-number">02</span><div className="step-icon"><MessageCircle /></div><h3>Compartí tu invitación</h3><p>Mandá un solo enlace por WhatsApp. Tus invitados pueden abrirlo desde cualquier dispositivo.</p></article>
              <article className="step-card"><span className="step-number">03</span><div className="step-icon"><Heart /></div><h3>Organizá con tranquilidad</h3><p>Recibí confirmaciones de asistencia y llegá al evento con menos pendientes.</p></article>
            </div>
          </div>
        </section>

        <section className="feature-section section-wrap">
          <div className="feature-image"><img src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=85" alt="Mesa preparada para una celebración" loading="lazy" /><div className="feature-image-label"><ImageIcon size={17} /> Cada detalle cuenta</div></div>
          <div className="feature-copy"><span className="eyebrow">MÁS QUE UNA TARJETA</span><h2>Todo lo que necesitan saber. <em>Todo lo que querés compartir.</em></h2><ul><li><Check /> Fecha, horario y cuenta regresiva</li><li><Check /> Ubicación con acceso al mapa</li><li><Check /> Confirmación de asistencia</li><li><Check /> Dress code, mensaje y galería</li><li><Check /> Enlace directo para compartir por WhatsApp</li></ul><a className="button button-dark" href="/invitacion/demo">Conocer la demo <ArrowRight size={16} /></a></div>
        </section>

        <section className="pricing-section" id="planes"><div className="section-wrap pricing-inner"><span className="eyebrow">TU CELEBRACIÓN EMPIEZA ACÁ</span><h2>Un gran día merece<br /><em>una gran invitación.</em></h2><p>Probá la experiencia, elegí tu estilo y personalizá los detalles.</p><a className="button button-light" href="/invitacion/demo">Probar invitación demo <ArrowRight size={16} /></a><small>Esta versión es una demo de producto. Los planes y precios se definen al publicar.</small></div><div className="pricing-decoration">J.</div></section>
      </main>
      <footer className="site-footer"><div className="section-wrap footer-inner"><div><span className="footer-brand">jodafy<span> by Signos</span></span><p>Las historias importantes merecen una invitación especial.</p></div><div className="footer-links"><a href="#disenos">Diseños</a><a href="#como-funciona">Cómo funciona</a><a href="mailto:hola@jodafy.com">Contacto</a></div><small>© {new Date().getFullYear()} Jodafy by Signos</small></div></footer>
    </div>
  )
}
