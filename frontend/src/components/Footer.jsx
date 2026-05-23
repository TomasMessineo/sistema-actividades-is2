import logoImg from '../assets/images/logo.svg';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

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
              <li><Link to="/info">Funcional</Link></li>
              <li><Link to="/info">Yoga</Link></li>
              <li><Link to="/info">Pilates</Link></li>
            </ul>
          </div>

          <div className="footer__links-group">
            <h4 className="footer__links-title">Empresa</h4>
            <ul className="footer__links">
              <li><Link to="/">Nosotros</Link></li>
              <li><Link to="/info">Beneficios</Link></li>
              <li><Link to="/">Contacto</Link></li>
            </ul>
          </div>

          <div className="footer__links-group">
            <h4 className="footer__links-title">Contacto</h4>
            <ul className="footer__links">
              <li>La Plata, Argentina</li>
              <li>info@sportify.com</li>
              <li>+54 351 123-4567</li>
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
