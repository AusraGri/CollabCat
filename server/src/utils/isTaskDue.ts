import type {TaskData } from '@server/entities/tasks'
import moment from 'moment'
import 'moment-recur-ts'

export default function isTaskDue(task: TaskData, date: Date): boolean {
  try {
    const givenDate = moment(date)
    const startDate = moment(task.startDate)
    const endDate = task.endDate
      ? moment(task.endDate)
      : moment(task.startDate).endOf('day')
    const recurrType = task.recurrence?.recurringType
    const separation = task.recurrence?.separationCount
      ? task.recurrence.separationCount + 1
      : 1
    const daysOfWeek = task.recurrence?.dayOfWeek

    if (daysOfWeek && !daysOfWeek.includes(givenDate.day())) {
      return false
    }

    let recurrenceRule

    if (!recurrType) {
      recurrenceRule = moment.recur({
        start: startDate,
        end: endDate,
      })
    } else if (recurrType && recurrType === 'daily') {
      recurrenceRule = moment()
        .recur({
          start: startDate,
          end: endDate,
        })
        .every(separation + 1)
        .days()
    } else if (recurrType && recurrType === 'weekly') {
      if (daysOfWeek) {
        const currentDay = givenDate.day()

        let firstOccurrence = moment(startDate)

        while (firstOccurrence.day() !== currentDay) {
          firstOccurrence = firstOccurrence.add(1, 'days')
        }

        recurrenceRule = moment()
          .recur({
            start: firstOccurrence,
            end: endDate,
          })
          .every(daysOfWeek)
          .daysOfWeek()
          .every(separation)
          .weeks()
      } else {
        recurrenceRule = moment()
          .recur({
            start: startDate,
            end: endDate,
          })
          .every(separation)
          .weeks()
      }
    }

    if (!recurrenceRule) {
      return false
    }

    const result = recurrenceRule.matches(givenDate)

    return result
  } catch {
    throw new Error('Failed to match recurrence')
  }
}
