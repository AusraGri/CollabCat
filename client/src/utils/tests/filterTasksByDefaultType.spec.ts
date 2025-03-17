import { describe, it, expect } from 'vitest'
import { filterTasksByDefaultType } from '../tasks'
import type { TaskData } from '@server/shared/types'

describe('filterTasksByDefaultType', () => {
  const tasks = [
    {
      id: 1,
      title: 'Task 1',
      isRecurring: true,
      isCompleted: false,
      startDate: null,
      assignedUserId: null,
    },
    {
      id: 2,
      title: 'Task 2',
      isRecurring: false,
      isCompleted: false,
      startDate: '2025-03-17T12:00:00Z',
      assignedUserId: 1,
    },
    {
      id: 3,
      title: 'Task 3',
      isRecurring: true,
      isCompleted: true,
      startDate: null,
      assignedUserId: 2,
    },
    {
      id: 4,
      title: 'Task 4',
      isRecurring: false,
      isCompleted: false,
      startDate: '2025-03-17T12:00:00Z',
      assignedUserId: null,
    },
    {
      id: 5,
      title: 'Task 5',
      isRecurring: false,
      isCompleted: false,
      startDate: null,
      assignedUserId: null,
    },
  ] as TaskData[]

  it('should return all tasks if no title filter is provided', () => {
    const result = filterTasksByDefaultType({ tasks })
    expect(result).toEqual(tasks)
  })

  it('should filter tasks by "Routine" type (isRecurring === true)', () => {
    const result = filterTasksByDefaultType({ title: 'Routine', tasks })
    expect(result).toEqual([
      {
        id: 1,
        title: 'Task 1',
        isRecurring: true,
        isCompleted: false,
        startDate: null,
        assignedUserId: null,
      },
      {
        id: 3,
        title: 'Task 3',
        isRecurring: true,
        isCompleted: true,
        startDate: null,
        assignedUserId: 2,
      },
    ])
  })

  it('should filter tasks by "Someday" type (startDate === null and isCompleted === false)', () => {
    const result = filterTasksByDefaultType({ title: 'Someday', tasks })
    expect(result).toEqual([
      {
        id: 1,
        title: 'Task 1',
        isRecurring: true,
        isCompleted: false,
        startDate: null,
        assignedUserId: null,
      },
      {
        id: 5,
        title: 'Task 5',
        isRecurring: false,
        isCompleted: false,
        startDate: null,
        assignedUserId: null,
      },
    ])
  })

  it('should filter tasks by "Scheduled" type (isRecurring === false, startDate !== null, isCompleted === false)', () => {
    const result = filterTasksByDefaultType({ title: 'Scheduled', tasks })
    expect(result).toEqual([
      {
        id: 2,
        title: 'Task 2',
        isRecurring: false,
        isCompleted: false,
        startDate: '2025-03-17T12:00:00Z',
        assignedUserId: 1,
      },
      {
        id: 4,
        title: 'Task 4',
        isRecurring: false,
        isCompleted: false,
        startDate: '2025-03-17T12:00:00Z',
        assignedUserId: null,
      },
    ])
  })

  it('should filter tasks by "Not Assigned" type (assignedUserId === null)', () => {
    const result = filterTasksByDefaultType({ title: 'Not Assigned', tasks })
    expect(result).toEqual([
      {
        id: 1,
        title: 'Task 1',
        isRecurring: true,
        isCompleted: false,
        startDate: null,
        assignedUserId: null,
      },
      {
        id: 4,
        title: 'Task 4',
        isRecurring: false,
        isCompleted: false,
        startDate: '2025-03-17T12:00:00Z',
        assignedUserId: null,
      },
      {
        id: 5,
        title: 'Task 5',
        isRecurring: false,
        isCompleted: false,
        startDate: null,
        assignedUserId: null,
      },
    ])
  })

  it('should return all tasks if the title does not match any filter type', () => {
    const result = filterTasksByDefaultType({ title: 'Unknown', tasks })
    expect(result).toEqual(tasks)
  })
})
