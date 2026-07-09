// Indexado por Date.getDay() (0 = domingo .. 6 = sábado).
export const WEEKDAY_LABELS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const WEEKDAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export const getDayKey = (date) => WEEKDAY_KEYS[date.getDay()];

export const buildWeekDays = (weekStart) => {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    return { key: getDayKey(date), label: WEEKDAY_LABELS[date.getDay()] };
  });
};
