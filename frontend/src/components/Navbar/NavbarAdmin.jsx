import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoSvg from '../../assets/logo.svg';

import '../../styles/Navbar.css';
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, role } = useAuth();
  const nombre = user?.nombre || '';

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
    <nav className={`navbar navbar--alumno ${scrolled ? 'navbar--scrolled' : ''}`} id="navbar">
      <div className="navbar__container">
        <div className="navbar__brand">
          <Link to="/" className="navbar__logo" id="navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={logoSvg} alt="Sportify" className="navbar__logo-img" />
          </Link>

          {user && (
            <span className="navbar__welcome">
              Bienvenido, administrador {nombre}
            </span>
          )}
        </div>

        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`} id="navbar-links">
          <li>
            <Link to="/admin/verAlumnos" className="navbar__link" id="nav-inicio">Ver alumnos</Link>
          </li>
          <li>
            <Link to="/profesores" className="navbar__link" id="nav-profesores">Ver profesores</Link>
          </li>
          <li>
            <Link to="/admin/calendario" className="navbar__link" id="nav-info">Calendario</Link>
          </li>
          {role === 'ADMINISTRADOR' && (
            <li>
              <Link to="/ingresos" className="navbar__link" id="nav-ingresos">Estadísticas de ingresos</Link>
            </li>
          )}
        </ul>

        <div className="navbar__actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => {
              localStorage.removeItem('sportify_user'); window.location.href = '/';
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
