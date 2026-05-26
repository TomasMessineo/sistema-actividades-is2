import { Fragment } from 'react';
import '../styles/AvailableClassesCalendar.css';

const weekDays = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
];

const hours = Array.from({ length: 13 }, (_, index) => index + 8);

const fallbackColorOrder = ['mint', 'sky', 'amber', 'violet', 'rose', 'emerald'];

const normalizeActivityName = (activity) => {
  if (!activity) return 'Clase';

  const formatted = activity
    .toString()
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ');

  if (!formatted) return 'Clase';
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const resolveColorByActivity = (activity, index) => {
  const key = activity?.toString().trim().toUpperCase();

  if (key === 'FUNCIONAL') return 'mint';
  if (key === 'YOGA') return 'sky';
  if (key === 'PILATES') return 'amber';

  return fallbackColorOrder[index % fallbackColorOrder.length];
};

const getClassesAtSlot = (classes, dayKey, hour) => {
  return classes.filter((item) => item.day === dayKey && item.hour === hour);
};

const formatHourRange = (hour) => `${String(hour).padStart(2, '0')}:00 - ${String(hour + 1).padStart(2, '0')}:00`;

const formatCapacity = (inscritos, cupo) => `${inscritos ?? 0}/${cupo ?? 0}`;

function AvailableClassesCalendar({
  weekLabel,
  onPreviousWeek,
  onNextWeek,
  classes = [],
  showCapacity = false,
  showFullBadge = false,
  headerAction = null,
}) {
  return (
    <section className="available-classes-calendar" aria-label="Calendario de clases disponibles">
      <div className="calendar-intro">
        {headerAction || (
          <div>
            <p className="calendar-kicker">Disponibilidad semanal</p>
            <h2>Clases por día y hora</h2>
          </div>
        )}
        <div className="calendar-week-controls" aria-label="Navegación de semana">
          <button type="button" className="calendar-week-button" onClick={onPreviousWeek} aria-label="Semana anterior">
            &lt;
          </button>
          <span className="calendar-week-label">{weekLabel}</span>
          <button type="button" className="calendar-week-button" onClick={onNextWeek} aria-label="Semana siguiente">
            &gt;
          </button>
        </div>
      </div>

      <div className="calendar-grid" role="table" aria-label="Matriz de horarios de clases">
        <div className="calendar-corner" aria-hidden="true">Hora</div>
        {weekDays.map((day) => (
          <div key={day.key} className="calendar-day-header" role="columnheader">
            {day.label}
          </div>
        ))}

        {hours.map((hour) => (
          <Fragment key={hour}>
            <div key={`hour-${hour}`} className="calendar-hour-label" role="rowheader">
              {String(hour).padStart(2, '0')}:00
            </div>
            {weekDays.map((day) => {
              const slotClasses = getClassesAtSlot(classes, day.key, hour);

              return (
                <div key={`${day.key}-${hour}`} className="calendar-slot" role="cell">
                  {slotClasses.map((classItem, index) => (
                    <article key={classItem.id} className={`calendar-class-card calendar-class-card--${resolveColorByActivity(classItem.activity, index)}`}>
                      {showFullBadge && Number(classItem.inscritos) >= Number(classItem.cupo) && (
                        <span className="calendar-class-full-badge" aria-label="Clase completa" title="Clase completa">
                          !
                        </span>
                      )}
                      <span className="calendar-class-time">{formatHourRange(hour)}</span>
                      <strong>{normalizeActivityName(classItem.activity)}</strong>
                      {showCapacity && (
                        <span className="calendar-class-capacity">{formatCapacity(classItem.inscritos, classItem.cupo)}</span>
                      )}
                    </article>
                  ))}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </section>
  );
}

export default AvailableClassesCalendar;