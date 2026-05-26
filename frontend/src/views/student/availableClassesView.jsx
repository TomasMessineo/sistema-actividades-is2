import { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '../../components/NavbarAlumno.jsx';
import AvailableClassesCalendar from '../../components/AvailableClassesCalendar';
import { listarClases } from '../../services/claseService';
import '../../styles/AvailableClasses.css';

const monthFormatter = new Intl.DateTimeFormat('es-AR', { month: 'long' });

const getStartOfWeek = (date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

const getDayKey = (date) => {
  const weekDay = date.getDay();
  if (weekDay === 1) return 'monday';
  if (weekDay === 2) return 'tuesday';
  if (weekDay === 3) return 'wednesday';
  if (weekDay === 4) return 'thursday';
  if (weekDay === 5) return 'friday';
  return null;
};

const isWithinWeek = (date, weekStart, weekEnd) => date >= weekStart && date <= weekEnd;

const formatWeekLabel = (date) => {
  const weekStart = getStartOfWeek(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();
  const startMonth = monthFormatter.format(weekStart);
  const endMonth = monthFormatter.format(weekEnd);
  const startMonthLabel = startMonth.charAt(0).toUpperCase() + startMonth.slice(1);
  const endMonthLabel = endMonth.charAt(0).toUpperCase() + endMonth.slice(1);

  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${startDay} - ${endDay} ${startMonthLabel}`;
  }

  return `${startDay} ${startMonthLabel} - ${endDay} ${endMonthLabel}`;
};

function AvailableClassesView() {
  const mainRef = useRef(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [classesFromApi, setClassesFromApi] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [classesError, setClassesError] = useState('');

  const weekDate = useMemo(() => {
    const currentWeek = new Date();
    currentWeek.setDate(currentWeek.getDate() + weekOffset * 7);
    return currentWeek;
  }, [weekOffset]);

  const weekLabel = useMemo(() => formatWeekLabel(weekDate), [weekDate]);

  const weekStart = useMemo(() => getStartOfWeek(weekDate), [weekDate]);

  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }, [weekStart]);

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoadingClasses(true);
      setClassesError('');

      try {
        const response = await listarClases();
        setClassesFromApi(Array.isArray(response) ? response : []);
      } catch (error) {
        setClassesError(error.message || 'No se pudieron cargar las clases disponibles.');
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  const calendarClasses = useMemo(() => {
    return classesFromApi
      .map((item) => {
        if (!item?.fecha || typeof item.hora !== 'number') return null;

        const classDate = new Date(`${item.fecha}T00:00:00`);
        const day = getDayKey(classDate);

        if (!day) return null;
        if (!isWithinWeek(classDate, weekStart, weekEnd)) return null;
        if (item.hora < 8 || item.hora > 20) return null;

        return {
          id: item.idClase,
          day,
          hour: item.hora,
          activity: item.actividad,
        };
      })
      .filter(Boolean);
  }, [classesFromApi, weekStart, weekEnd]);

  return (
    <div className="available-classes-page" ref={mainRef}>
      <Navbar />
      <main>
        {isLoadingClasses && <p className="calendar-status">Cargando clases...</p>}
        {!isLoadingClasses && classesError && <p className="calendar-status calendar-status--error">{classesError}</p>}
        <AvailableClassesCalendar
          weekLabel={weekLabel}
          onPreviousWeek={() => setWeekOffset((current) => current - 1)}
          onNextWeek={() => setWeekOffset((current) => current + 1)}
          classes={calendarClasses}
        />
      </main>
    </div>
  );
}

export default AvailableClassesView;
