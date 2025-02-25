import type { Ref } from 'vue'

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

export const formatDateToLongString = (date: Date) => {
  const parts = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).formatToParts(date)

  const year = parts.find((p) => p.type === 'year')?.value
  const month = parts.find((p) => p.type === 'month')?.value
  const day = parts.find((p) => p.type === 'day')?.value
  const weekday = parts.find((p) => p.type === 'weekday')?.value

  return `${year} ${month} ${day}, ${weekday}`
}

export function areObjectsEqual(obj1: any, obj2: any): boolean {
  if (typeof obj1 !== typeof obj2) return false

  if (typeof obj1 === 'object' && obj1 !== null && typeof obj2 === 'object' && obj2 !== null) {
    if (obj1 instanceof Date && obj2 instanceof Date) {
      return obj1.toISOString() === obj2.toISOString()
    }
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)
    if (keys1.length !== keys2.length) {
      return false
    }
    for (const key of keys1) {
      if (!areObjectsEqual(obj1[key], obj2[key])) {
        return false
      }
    }

    return true
  } else {
    return obj1 === obj2
  }
}

export const toggle = (value: Ref<boolean>) => {
  value.value = !value.value
}
