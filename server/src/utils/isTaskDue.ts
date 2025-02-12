import type { TaskData } from '@server/entities/tasks'

/**
 * Checks if a task is due on a given date.
 * @param {TaskData} task - The task object containing start date, recurrence, and end date.
 * @param {Date} date - The date to check against.
 * @returns {boolean} - Returns true if the task is due on the given date, otherwise false.
 * @throws {Error} - Throws an error if the check fails.
 */
export default function isTaskDue(task: TaskData, date: Date): boolean {
  try {
    if (!task || typeof task !== 'object') {
      throw new Error('Invalid task: Task must be a non-null object.')
    }

    if (!task.startDate || Number.isNaN(new Date(task.startDate).getTime())) {
      throw new Error(
        'Invalid task: startDate is required and must be a valid date.'
      )
    }

    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new Error('Invalid input: date must be a valid Date object.')
    }

    const { recurrence } = task
    const givenDate = new Date(new Date(date).setUTCHours(0, 0, 0, 0))
    const startDate = new Date(new Date(task.startDate).setUTCHours(0, 0, 0, 0))
    const endDate = task.endDate
      ? new Date(new Date(task.endDate).setUTCHours(23, 59, 59, 999))
      : new Date(new Date(givenDate).setUTCHours(23, 59, 59, 999))
    if (!recurrence) {
      return givenDate.getTime() === startDate.getTime()
    }

    if (givenDate < startDate || givenDate > endDate) {
      return false
    }

    const { recurringType, separationCount = 1, dayOfWeek } = recurrence
    const adjustedSeparation = separationCount + 1

    if (recurringType.toLowerCase() === 'daily') {
      if (adjustedSeparation === 1) return true

      const daysDiff = Math.floor(
        (givenDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      return daysDiff % adjustedSeparation === 0
    }

    if (recurringType.toLowerCase() === 'weekly') {
      const currentDay = givenDate.getDay()
      const startDay = startDate.getDay()
      let firstOccurrenceDate

      if (dayOfWeek) {
        if (!dayOfWeek.includes(currentDay)) return false

        firstOccurrenceDate = findFirstMatchingDayOccurrence(
          startDate,
          givenDate
        )
      } else {
        if (currentDay !== startDay) return false

        firstOccurrenceDate = startDate
      }

      const weeksDiff = Math.floor(
        (givenDate.getTime() - firstOccurrenceDate.getTime()) /
          (1000 * 60 * 60 * 24 * 7)
      )
      return weeksDiff % adjustedSeparation === 0
    }
    return false
  } catch (err) {
    throw new Error(`Failed to check is task due: ${err}`)
  }
}

/**
 * Finds the first occurrence of a matching day of the week from the start date to the given date.
 * @param {Date} startDate - The task's start date.
 * @param {Date} givenDate - The date to check.
 * @returns {Date} - The first matching occurrence of the given day of the week.
 */
export function findFirstMatchingDayOccurrence(
  startDate: Date,
  givenDate: Date
): Date {
  const givenDay = givenDate.getDay()
  let firstOccurrence = new Date(startDate)
  firstOccurrence.setUTCHours(0, 0, 0, 0)

  let startDay = firstOccurrence.getDay()

  if (givenDay === startDay) {
    return firstOccurrence
  }

  if (startDay !== givenDay) {
    do {
      firstOccurrence = addOneDay(firstOccurrence)
      startDay = firstOccurrence.getDay()
    } while (startDay !== givenDay)
  }

  return firstOccurrence
}

/**
 * Adds one day to a given date.
 * @param {Date} date - The date to increment.
 * @returns {Date} - The new date with one day added.
 */
export function addOneDay(date: Date): Date {
  const newDate = new Date(date)
  newDate.setDate(date.getDate() + 1)
  return newDate
}
