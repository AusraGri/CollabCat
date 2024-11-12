import { fakeCompletedTask, fakeTask } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import type {
  SelectableCompletedTask,
  TasksRepository,
} from '@server/repositories/tasksRepository'
import type { TasksPublic } from '@server/entities/tasks'
import type { DeleteResult } from 'kysely'
import tasksRouter from '..'

const createCaller = createCallerFactory(tasksRouter)

it('should trow an error if task id is invalid', async () => {
  // When (ACT)
  const task = {
    id: 1,
    isCompleted: true,
    instanceDate: new Date().toISOString(),
  }
  const repos = {
    tasksRepository: {
      getTasks: vi.fn(async () => []),
    } satisfies Partial<TasksRepository>,
  }

  const { taskCompletion } = createCaller({
    authUser: { id: 1 },
    repos,
  } as any)

  // Then (ASSERT)
  await expect(taskCompletion(task)).rejects.toThrow(/not found/i)
})

it('should add task to completed', async () => {
  // When (ACT)
  const task = {
    id: 1,
    isCompleted: true,
    instanceDate: new Date(2024, 0, 1).toISOString(),
  }

  const repos = {
    tasksRepository: {
      getTasks: vi.fn(async () => [fakeTask({ id: 1 }) as TasksPublic]),
      addToCompletedTasks: vi.fn(
        async () => fakeCompletedTask({ taskId: 1 }) as SelectableCompletedTask
      ),
    } satisfies Partial<TasksRepository>,
  }

  const { taskCompletion } = createCaller({
    authUser: { id: 1 },
    repos,
  } as any)

  // Then (ASSERT)
  const completedTask = await taskCompletion(task)

  expect(completedTask).toBe(true)
})

it('should remove task from completed', async () => {
  // When (ACT)
  const task = {
    id: 1,
    isCompleted: false,
    instanceDate: new Date(2024, 0, 1).toISOString(),
  }

  const repos = {
    tasksRepository: {
      getTasks: vi.fn(async () => [fakeTask({ id: 1 }) as TasksPublic]),
      removeCompletedTasks: vi.fn(
        async () => ({ numDeletedRows: 1n }) as DeleteResult
      ),
    } satisfies Partial<TasksRepository>,
  }

  const { taskCompletion } = createCaller({
    authUser: { id: 1 },
    repos,
  } as any)

  // Then (ASSERT)
  const completedTask = await taskCompletion(task)

  expect(completedTask).toBe(true)
})
