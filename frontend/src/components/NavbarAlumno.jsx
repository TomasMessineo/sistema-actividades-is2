import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoSvg from '../assets/logo.svg';
import '../styles/Navbar.css';

const CreditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
    <polygon
      points="6.5,0.8 11.8,3.5 11.8,9.5 6.5,12.2 1.2,9.5 1.2,3.5"
      stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"
    />
    <circle cx="6.5" cy="6.5" r="2" fill="currentColor" />
  </svg>
);

function NavbarAlumno() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const creditos = user?.creditos ?? 0;

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="navbar">
      <div className="navbar__container">

        <Link
          to="/"
          className="navbar__logo"
          id="navbar-logo"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img src={logoSvg} alt="Sportify" className="navbar__logo-img" />
        </Link>

        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`} id="navbar-links">
          <li>
            <Link to="/misClases" className="navbar__link" id="nav-mis-clases">
              Mis Clases
            </Link>
          </li>
          <li>
            <Link to="/clasesDisponibles" className="navbar__link" id="nav-clases-disponibles">
              Clases Disponibles
            </Link>
          </li>
          <li>
              <Link to="/historialPagos" className="navbar__link" id="nav-historial-pagos"onClick={() => setMenuOpen(false)} >Ver historial de pagos</Link>
          </li>
        </ul>

        <div className="navbar__actions">
          {user && (
            <span className="navbar__creditos-wrapper">
              <span className="navbar__creditos" tabIndex={0} aria-describedby="creditos-tooltip">
                <CreditIcon />
                {creditos} {creditos === 1 ? 'crédito' : 'créditos'}
              </span>
                <div id="creditos-tooltip" className="navbar__creditos-tooltip" role="tooltip">
                <p className="navbar__creditos-tooltip-title">
                  <CreditIcon /> Créditos Sportify
                </p>
                <ul className="navbar__creditos-tooltip-list">
                  <li>Son acumulativos durante el período</li>
                  <li>Los no utilizados se pierden al cambio de período</li>
                </ul>
                <p className="navbar__creditos-tooltip-balance">
                  Saldo actual: <strong>{creditos} {creditos === 1 ? 'crédito' : 'créditos'}</strong>
                </p>
              </div>
            </span>
          )}

          <button
            onClick={() => { logout(); window.location.href = '/'; }}
            className="navbar__link navbar__link-logout"
          >
            Cerrar Sesión
          </button>

          <Link to="/perfil" className="navbar__link" id="nav-perfil">
            Mi Perfil
          </Link>
        </div>

        <button
          className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div>
    </nav>
  );
}

export default NavbarAlumno;