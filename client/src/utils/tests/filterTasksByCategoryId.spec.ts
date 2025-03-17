import { describe, it, expect } from 'vitest'
import { filterTasksByCategoryId } from '../tasks'
import type { TaskData } from '@server/shared/types'

describe('filterTasksByCategoryId', () => {
  const tasks = [
    {
      id: 1,
      title: 'Task 1',
      categoryId: 1,
      isRecurring: true,
      isCompleted: false,
      startDate: null,
      assignedUserId: null,
    },
    {
      id: 2,
      title: 'Task 2',
      categoryId: 2,
      isRecurring: false,
      isCompleted: false,
      startDate: '2025-03-17T12:00:00Z',
      assignedUserId: 1,
    },
    {
      id: 3,
      title: 'Task 3',
      categoryId: 1,
      isRecurring: true,
      isCompleted: true,
      startDate: null,
      assignedUserId: 2,
    },
    {
      id: 4,
      title: 'Task 4',
      categoryId: 3,
      isRecurring: false,
      isCompleted: false,
      startDate: '2025-03-17T12:00:00Z',
      assignedUserId: null,
    },
    {
      id: 5,
      title: 'Task 5',
      categoryId: 1,
      isRecurring: false,
      isCompleted: false,
      startDate: null,
      assignedUserId: null,
    },
  ] as TaskData[]

  it('should return all tasks if no categoryId filter is provided', () => {
    const result = filterTasksByCategoryId({ tasks })
    expect(result).toEqual(tasks)
  })

  it('should filter tasks by a given categoryId', () => {
    const result = filterTasksByCategoryId({ categoryId: 1, tasks })
    expect(result).toEqual([
      {
        id: 1,
        title: 'Task 1',
        categoryId: 1,
        isRecurring: true,
        isCompleted: false,
        startDate: null,
        assignedUserId: null,
      },
      {
        id: 3,
        title: 'Task 3',
        categoryId: 1,
        isRecurring: true,
        isCompleted: true,
        startDate: null,
        assignedUserId: 2,
      },
      {
        id: 5,
        title: 'Task 5',
        categoryId: 1,
        isRecurring: false,
        isCompleted: false,
        startDate: null,
        assignedUserId: null,
      },
    ])
  })

  it('should return an empty array if no tasks match the given categoryId', () => {
    const result = filterTasksByCategoryId({ categoryId: 99, tasks })
    expect(result).toEqual([])
  })

  it('should return all tasks if categoryId is undefined and no filter is applied', () => {
    const result = filterTasksByCategoryId({ categoryId: undefined, tasks })
    expect(result).toEqual(tasks)
  })
})
