import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoSvg from '../assets/logo.svg';

import '../styles/Navbar.css';
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();

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
            <img src={logoSvg} alt="Sportify" className="navbar__logo-img" />
        </Link>

        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`} id="navbar-links">
          <li>
            <Link to="/misClases" className="navbar__link" id="nav-inicio"> Mis Clases </Link>
          </li>
          <li>
            <Link to="/clasesDisponibles" className="navbar__link" id="nav-info"> Clases Disponibles </Link>
          </li>
          <li>
              <Link to="/historialPagos" className="navbar__link" id="nav-historial-pagos"onClick={() => setMenuOpen(false)} >Ver historial de pagos</Link>
          </li>
        </ul>

        <div className="navbar__actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => {
              logout();
              window.location.href = '/';
            }} 
            className="navbar__link navbar__link-logout" 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
          >
            Cerrar Sesión
          </button>
          <Link to="/perfil" className="navbar__link" id="nav-login">
            Mi Perfil
          </Link>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
