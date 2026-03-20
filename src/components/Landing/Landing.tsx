"use client";
import "./Landing.css";

export function Landing() {
  return (
    <>
      {/* Navbar */}
      <nav className="landing-nav">
        <img src="/logo.jpg" alt="SantaJusta Lovemade" className="landing-nav__logo" />
        <ul className="landing-nav__links">
          <li><a href="#como-funciona">Cómo funciona</a></li>
          <li><a href="#galeria">Galería</a></li>
        </ul>
        <a href="/configurar" className="landing-nav__cta">Diseñar ahora</a>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <svg
          className="landing-hero__watermark"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Lotus watermark */}
          <ellipse cx="100" cy="130" rx="12" ry="40" fill="currentColor" />
          <ellipse cx="100" cy="130" rx="12" ry="40" fill="currentColor" transform="rotate(30 100 130)" />
          <ellipse cx="100" cy="130" rx="12" ry="40" fill="currentColor" transform="rotate(60 100 130)" />
          <ellipse cx="100" cy="130" rx="12" ry="40" fill="currentColor" transform="rotate(90 100 130)" />
          <ellipse cx="100" cy="130" rx="12" ry="40" fill="currentColor" transform="rotate(120 100 130)" />
          <ellipse cx="100" cy="130" rx="12" ry="40" fill="currentColor" transform="rotate(150 100 130)" />
          <ellipse cx="100" cy="130" rx="12" ry="40" fill="currentColor" transform="rotate(180 100 130)" />
          <ellipse cx="100" cy="130" rx="12" ry="40" fill="currentColor" transform="rotate(210 100 130)" />
          <ellipse cx="100" cy="130" rx="12" ry="40" fill="currentColor" transform="rotate(240 100 130)" />
          <ellipse cx="100" cy="130" rx="12" ry="40" fill="currentColor" transform="rotate(270 100 130)" />
          <ellipse cx="100" cy="130" rx="12" ry="40" fill="currentColor" transform="rotate(300 100 130)" />
          <ellipse cx="100" cy="130" rx="12" ry="40" fill="currentColor" transform="rotate(330 100 130)" />
          <circle cx="100" cy="130" r="10" fill="currentColor" />
          <line x1="100" y1="170" x2="100" y2="200" stroke="currentColor" strokeWidth="3" />
        </svg>

        <div className="landing-hero__content">
          <span className="landing-hero__label">LOVEMADE · URUGUAY</span>
          <h1 className="landing-hero__headline">
            Tu familia,<br />en madera.
          </h1>
          <p className="landing-hero__sub">
            Figuras artesanales únicas que capturan la esencia de cada familia.
            Diseñadas con amor, talladas a mano en Uruguay.
          </p>
          <a href="/configurar" className="landing-hero__btn">
            Diseñar mi regalo
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="landing-how" id="como-funciona">
        <p className="landing-section__label">El proceso</p>
        <h2 className="landing-section__title">Cómo funciona</h2>
        <div className="landing-how__grid">
          <div className="landing-how__card">
            <div className="landing-how__num">1</div>
            <h3 className="landing-how__card-title">Elegí tu familia</h3>
            <p className="landing-how__card-desc">
              Seleccioná cuántas personas componen tu familia: adultos, niños y bebés.
            </p>
          </div>
          <div className="landing-how__card">
            <div className="landing-how__num">2</div>
            <h3 className="landing-how__card-title">Personalizá cada figura</h3>
            <p className="landing-how__card-desc">
              Elegí colores, accesorios y detalles únicos para cada integrante.
            </p>
          </div>
          <div className="landing-how__card">
            <div className="landing-how__num">3</div>
            <h3 className="landing-how__card-title">Recibí tu regalo</h3>
            <p className="landing-how__card-desc">
              Coordinamos la entrega. Tu familia en madera, lista para regalar o guardar.
            </p>
          </div>
        </div>
        <div className="landing-how__cta-row">
          <a href="/configurar" className="landing-how__cta-link">
            Empezar ahora →
          </a>
        </div>
      </section>

      {/* Galería */}
      <section className="landing-gallery" id="galeria">
        <p className="landing-section__label">Galería</p>
        <h2 className="landing-section__title" style={{ marginBottom: "4rem" }}>Nuestros productos</h2>
        <div className="landing-gallery__grid">
          <div className="landing-gallery__card">
            <span className="landing-gallery__placeholder">Foto próximamente</span>
          </div>
          <div className="landing-gallery__card">
            <span className="landing-gallery__placeholder">Foto próximamente</span>
          </div>
          <div className="landing-gallery__card">
            <span className="landing-gallery__placeholder">Foto próximamente</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <img src="/logo.jpg" alt="SantaJusta Lovemade" className="landing-footer__logo" />
        <div className="landing-footer__links">
          <a
            href="https://www.instagram.com/santajusta_uy/"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-footer__link"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
            </svg>
            Instagram
          </a>
          <a
            href="https://wa.me/59894394242"
            target="_blank"
            rel="noopener noreferrer"
            className="landing-footer__link"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            WhatsApp
          </a>
        </div>
        <p className="landing-footer__copy">
          © 2025 SantaJusta Lovemade · Hecho con amor en Uruguay
        </p>
      </footer>
    </>
  );
}
