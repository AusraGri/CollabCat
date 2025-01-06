export function stringToUrl(string: string) {
  return string.replace(' ', '')
}

export function timeToLocalTime(timeString: string, timestamptz: Date): string {
  const date = new Date(timestamptz)

  const [hours, minutes] = timeString.split(':').map(Number)
  date.setHours(hours, minutes, 0, 0)

  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  }

  const formatter = new Intl.DateTimeFormat(undefined, options)
  const formattedParts = formatter.formatToParts(date)
  const formattedTime = formattedParts
    .filter((part) => part.type === 'hour' || part.type === 'minute')
    .map((part) => part.value)
    .join(':')

  return formattedTime
}

export function formatDateToLocal(dateString: Date): string {
  const date = new Date(dateString)
  const isoString = date.toISOString()

  const formattedDate = isoString.split('T')[0]

  return formattedDate
}
