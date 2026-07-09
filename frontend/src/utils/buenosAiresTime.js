export const BUENOS_AIRES_TIME_ZONE = 'America/Argentina/Buenos_Aires'

const dateTimeFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUENOS_AIRES_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23',
})

export const getBuenosAiresNowParts = () => {
  const parts = dateTimeFormatter.formatToParts(new Date()).reduce((accumulator, part) => {
    if (part.type !== 'literal') {
      accumulator[part.type] = part.value
    }

    return accumulator
  }, {})

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
  }
}

export const getBuenosAiresToday = () => getBuenosAiresNowParts().date

export const isClassInBuenosAiresCurrentHour = (fecha, hora) => {
  if (!fecha || typeof hora !== 'number') {
    return false
  }

  const current = getBuenosAiresNowParts()
  return fecha === current.date && hora === current.hour
}

export const isClassOnOrBeforeBuenosAiresNow = (fecha, hora) => {
  if (!fecha || typeof hora !== 'number') {
    return false
  }

  const current = getBuenosAiresNowParts()

  if (fecha < current.date) {
    return true
  }

  if (fecha > current.date) {
    return false
  }

  return hora <= current.hour
}