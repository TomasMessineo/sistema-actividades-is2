import { useState, useEffect, useRef } from 'react';
import '../styles/Stats.css';

const stats = [
  {
    value: 3,
    suffix: '',
    label: 'Disciplinas',
    sublabel: 'Yoga · Pilates · Funcional',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
  },
  {
    value: 2,
    suffix: '',
    label: 'Profesores',
    sublabel: 'Certificados y especializados',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    value: 30,
    suffix: '',
    label: 'Alumnos por clase',
    sublabel: 'Atención personalizada',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        <path d="M22 12h-4M20 10v4"/>
      </svg>
    ),
  },
];

function AnimatedCounter({ target, suffix, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
            else setCount(target);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref} className="stats__number">
      {count}{suffix}
    </span>
  );
}

function Stats() {
  return (
    <section className="stats" id="stats">
      <div className="stats__bg-glow"></div>
      <div className="stats__container container">
        <div className="stats__header reveal">
          <h2 className="section-title">Nuestros números</h2>
          <p className="section-subtitle">
            Resultados que respaldan nuestro compromiso con la comunidad.
          </p>
        </div>

        <div className="stats__grid">
          {stats.map((stat, index) => (
            <div className="stats__item reveal" key={index} id={`stat-${index}`}>
              <div className="stats__icon-wrap">
                {stat.icon}
              </div>
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <span className="stats__label">{stat.label}</span>
              <span className="stats__sublabel">{stat.sublabel}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;
