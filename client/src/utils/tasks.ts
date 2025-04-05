import type { TaskData } from '@server/shared/types'

export function filterTasksByDefaultType(filter: {
  title?: string
  tasks: TaskData[]
}): TaskData[] {
  if (!filter.title) {
    return filter.tasks
  } else if (filter.title === 'Routine') {
    return filter.tasks.filter((task: TaskData): boolean => task.isRecurring === true)
  } else if (filter.title === 'Someday') {
    return filter.tasks.filter(
      (task: TaskData): boolean => task.startDate === null && task.isCompleted === false
    )
  } else if (filter.title === 'Scheduled') {
    return filter.tasks.filter(
      (task: TaskData): boolean =>
        task.isRecurring === false && task.startDate !== null && task.isCompleted === false
    )
  } else if (filter.title === 'Not Assigned') {
    return filter.tasks.filter((task: TaskData): boolean => task.assignedUserId === null)
  }

  return filter.tasks
}

export function filterTasksByCategoryId(filter: {
  categoryId?: number
  tasks: TaskData[]
}): TaskData[] {
  if (filter.categoryId) {
    return filter.tasks.filter((task: TaskData): boolean => task.categoryId === filter.categoryId)
  }
  return filter.tasks
}


export function countTasksOfDefaultType(
  tasks: TaskData[],
  count: 'Routine' | 'Someday' | 'Scheduled' | 'Not Assigned'
): number {
  return filterTasksByDefaultType({ tasks, title: count }).length
}

/**
 * Sorts an array of tasks based on their completion status and start time.
 *
 * The sorting rules are:
 * 1. Incomplete tasks come before completed tasks.
 * 2. Among tasks with the same completion status:
 *    - If both have `startTime`, they are sorted lexicographically by `startTime`.
 *    - If only one has `startTime`, that one comes first.
 *    - If neither has `startTime`, their order remains unchanged.
 *
 * @param {TaskData[]} tasks - Array of task objects to be sorted. Each task should have a `completed` array and an optional `startTime` string.
 * @returns {TaskData[]} - A new array of tasks sorted based on the rules above.
 */
export const sortTasks = (tasks: TaskData[]): TaskData[] => {
  return tasks.sort((a, b) => {
    const aIsCompleted = a.completed.length > 0
    const bIsCompleted = b.completed.length > 0

    if (aIsCompleted && !bIsCompleted) return 1
    if (!aIsCompleted && bIsCompleted) return -1

    if (a.startTime && b.startTime) {
      return a.startTime.localeCompare(b.startTime)
    }

    if (a.startTime && !b.startTime) return -1
    if (!a.startTime && b.startTime) return 1

    return 0
  })
}

/**
 * Sorts an array of tasks based on their `isCompleted` status.
 *
 * The sorting rules are:
 * 1. Incomplete tasks (`isCompleted === false`) come before completed tasks (`isCompleted === true`).
 * 2. If both tasks have the same completion status, their relative order is preserved.
 *
 * @param {TaskData[]} tasks - Array of task objects to be sorted. Each task should have a boolean `isCompleted` property.
 * @returns {TaskData[]} - A new array of tasks sorted with incomplete tasks first.
 */
export const sortTasksByCompleted = (tasks: TaskData[]): TaskData[] => {
  return tasks.sort((a, b) => {
    const aIsCompleted = a.isCompleted
    const bIsCompleted = b.isCompleted

    if (aIsCompleted && !bIsCompleted) return 1
    if (!aIsCompleted && bIsCompleted) return -1

    return 0
  })
}

/**
 * Checks if a given weekly recurrence rule should be converted to a daily recurrence.
 *
 * A weekly recurrence is considered equivalent to a daily recurrence when:
 * - `recurringType` is `'weekly'`
 * - `separationCount` is `0`
 * - All 7 days of the week are included in `dayOfWeek`
 *
 * If all of the above are true, the function returns a modified recurrence object with:
 * - `recurringType` set to `'daily'`
 * - `separationCount` set to `0`
 *
 * Otherwise, it returns the original recurrence object unchanged.
 *
 * @param {TaskData['recurrence']} rec - The recurrence object to evaluate and potentially convert.
 * @returns {TaskData['recurrence']} - The updated (or original) recurrence object.
 */
export const checkRecurrence = (rec: TaskData['recurrence']): TaskData['recurrence'] => {
  const isConvertToDaily =
    rec?.recurringType === 'weekly' && rec.separationCount === 0 && rec.dayOfWeek?.length === 7

  if (isConvertToDaily) return { ...rec, recurringType: 'daily', separationCount: 0 }

  return rec
}
