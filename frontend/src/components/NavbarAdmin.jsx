import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import '../styles/Navbar.css';
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
          <span className="navbar__logo-text">Sportify</span>
        </Link>

        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`} id="navbar-links">
          <li>
            <Link to="/alumnos" className="navbar__link" id="nav-inicio">Ver alumnos</Link>
          </li>
          <li>
            <Link href="/calendario" className="navbar__link" id="nav-info"> Calendario </Link>
          </li>
        </ul>

        <div className="navbar__actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/perfil" className="navbar__link" id="nav-login">
            Mi Perfil
          </Link>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
