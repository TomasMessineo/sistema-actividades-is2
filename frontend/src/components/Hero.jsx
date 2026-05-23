import heroImg from '../assets/images/hero-bg-v2.png';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import '../styles/Hero.css';

function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero__bg">
        <img src={heroImg} alt="Sportify Gym Interior" className="hero__bg-img" />
        <div className="hero__bg-overlay"></div>
        <div className="hero__bg-gradient"></div>
      </div>

      {/* Animated particles */}
      <div className="hero__particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="hero__particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
            }}
          />
        ))}
      </div>

      <div className="hero__content container">
        <h1 className="hero__title reveal reveal-delay-1">
          Transformá tu cuerpo.
          <br />
          <span className="hero__title-accent">Superá tus límites.</span>
        </h1>

        <p className="hero__description reveal reveal-delay-2">
          Descubrí nuestras disciplinas, entrenamientos de élite y un espacio
          diseñado para que alcances tu mejor versión. Capacidad limitada,
          experiencia ilimitada.
        </p>

        <div className="hero__actions reveal reveal-delay-3">
          <Link to="/info" className="hero__btn hero__btn--primary" id="hero-cta-explorar">
            <span>Explorar Disciplinas</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <a href="#about" className="hero__btn hero__btn--outline" id="hero-cta-info">
            <span>Más información</span>
          </a>
        </div>

        <div className="hero__scroll-indicator reveal reveal-delay-4">
          <div className="hero__scroll-mouse">
            <div className="hero__scroll-wheel"></div>
          </div>
          <span>Scroll para explorar</span>
        </div>
      </div>

      {/* Decorative glow elements */}
      <div className="hero__glow hero__glow--1"></div>
      <div className="hero__glow hero__glow--2"></div>
    </section>
  );
}

export default Hero;
