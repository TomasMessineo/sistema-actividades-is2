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
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="footer">
      <div className="footer__container container">
        <div className="footer__bottom" style={{ borderTop: 'none', paddingTop: 0 }}>
          <p className="footer__copyright">© {currentYear} Euphratech. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
