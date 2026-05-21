import '../styles/About.css';
function About() {
  return (
    <section className="about" id="about">
      <div className="about__container container">
        <div className="about__header reveal">
          <span className="section-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            Sobre Nosotros
          </span>
          <h2 className="section-title">
            Un espacio diseñado para<br /> tu rendimiento
          </h2>
          <p className="section-subtitle">
            En Sportify combinamos infraestructura de primer nivel con
            profesionales apasionados para brindarte una experiencia única
          </p>
        </div>

        <div className="about__grid">
          <div className="about__card reveal reveal-delay-1" id="about-card-1">
            <div className="about__card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 20V10M12 20V4M6 20v-6"/>
              </svg>
            </div>
            <h3 className="about__card-title">Instalaciones Premium</h3>
            <p className="about__card-text">
              Equipamiento de última generación, amplios salones y zonas
              especializadas para cada disciplina.
            </p>
          </div>

          <div className="about__card reveal reveal-delay-2" id="about-card-2">
            <div className="about__card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h3 className="about__card-title">Profesores Certificados</h3>
            <p className="about__card-text">
              Nuestro equipo de profesionales te guía y motiva en cada
              entrenamiento para maximizar resultados.
            </p>
          </div>

          <div className="about__card reveal reveal-delay-3" id="about-card-3">
            <div className="about__card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h3 className="about__card-title">Horarios Flexibles</h3>
            <p className="about__card-text">
              Clases durante todo el día, adaptadas a tu rutina. Encontrá
              el horario ideal para vos.
            </p>
          </div>

          <div className="about__card reveal reveal-delay-4" id="about-card-4">
            <div className="about__card-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <h3 className="about__card-title">Experiencia Integral</h3>
            <p className="about__card-text">
              Seguimiento personalizado, comunidad activa y un ambiente
              que te impulsa a dar lo mejor.
            </p>
          </div>
        </div>
      </div>

      {/* Decorative gradient line */}
      <div className="about__divider"></div>
    </section>
  );
}

export default About;
