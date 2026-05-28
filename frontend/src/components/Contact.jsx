import '../styles/Contact.css';

const InstagramIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const MailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

function Contact() {
  return (
    <section className="contact-section reveal" id="contacto">
      <div className="contact-overlay">
        <div className="contact-content container">
          <h2 className="section-title contact-title">Contacto</h2>
          <p className="section-subtitle contact-subtitle">
            ¿Tenés dudas o querés sumarte? Escribinos o acercate a nuestro centro deportivo.
          </p>
          
          <div className="contact-grid">
            <div className="contact-card reveal reveal-delay-1">
              <div className="contact-card__icon">
                <MapPinIcon />
              </div>
              <h3>Nuestra Sede</h3>
              <p>La Plata, Buenos Aires</p>
              <p>Argentina</p>
            </div>

            <div className="contact-card reveal reveal-delay-2">
              <div className="contact-card__icon">
                <MailIcon />
              </div>
              <h3>Email</h3>
              <p>Escribinos para más información</p>
              <a href="mailto:info@sportify.com" className="contact-link">info@sportify.com</a>
            </div>

            <div className="contact-card reveal reveal-delay-3">
              <div className="contact-card__icon">
                <InstagramIcon />
              </div>
              <h3>Redes Sociales</h3>
              <p>Seguinos en Instagram</p>
              <a href="https://instagram.com/sportify_arg" target="_blank" rel="noopener noreferrer" className="contact-link">@sportify_arg</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
