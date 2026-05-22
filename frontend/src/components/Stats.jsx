import { useState, useEffect, useRef } from 'react';
import '../styles/Stats.css';
const stats = [
  { value: 3, suffix: '', label: 'Disciplinas', icon: '🏋️' },
  { value: 30, suffix: '', label: 'Capacidad máxima del salón', icon: '👥' },
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
            // easeOutQuart
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(eased * target));

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(target);
            }
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
          <h2 className="section-title">
            Nuestros números
          </h2>
          <p className="section-subtitle">
            Resultados que respaldan nuestro compromiso con la comunidad.
          </p>
        </div>

        <div className="stats__grid">
          {stats.map((stat, index) => (
            <div className="stats__item reveal" key={index} id={`stat-${index}`}>
              <span className="stats__icon">{stat.icon}</span>
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <span className="stats__label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;
