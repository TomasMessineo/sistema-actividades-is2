const getPasswordChangeSummary = (value) => {
  if (!value) {
    return 'No tenemos registro del último cambio de contraseña';
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'No tenemos registro del último cambio de contraseña';
  }

  const elapsedMilliseconds = Date.now() - parsedDate.getTime();
  const elapsedMinutes = Math.floor(elapsedMilliseconds / (1000 * 60));
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  const elapsedDays = Math.floor(elapsedHours / 24);
  const elapsedMonths = Math.floor(elapsedDays / 30);
  const elapsedYears = Math.floor(elapsedDays / 365);

  if (elapsedMinutes < 1) {
    return 'El ultimo cambio de contraseña fue hace menos de un minuto';
  }

  if (elapsedMinutes < 60) {
    return `El ultimo cambio de contraseña fue hace ${elapsedMinutes} minuto${elapsedMinutes === 1 ? '' : 's'}`;
  }

  if (elapsedHours < 24) {
    return `El ultimo cambio de contraseña fue hace ${elapsedHours} hora${elapsedHours === 1 ? '' : 's'}`;
  }

  if (elapsedDays < 30) {
    return `El ultimo cambio de contraseña fue hace ${elapsedDays} día${elapsedDays === 1 ? '' : 's'}`;
  }

  if (elapsedMonths < 12) {
    return `El ultimo cambio de contraseña fue hace ${elapsedMonths} mes${elapsedMonths === 1 ? '' : 'es'}`;
  }

  return `El ultimo cambio de contraseña fue hace ${elapsedYears} año${elapsedYears === 1 ? '' : 's'}`;
};

export default getPasswordChangeSummary;