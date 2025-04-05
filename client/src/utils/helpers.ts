import type { Ref } from 'vue'
import { z } from 'zod'

/**
 * Converts a string into a URL-friendly slug.
 *
 * This function:
 * - Trims whitespace from the start and end
 * - Removes non-alphanumeric characters (except accented characters and spaces)
 * - Replaces spaces with hyphens
 * - Collapses multiple hyphens into one
 * - Removes leading and trailing hyphens
 *
 * Useful for creating slugs or readable URL paths from titles or labels.
 *
 * @param {string} string - The input string to convert.
 * @returns {string} - The cleaned, URL-safe slug string.
 */
export function stringToUrl(string: string): string {
  return string
    .trim()
    .replace(/[^a-zA-Z0-9À-ž\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function isEmailValid(email: string) {
  const emailSchema = z.string().email()
  const result = emailSchema.safeParse(email)

  return result.success
}

/**
 * Converts a time string (e.g. "13:30" or "24:00") to a local time string
 * based on a given timestamp with time zone (`timestamptz`).
 *
 * Useful when you want to apply a plain time (like from a form or task)
 * onto a specific date, and then format it using the local timezone offset.
 *
 * Notes:
 * - If `timeString` is `"24:00"`, it will be treated as `"00:00"` of the *next* day (but set to 00:00 on the same date here).
 * - Uses 24-hour format and includes the short timezone offset (like `+03:00`).
 *
 * @param {string} timeString - The time string in `"HH:mm"` format (24-hour).
 * @param {Date} timestamptz - The base date with timezone info to apply the time to.
 * @returns {string} - The formatted local time string (e.g. `"13:30"`).
 */
export function timeToLocalTime(timeString: string, timestamptz: Date): string {
  const date = new Date(timestamptz)
  const [hours, minutes] = timeString.split(':').map(Number)

  if (hours === 24) {
    date.setHours(0, minutes, 0, 0)
  } else {
    date.setHours(hours, minutes, 0, 0)
  }

  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    hourCycle: 'h23',
    timeZoneName: 'shortOffset',
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

/**
 * Performs a deep equality check between two values.
 *
 * Handles:
 * - Primitive values (compared with `===`)
 * - Nested objects and arrays
 * - `Date` objects (compared by their ISO string representation)
 *
 * Returns `false` if:
 * - Types are different
 * - Object keys mismatch in length or values are not deeply equal
 *
 * Note: This does not handle special cases like circular references or special objects (Map, Set, etc.)
 *
 * @param {*} obj1 - First value to compare.
 * @param {*} obj2 - Second value to compare.
 * @returns {boolean} - `true` if values are deeply equal, `false` otherwise.
 */
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
