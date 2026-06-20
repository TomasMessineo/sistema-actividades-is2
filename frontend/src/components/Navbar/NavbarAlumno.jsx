import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoSvg from '../../assets/logo.svg';
import QrAlumnoModal from '../QrAlumnoModal.jsx';
import '../../styles/Navbar.css';

const CreditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
    <polygon
      points="6.5,0.8 11.8,3.5 11.8,9.5 6.5,12.2 1.2,9.5 1.2,3.5"
      stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"
    />
    <circle cx="6.5" cy="6.5" r="2" fill="currentColor" />
  </svg>
);

const QrIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <line x1="14" y1="14" x2="14" y2="17" />
    <line x1="14" y1="20" x2="14" y2="21" />
    <line x1="17" y1="14" x2="21" y2="14" />
    <line x1="21" y1="17" x2="21" y2="21" />
    <line x1="17" y1="21" x2="17" y2="21" />
  </svg>
);

function NavbarAlumno() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [qrAbierto, setQrAbierto] = useState(false);
  const { user } = useAuth();
  const nombre = user?.nombre || '';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const creditos = user?.creditos ?? 0;

  return (
    <nav className={`navbar navbar--alumno ${scrolled ? 'navbar--scrolled' : ''}`} id="navbar">
      <div className="navbar__container">
        <div className="navbar__brand">
          <Link
            to="/"
            className="navbar__logo"
            id="navbar-logo"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img src={logoSvg} alt="Sportify" className="navbar__logo-img" />
          </Link>

          {user && (
            <span className="navbar__welcome">
              Bienvenido, alumno {nombre}
            </span>
          )}
        </div>

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
        </ul>

        <div className="navbar__actions">
          {user && (
            <button
              type="button"
              className="navbar__qr-btn"
              onClick={() => setQrAbierto(true)}
              aria-label="Mostrar mi código QR de asistencia"
              title="Mi código QR"
            >
              <QrIcon />
            </button>
          )}

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
            onClick={() => { localStorage.removeItem('sportify_user'); window.location.href = '/'; }}
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

      <QrAlumnoModal
        abierto={qrAbierto}
        onCerrar={() => setQrAbierto(false)}
        idAlumno={user?.id}
        nombre={user?.nombre}
        apellido={user?.apellido}
      />
    </nav>
  );
}

export default NavbarAlumno;