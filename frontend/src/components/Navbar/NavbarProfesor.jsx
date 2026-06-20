import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoSvg from '../../assets/logo.svg';
import '../../styles/Navbar.css';

function NavbarProfesor() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const nombre = user?.nombre || '';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
              Bienvenido, profesor {nombre}
            </span>
          )}
        </div>

        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`} id="navbar-links">
          <li>
            <Link to="/profesor/misClases" className="navbar__link" id="nav-mis-clases">
              Mis Clases
            </Link>
          </li>
          <li>
            <Link to="/profesor/verAlumnos" className="navbar__link" id="nav-ver-alumnos">
              Ver Alumnos
            </Link>
          </li>
        </ul>

        <div className="navbar__actions">
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
    </nav>
  );
}

export default NavbarProfesor;
