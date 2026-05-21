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
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'Control de Progreso',
    description: 'Monitoreá tu avance con métricas y estadísticas detalladas de tu rendimiento.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    ),
    title: 'Ambiente Motivador',
    description: 'Un espacio energético y positivo donde cada sesión se siente como una victoria.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
    title: 'Capacidad Controlada',
    description: 'Salones con cupo limitado para garantizar atención personalizada y seguridad.',
  },
];

function Benefits() {
  return (
    <section className="benefits" id="benefits">
      <div className="benefits__container container">
        <div className="benefits__header reveal">
          <span className="section-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Beneficios
          </span>
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
