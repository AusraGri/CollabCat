// import { authContext } from '@tests/utils/context'
// import { fakePattern, fakeTask, fakeUser } from '@server/entities/tests/fakes'
// import { createTestDatabase } from '@tests/utils/database'
// import { createCallerFactory } from '@server/trpc'
// import { wrapInRollbacks } from '@tests/utils/transactions'
// import { insertAll } from '@tests/utils/records'
// import tasksRouter from '..'
// import { TasksDue } from '@server/entities/tasks'
// import type { TasksRepository } from '@server/repositories/tasksRepository'

// const createCaller = createCallerFactory(tasksRouter)

// const task = 
//     fakeTask({
//         title: 'Task Two',
//         createdByUserId: 1,
//         assignedUserId: 2,
//         startDate: new Date(2024, 0, 1),
//         endDate: null,
//       })

// const pattern =  fakePattern({
//     taskId: task.id,
//     recurringType: 'Daily',
//     separationCount: 1,
//   })

// const repos = {
//     tasksRepository: {
//       getTasksDue: vi.fn(async () => [{...task, recurrence: pattern, completed: null}] as TasksDue[]),
//     } satisfies Partial<TasksRepository>
//   }

// const { getDueTasks } = createCaller({
//     authUser: { id: 1 },
//     repos,
//   } as any)

it.skip('should return a task for the given date', async () => {
  const date = new Date(2024, 0, 1)
  
    // When (ACT)
  const taskResponse = await getDueTasks(date)

  // Then (ASSERT)
  expect(taskResponse[0]).toMatchObject(task)
})

it.skip('should throw an error if the task does not exist', async () => {
  const nonExistantId = task.id + taskOther.id

  // When (ACT)
  await expect(get({id: nonExistantId})).rejects.toThrowError(/not found/i)
})
