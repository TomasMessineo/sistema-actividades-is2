import { Fragment } from 'react';
import '../styles/AvailableClassesCalendar.css';

const getDayDate = (weekStart, index) => {
  if (!weekStart) return null;
  const date = new Date(weekStart);
  date.setDate(date.getDate() + index);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const esHoy = (weekStart, index) => {
  if (!weekStart) return false;
  const date = new Date(weekStart);
  date.setDate(date.getDate() + index);
  const hoy = new Date();
  return date.getFullYear() === hoy.getFullYear()
    && date.getMonth() === hoy.getMonth()
    && date.getDate() === hoy.getDate();
};

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

const weekendClosedLabel = { saturday: 'sábados', sunday: 'domingos' };

const isWeekendDay = (day) => Boolean(weekendClosedLabel[day.key]);

const formatHourRange = (hour) => `${String(hour).padStart(2, '0')}:00 - ${String(hour + 1).padStart(2, '0')}:00`;

const formatCapacity = (inscritos, cupo) => `${inscritos ?? 0}/${cupo ?? 0}`;

function AvailableClassesCalendar({
  weekStart = null,
  days,
  classes = [],
  showCapacity = false,
  showFullBadge = false,
  showCancelledState = false,
  showDayDates = true,
  showHoyBadge = true,
  headerLeft = null,
  headerCenter = null,
  headerRight = null,
  onClassClick = null,
}) {
  return (
    <section className="available-classes-calendar" aria-label="Calendario de clases disponibles">
      <div className="calendar-intro">
        <div className="calendar-intro-left">
          {headerLeft || (
            <div>
              <p className="calendar-kicker">Disponibilidad semanal</p>
              <h2>Clases por día y hora</h2>
            </div>
          )}
        </div>
        <div className="calendar-intro-center">{headerCenter}</div>
        <div className="calendar-intro-right">{headerRight}</div>
      </div>

      <div className="calendar-grid" role="table" aria-label="Matriz de horarios de clases">
        <div className="calendar-corner" aria-hidden="true" style={{ gridColumn: 1, gridRow: 1 }}>Hora</div>
        {days.map((day, index) => (
          <div
            key={day.key}
            className={`calendar-day-header${showHoyBadge && esHoy(weekStart, index) ? ' calendar-day-header--hoy' : ''}`}
            role="columnheader"
            style={{ gridColumn: index + 2, gridRow: 1 }}
          >
            <span className="calendar-day-name">{day.label}</span>
            {showDayDates && getDayDate(weekStart, index) && (
              <span className="calendar-day-date">{getDayDate(weekStart, index)}</span>
            )}
            {showHoyBadge && esHoy(weekStart, index) && <span className="calendar-day-today-badge">Hoy</span>}
          </div>
        ))}

        {days.map((day, index) => (
          isWeekendDay(day) && (
            <div
              key={`closed-${day.key}`}
              className="calendar-slot calendar-closed-slot"
              role="cell"
              style={{ gridColumn: index + 2, gridRow: `2 / span ${hours.length}` }}
            >
              <div className="calendar-closed-card">
                El gimnasio está cerrado los {weekendClosedLabel[day.key]}
              </div>
            </div>
          )
        ))}

        {hours.map((hour, hourIndex) => (
          <Fragment key={hour}>
            <div key={`hour-${hour}`} className="calendar-hour-label" role="rowheader" style={{ gridColumn: 1, gridRow: hourIndex + 2 }}>
              {String(hour).padStart(2, '0')}:00
            </div>
            {days.map((day, dayIndex) => {
              if (isWeekendDay(day)) return null;

              const slotClasses = getClassesAtSlot(classes, day.key, hour);

              return (
                <div
                  key={`${day.key}-${hour}`}
                  className="calendar-slot"
                  data-count={slotClasses.length}
                  role="cell"
                  style={{ gridColumn: dayIndex + 2, gridRow: hourIndex + 2 }}
                >
                  {slotClasses.map((classItem, index) => (
                    <article
                      key={classItem.id}
                      className={`calendar-class-card ${showCancelledState && classItem.cancelada ? 'calendar-class-card--cancelled' : `calendar-class-card--${resolveColorByActivity(classItem.activity, index)}`}`}
                      onClick={() => onClassClick?.(classItem)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClassClick?.(classItem) }}
                      style={{ cursor: onClassClick ? 'pointer' : 'default' }}
                    >
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