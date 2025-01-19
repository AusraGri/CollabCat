import type { TaskData } from "@server/shared/types";

export function filterTasksByDefaultType(filter: { title?: string; tasks: TaskData[] }): TaskData[] {
  if (!filter.title) {
    return filter.tasks
  } else if (filter.title === 'Routine') {
    return filter.tasks.filter((task: TaskData) :boolean => task.isRecurring === true)
  } else if (filter.title === 'Someday') {
    return filter.tasks.filter((task: TaskData): boolean => task.startDate === null)
  } else if (filter.title === 'Scheduled') {
    return filter.tasks.filter((task: TaskData): boolean => task.isRecurring === false && task.startDate !== null)
  } else if (filter.title === 'Not Assigned') {
    return filter.tasks.filter((task: TaskData): boolean => task.assignedUserId === null)
  }

  return filter.tasks
}


export function filterTasksByCategoryId(filter: { categoryId?: number; tasks: TaskData[] }): TaskData[] {
    if (filter.categoryId) {
      return filter.tasks.filter((task: TaskData) :boolean => task.categoryId === filter.categoryId)
    }
    return filter.tasks
  }

 export  function countTasksOfDefaultType (tasks: TaskData[], count: 'Routine' | 'Someday' | 'Scheduled' | 'Not Assigned'): number {
    return filterTasksByDefaultType({tasks, title: count}).length
}