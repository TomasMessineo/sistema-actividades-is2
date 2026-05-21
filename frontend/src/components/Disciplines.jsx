import funcionalImg from '../assets/images/funcional.png';
import yogaImg from '../assets/images/yoga.png';
import pilatesImg from '../assets/images/pilates.png';
import '../styles/Disciplines.css';

const disciplines = [
  {
    id: 'funcional',
    title: 'Entrenamiento Funcional',
    description: 'Movimientos dinámicos que mejoran tu rendimiento en la vida diaria.',
    image: funcionalImg,
    level: 'Todos los niveles',
  },
  {
    id: 'yoga',
    title: 'Yoga',
    description: 'Conectá cuerpo y mente a través de posturas, respiración y meditación.',
    image: yogaImg,
    level: 'Todos los niveles',
  },
  {
    id: 'pilates',
    title: 'Pilates',
    description: 'Fortalecé tu core, mejorá tu postura y flexibilidad con ejercicios controlados.',
    image: pilatesImg,
    level: 'Todos los niveles',
  },
];

function Disciplines() {
  return (
    <section className="disciplines" id="disciplines">
      <div className="disciplines__container container">
        <div className="disciplines__header reveal">
          <span className="section-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            Disciplinas
          </span>
          <h2 className="section-title">
            Encontrá tu disciplina ideal
          </h2>
          <p className="section-subtitle">
            Ofrecemos una variedad de actividades dictadas por profesionales
            para todos los niveles y objetivos
          </p>
        </div>

        <div className="disciplines__grid">
          {disciplines.map((discipline, index) => (
            <div
              className={`discipline-card reveal reveal-delay-${index + 1}`}
              key={discipline.id}
              id={`discipline-card-${discipline.id}`}
            >
              <div className="discipline-card__image-wrapper">
                <img
                  src={discipline.image}
                  alt={discipline.title}
                  className="discipline-card__image"
                  loading="lazy"
                />
                <div className="discipline-card__image-overlay"></div>
                <span className="discipline-card__level">{discipline.level}</span>
              </div>
              <div className="discipline-card__content">
                <h3 className="discipline-card__title">{discipline.title}</h3>
                <p className="discipline-card__description">{discipline.description}</p>
                <div className="discipline-card__action">
                  <span>Ver más</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Disciplines;
