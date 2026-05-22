import '../styles/Benefits.css';

const benefits = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Seguimiento Personalizado',
    description: 'Planes de entrenamiento adaptados a tus objetivos y nivel de condición física.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    title: 'Reserva de Actividades',
    description: 'Reservá tu lugar en las clases de forma fácil y rápida desde la plataforma.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    title: 'Comunidad Activa',
    description: 'Formá parte de una comunidad que te motiva y acompaña en tu camino fitness.',
  }
];

function Benefits() {
  return (
    <section className="benefits" id="benefits">
      <div className="benefits__container container">
        <div className="benefits__header reveal">
          <h2 className="section-title">
            ¿Por qué elegir Sportify?
          </h2>
          <p className="section-subtitle">
            Más que un gimnasio, somos tu aliado para alcanzar una vida más
            saludable y activa
          </p>
        </div>

        <div className="benefits__grid">
          {benefits.map((benefit, index) => (
            <div
              className={`benefit-card reveal reveal-delay-${(index % 4) + 1}`}
              key={index}
              id={`benefit-card-${index}`}
            >
              <div className="benefit-card__icon-wrap">
                {benefit.icon}
              </div>
              <h3 className="benefit-card__title">{benefit.title}</h3>
              <p className="benefit-card__description">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div className="benefits__cta reveal">
        <div className="benefits__cta-inner container">
          <div className="benefits__cta-content">
            <h3 className="benefits__cta-title">¿Listo para empezar tu transformación?</h3>
            <p className="benefits__cta-text">
              Sumate a Sportify y descubrí un nuevo estilo de vida.
              Tu mejor versión te está esperando.
            </p>
          </div>
          <button className="benefits__cta-btn" id="cta-register">
            <span>Comenzar ahora</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

export default Benefits;
