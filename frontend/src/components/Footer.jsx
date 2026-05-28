import logoImg from '../assets/logo.svg';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

function scrollToDiscipline(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    history.pushState(null, '', `/#${id}`);
  } else {
    window.location.href = `/#${id}`;
  }
}

const InstagramIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="footer">
      <div className="footer__container container">
        <div className="footer__top">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <img src={logoImg} alt="Sportify Logo" className="footer__logo-img" />
            </Link>
            <p className="footer__tagline">
              Centro de actividades deportivas. Tu espacio para alcanzar tu mejor versión.
            </p>
          </div>

          <div className="footer__links-group">
            <h4 className="footer__links-title">Disciplinas</h4>
            <ul className="footer__links">
              <li><a href="/#discipline-card-funcional" onClick={(e) => { e.preventDefault(); scrollToDiscipline('discipline-card-funcional'); }}>Funcional</a></li>
              <li><a href="/#discipline-card-yoga" onClick={(e) => { e.preventDefault(); scrollToDiscipline('discipline-card-yoga'); }}>Yoga</a></li>
              <li><a href="/#discipline-card-pilates" onClick={(e) => { e.preventDefault(); scrollToDiscipline('discipline-card-pilates'); }}>Pilates</a></li>
            </ul>
          </div>

          <div className="footer__links-group">
            <h4 className="footer__links-title">Empresa</h4>
            <ul className="footer__links">
              <li className="footer__tooltip-item">
                <span className="footer__tooltip-trigger">Nosotros</span>
                <div className="footer__tooltip-box">
                  Somos Sportify, un centro deportivo en La Plata dedicado a mejorar tu bienestar. Combinamos instructores certificados, instalaciones modernas y un ambiente donde cada persona encuentra su propio ritmo hacia una vida más activa.
                </div>
              </li>
              <li className="footer__tooltip-item">
                <span className="footer__tooltip-trigger">Beneficios</span>
                <div className="footer__tooltip-box">
                  Accedé a clases de Yoga, Pilates y Funcional. Reservá tu lugar, acumulá créditos Sportify y gestioná toda tu agenda deportiva desde la plataforma, cuando y donde quieras.
                </div>
              </li>
              <li className="footer__tooltip-item">
                <span className="footer__tooltip-trigger">Políticas</span>
                <div className="footer__tooltip-box">
                  Nuestra política es simple: el bienestar del alumno es lo primero. Promovemos un espacio de respeto, inclusión y mejora continua. Cada persona merece atención personalizada y un ambiente seguro para crecer.
                </div>
              </li>
            </ul>
          </div>

          <div className="footer__links-group">
            <h4 className="footer__links-title">Contacto</h4>
            <ul className="footer__links">
              <li>La Plata, Argentina</li>
              <li>info@sportify.com</li>
              <li>
                <a href="https://instagram.com/sportify_arg" target="_blank" rel="noopener noreferrer" className="footer__instagram-link">
                  <InstagramIcon />
                  @sportify_arg
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">© {currentYear} Euphratech. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
