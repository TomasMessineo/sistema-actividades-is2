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
    tags: ['Alta intensidad', '60 min'],
  },
  {
    id: 'yoga',
    title: 'Yoga',
    description: 'Conectá cuerpo y mente a través de posturas, respiración y meditación.',
    image: yogaImg,
    level: 'Todos los niveles',
    tags: ['Intensidad suave', '60 min'],
  },
  {
    id: 'pilates',
    title: 'Pilates',
    description: 'Fortalecé tu core, mejorá tu postura y flexibilidad con ejercicios controlados.',
    image: pilatesImg,
    level: 'Todos los niveles',
    tags: ['Intensidad media', '60 min'],
  },
];

function Disciplines() {
  return (
    <section className="disciplines" id="disciplines">
      <div className="disciplines__container container">
        <div className="disciplines__header reveal">
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

                <div className="discipline-card__hover-panel">
                  <div className="discipline-card__hover-tags">
                    {discipline.tags.map((tag) => (
                      <span key={tag} className="discipline-card__tag">{tag}</span>
                    ))}
                  </div>
                </div>
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
