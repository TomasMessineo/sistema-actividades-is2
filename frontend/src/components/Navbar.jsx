import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import logoImg from '../assets/logo.svg';
import '../styles/Navbar.css';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, role, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMenuOpen(false);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__logo" id="navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src={logoImg} alt="Sportify Logo" className="navbar__logo-img" />
        </Link>

        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`} id="navbar-links">
          <li>
            <Link to="/" className="navbar__link" id="nav-inicio" onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setMenuOpen(false);
            }}>Inicio</Link>
          </li>
          <li>
            <a href="/#info" className="navbar__link" id="nav-info" onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                scrollTo('info');
              } else {
                setMenuOpen(false);
              }
            }}>Información general</a>
          </li>
          <li>
            <div className="navbar__contacto-wrapper">
              <button className="navbar__link" tabIndex={0}>Contacto</button>
              <div className="navbar__contacto-tooltip" role="tooltip">
                <p className="navbar__contacto-title">Encontranos en</p>
                <a href="mailto:info@sportify.com" className="navbar__contacto-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  info@sportify.com
                </a>
                <a href="https://instagram.com/sportify_arg" target="_blank" rel="noopener noreferrer" className="navbar__contacto-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                  @sportify_arg
                </a>
                <div className="navbar__contacto-item navbar__contacto-item--static">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  La Plata, Buenos Aires
                </div>
              </div>
            </div>
          </li>
        </ul>

        <div className="navbar__actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isAuthenticated ? (
            <>
              <button 
                onClick={() => {
                  logout();
                  window.location.href = '/'; // Recargar estado completo
                }} 
                className="navbar__link navbar__link-logout" 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
              >
                Cerrar Sesión
              </button>
              <Link 
                to={role === 'ALUMNO' ? '/misClases' : '/alumnos'} 
                className="navbar__cta" 
                id="nav-cta-panel"
              >
                Ir al Panel
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__link" id="nav-login">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="navbar__cta" id="nav-cta-register">
                Registrarme
              </Link>
            </>
          )}
        </div>

        <button
          className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          id="navbar-hamburger"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
