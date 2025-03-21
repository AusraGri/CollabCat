import { describe, it, expect } from 'vitest'
import { sortTasks } from '../tasks'
import type { TaskData } from '@server/shared/types'

describe('sortTasks', () => {
  const tasks = [
    {
      id: 1,
      title: 'Task 1',
      startTime: '14:00',
      completed: [],
      startDate: null,
      assignedUserId: null,
    },
    {
      id: 2,
      title: 'Task 2',
      startTime: '10:00',
      completed: [],
      startDate: null,
      assignedUserId: null,
    },
    {
      id: 3,
      title: 'Task 3',
      startTime: '12:00',
      completed: [],
      startDate: null,
      assignedUserId: null,
    },
    {
      id: 4,
      title: 'Task 4',
      startTime: null,
      completed: ['someCompletion'],
      startDate: null,
      assignedUserId: null,
    },
    {
      id: 5,
      title: 'Task 5',
      startTime: null,
      completed: [],
      startDate: null,
      assignedUserId: null,
    },
    {
      id: 6,
      title: 'Task 6',
      startTime: '09:00',
      completed: ['someCompletion'],
      startDate: null,
      assignedUserId: null,
    },
  ] as unknown as TaskData[]

  it('should place completed tasks after incomplete ones', () => {
    const result = sortTasks(tasks)

    expect(result[0].id).toBe(2)
    expect(result[1].id).toBe(3)
    expect(result[2].id).toBe(1)
    expect(result[3].id).toBe(5)
    expect(result[4].id).toBe(6)
    expect(result[5].id).toBe(4)
  })

  it('should sort tasks by start time when they are not completed', () => {
    const incompleteTasks = tasks.filter((task) => task.completed.length === 0)
    const result = sortTasks(incompleteTasks)

    expect(result[0].id).toBe(2)
    expect(result[1].id).toBe(3)
    expect(result[2].id).toBe(1)
  })

  it('should place tasks with no start time after those with a start time', () => {
    const result = sortTasks(tasks)

    expect(result[0].id).toBe(2)
    expect(result[1].id).toBe(3)
    expect(result[2].id).toBe(1)
    expect(result[3].id).toBe(5)
    expect(result[4].id).toBe(6)
    expect(result[5].id).toBe(4)
  })

  it('should not change the order of tasks that are all completed', () => {
    const completedTasks = [
      {
        id: 7,
        title: 'Task 7',
        startTime: '08:00',
        completed: ['someCompletion'],
        startDate: null,
        assignedUserId: null,
      },
      {
        id: 8,
        title: 'Task 8',
        startTime: '12:00',
        completed: ['someCompletion'],
        startDate: null,
        assignedUserId: null,
      },
    ] as unknown as TaskData[]
    const result = sortTasks(completedTasks)
    expect(result[0].id).toBe(7)
    expect(result[1].id).toBe(8)
  })

  it('should handle an empty task array', () => {
    const result = sortTasks([])
    expect(result).toEqual([])
  })
})
