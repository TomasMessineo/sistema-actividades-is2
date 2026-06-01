import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import logoImg from '../assets/logo.svg';
import '../../styles/Navbar.css';

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
            <a href="/#contacto" className="navbar__link" id="nav-contacto" onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                scrollTo('contacto');
              } else {
                setMenuOpen(false);
              }
            }}>Contacto</a>
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
