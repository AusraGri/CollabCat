import { fakeCompletedTask, fakeTask } from '@server/entities/tests/fakes'
import { createCallerFactory } from '@server/trpc'
import type {
  SelectableCompletedTask,
  TasksRepository,
} from '@server/repositories/tasksRepository'
import type { TaskData } from '@server/entities/tasks'
import type { DeleteResult } from 'kysely'
import { authRepoContext } from '@tests/utils/context'
import tasksRouter from '..'

const createCaller = createCallerFactory(tasksRouter)

it('should trow an error if task id is invalid', async () => {
  // When (ACT)
  const task = {
    id: 11,
    isCompleted: true,
    instanceDate: new Date(),
  }
  const repos = {
    tasksRepository: {
      getTasks: vi.fn(async () => []),
    } satisfies Partial<TasksRepository>,
  }

  const { taskCompletion } = createCaller(authRepoContext(repos))

  // Then (ASSERT)
  await expect(taskCompletion(task)).rejects.toThrow(/not found/i)

  expect(repos.tasksRepository.getTasks).toBeCalled()
})

it('should mark task as completed', async () => {
  // When (ACT)
  const task = {
    id: 1,
    isCompleted: true,
    instanceDate: new Date(2024, 0, 1),
  }

  const repos = {
    tasksRepository: {
      getTasks: vi.fn(async () => [fakeTask({ id: 1 })] as TaskData[]),
      addToCompletedTasks: vi.fn(
        async () => fakeCompletedTask({ taskId: 1 }) as SelectableCompletedTask
      ),
      updateTaskCompletion: vi.fn(async () => 'data' as any),
    } satisfies Partial<TasksRepository>,
  }

  const { taskCompletion } = createCaller(authRepoContext(repos))

  // Then (ASSERT)
  const completedTask = await taskCompletion(task)
  expect(repos.tasksRepository.getTasks).toBeCalled()
  expect(repos.tasksRepository.addToCompletedTasks).not.toBeCalled()
  expect(repos.tasksRepository.updateTaskCompletion).toBeCalled()
  expect(completedTask).toBe(true)
})
it('should add task to completed tasks when task is recurring', async () => {
  // When (ACT)
  const task = {
    id: 1,
    isCompleted: true,
    instanceDate: new Date(2024, 0, 1),
  }

  const repos = {
    tasksRepository: {
      getTasks: vi.fn(
        async () => [fakeTask({ id: 1, isRecurring: true })] as TaskData[]
      ),
      addToCompletedTasks: vi.fn(
        async () => fakeCompletedTask({ taskId: 1 }) as SelectableCompletedTask
      ),
      removeCompletedTasks: vi.fn(
        async () => ({ numDeletedRows: 1n }) as DeleteResult
      ),
      updateTaskCompletion: vi.fn(async () => 'data' as any),
    } satisfies Partial<TasksRepository>,
  }

  const { taskCompletion } = createCaller(authRepoContext(repos))

  // Then (ASSERT)
  const completedTask = await taskCompletion(task)
  expect(repos.tasksRepository.getTasks).toBeCalled()
  expect(repos.tasksRepository.removeCompletedTasks).not.toBeCalled()
  expect(repos.tasksRepository.addToCompletedTasks).toBeCalled()
  expect(repos.tasksRepository.updateTaskCompletion).not.toBeCalled()
  expect(completedTask).toBe(true)
})

it('should remove task from completed', async () => {
  // When (ACT)
  const task = {
    id: 1,
    isCompleted: false,
    instanceDate: new Date(2024, 0, 1),
  }

  const repos = {
    tasksRepository: {
      getTasks: vi.fn(async () => [
        fakeTask({ id: 1, isRecurring: true }) as TaskData,
      ]),
      removeCompletedTasks: vi.fn(
        async () => ({ numDeletedRows: 1n }) as DeleteResult
      ),
      addToCompletedTasks: vi.fn(
        async () => fakeCompletedTask({ taskId: 1 }) as SelectableCompletedTask
      ),
      updateTaskCompletion: vi.fn(async () => 'data' as any),
    } satisfies Partial<TasksRepository>,
  }

  const { taskCompletion } = createCaller(authRepoContext(repos))

  // Then (ASSERT)
  const completedTask = await taskCompletion(task)
  expect(repos.tasksRepository.getTasks).toBeCalled()
  expect(repos.tasksRepository.removeCompletedTasks).toBeCalled()
  expect(repos.tasksRepository.addToCompletedTasks).not.toBeCalled()
  expect(repos.tasksRepository.updateTaskCompletion).not.toBeCalled()

  expect(completedTask).toBe(true)
})
