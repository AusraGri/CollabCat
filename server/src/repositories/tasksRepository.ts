import type { Database } from '@server/database'
import type { Tasks, CompletedTasks } from '@server/database/types'
import type { RecurrencePatternInsertable } from '@server/entities/recurrence'
import {
  type TasksPublic,
  type TaskUpdateData,
  type TaskData,
  tasksKeysPublic,
  taskCompletionKeysAll,
} from '@server/entities/tasks'
import { recurringPatternKeysAll } from '@server/entities/recurrence'
import type { DeleteResult, Insertable, Updateable, Selectable } from 'kysely'
import { jsonObjectFrom, jsonArrayFrom } from 'kysely/helpers/postgres'

export type SelectableCompletedTask = Selectable<CompletedTasks>

export interface GetTasksOptions {
  assignedUserId?: number
  categoryId?: number
  limit?: number
  createdByUserId?: number
  groupId?: number
  id?: number
}

export interface TaskUpdate {
  id: number
  task: Updateable<Tasks>
}

export interface TaskCompletionAdd {
  taskId: number
  instanceDate: Date
  completedBy: number
}

export type TaskCompletionRemove = Omit<TaskCompletionAdd, 'completedBy'>

export interface CreateTaskData {
  task: Insertable<Tasks>
  recurrence?: RecurrencePatternInsertable
}

export function tasksRepository(db: Database) {
  return {
    async create(task: Insertable<Tasks>): Promise<TasksPublic> {
      return db
        .insertInto('tasks')
        .values(task)
        .returning(tasksKeysPublic)
        .executeTakeFirstOrThrow()
    },
    async createTask(taskData: CreateTaskData): Promise<TasksPublic> {
      return db.transaction().execute(async (trx) => {
        if (taskData.task.isRecurring && !taskData.recurrence)
          throw new Error('Missing task data')

        const newTask = await trx
          .insertInto('tasks')
          .values(taskData.task)
          .returning(tasksKeysPublic)
          .executeTakeFirstOrThrow()

        if (newTask && taskData.recurrence) {
          try {
            await trx
              .insertInto('recurringPattern')
              .values({ ...taskData.recurrence, taskId: newTask.id })
              .executeTakeFirstOrThrow()
          } catch (error) {
            throw new Error(`Failed to save recurrence pattern: ${error}`)
          }
        }

        return newTask
      })
    },

    async getTasks(options: GetTasksOptions): Promise<TaskData[] | []> {
      let query = db
        .selectFrom('tasks')
        .select((eb) => [
          ...tasksKeysPublic,
          jsonObjectFrom(
            eb
              .selectFrom('recurringPattern')
              .select(recurringPatternKeysAll)
              .whereRef('tasks.id', '=', 'recurringPattern.taskId')
              .where('tasks.isRecurring', '=', true)
          ).as('recurrence'),
          jsonArrayFrom(
            eb
              .selectFrom('completedTasks')
              .select([
                'completedTasks.completedAt',
                'completedTasks.instanceDate',
                'completedTasks.id',
                'completedTasks.taskId',
                'completedTasks.completedBy',
              ])
              .whereRef('tasks.id', '=', 'completedTasks.taskId')
              .where('tasks.isRecurring', '=', true)
          ).as('completed'),
        ])

      const filters: Array<{
        column: keyof Tasks
        operator: string
        value: any
      }> = [
        {
          column: 'assignedUserId',
          operator: '=',
          value: options.assignedUserId,
        },
        { column: 'categoryId', operator: '=', value: options.categoryId },
        {
          column: 'createdByUserId',
          operator: '=',
          value: options.createdByUserId,
        },
        { column: 'groupId', operator: '=', value: options.groupId },
        { column: 'id', operator: '=', value: options.id },
      ]

      filters.forEach((filter) => {
        if (filter.value !== undefined) {
          query = query.where(
            filter.column,
            filter.operator as any,
            filter.value
          )
        }
      })

      if (options.limit !== undefined) {
        query = query.limit(options.limit)
      }

      return query.execute()
    },

    async updateTaskCompletion(taskData: {
      id: number
      isCompleted: boolean
    }): Promise<TasksPublic> {
      return db
        .updateTable('tasks')
        .set({
          isCompleted: taskData.isCompleted,
        })
        .where('id', '=', taskData.id)
        .returning(tasksKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async updateTask(taskData: TaskUpdateData): Promise<boolean> {
      try {
        return db.transaction().execute(async (trx) => {
          const { id, task, recurrence } = taskData
          if (task.isRecurring && !recurrence)
            throw new Error('Missing task data')

          if (!id || id <= 0) {
            throw new Error('Invalid task ID')
          }

          await trx
            .updateTable('tasks')
            .set(task)
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow()

          if (recurrence && task.isRecurring) {
            await trx
              .insertInto('recurringPattern')
              .values({ ...recurrence, taskId: id })
              .onConflict((oc) => oc.column('taskId').doUpdateSet(recurrence))
              .execute()
          }

          if (!task.isRecurring) {
            await trx
              .deleteFrom('recurringPattern')
              .where('taskId', '=', id)
              .executeTakeFirst()
          }

          return true
        })
      } catch (error) {
        throw new Error('Failed to update task. Please try again.')
      }
    },

    async addToCompletedTasks(
      taskData: TaskCompletionAdd
    ): Promise<SelectableCompletedTask> {
      return db
        .insertInto('completedTasks')
        .values(taskData)
        .returning(taskCompletionKeysAll)
        .executeTakeFirstOrThrow()
    },

    async removeCompletedTasks(
      taskData: TaskCompletionRemove
    ): Promise<DeleteResult> {
      return db
        .deleteFrom('completedTasks')
        .where('completedTasks.taskId', '=', taskData.taskId)
        .where('completedTasks.instanceDate', '=', taskData.instanceDate)
        .executeTakeFirstOrThrow()
    },

    async delete(taskId: number): Promise<DeleteResult> {
      return db
        .deleteFrom('tasks')
        .where('id', '=', taskId)
        .executeTakeFirstOrThrow()
    },

    async getTasksDue(date: Date, userId: number): Promise<TaskData[]> {
      const tasksToDate = await db
        .selectFrom('tasks as t')
        .select((eb) => [
          ...tasksKeysPublic,
          jsonObjectFrom(
            eb
              .selectFrom('recurringPattern as rp')
              .select(recurringPatternKeysAll)
              .whereRef('rp.taskId', '=', 't.id')
          ).as('recurrence'),
          jsonArrayFrom(
            eb
              .selectFrom('completedTasks as ct')
              .select([
                'ct.completedAt',
                'ct.completedBy',
                'ct.id',
                'ct.instanceDate',
                'ct.taskId',
              ])
              .whereRef('ct.taskId', '=', 't.id')
              .where('ct.instanceDate', '=', date)
          ).as('completed'),
        ])
        .where((eb) =>
          eb.or([
            eb('t.createdByUserId', '=', userId),
            eb('t.assignedUserId', '=', userId),
          ])
        )
        .where((eb) =>
          eb.or([
            eb('t.startDate', '<=', date).and(
              eb.or([eb('t.endDate', '>=', date), eb('t.endDate', 'is', null)])
            ),
          ])
        )
        .execute()

      return tasksToDate
    },
    async getPersonalTasksDue(date: Date, userId: number): Promise<TaskData[]> {
      const tasksToDate = await db
        .selectFrom('tasks as t')
        .select((eb) => [
          ...tasksKeysPublic,
          jsonObjectFrom(
            eb
              .selectFrom('recurringPattern as rp')
              .select(recurringPatternKeysAll)
              .whereRef('rp.taskId', '=', 't.id')
          ).as('recurrence'),
          jsonArrayFrom(
            eb
              .selectFrom('completedTasks as ct')
              .select([
                'ct.completedAt',
                'ct.completedBy',
                'ct.id',
                'ct.instanceDate',
                'ct.taskId',
              ])
              .whereRef('ct.taskId', '=', 't.id')
              .where('ct.instanceDate', '=', date)
          ).as('completed'),
        ])
        .where('t.createdByUserId', '=', userId)
        .where((eb) =>
          eb.or([
            eb('t.startDate', '<=', date).and(
              eb.or([eb('t.endDate', '>=', date), eb('t.endDate', 'is', null)])
            ),
          ])
        )
        .execute()

      return tasksToDate
    },
    async getGroupTasksDue(data: {
      date: Date
      userId?: number
      groupId: number
    }): Promise<TaskData[]> {
      let query = db
        .selectFrom('tasks as t')
        .select((eb) => [
          ...tasksKeysPublic,
          jsonObjectFrom(
            eb
              .selectFrom('recurringPattern as rp')
              .select(recurringPatternKeysAll)
              .whereRef('rp.taskId', '=', 't.id')
          ).as('recurrence'),
          jsonArrayFrom(
            eb
              .selectFrom('completedTasks as ct')
              .select([
                'ct.completedAt',
                'ct.completedBy',
                'ct.id',
                'ct.instanceDate',
                'ct.taskId',
              ])
              .whereRef('ct.taskId', '=', 't.id')
              .where('ct.instanceDate', '=', data.date)
          ).as('completed'),
        ])

      if (data.userId) {
        query = query.where((eb) =>
          eb.or([
            eb('t.createdByUserId', '=', data.userId as number),
            eb('t.assignedUserId', '=', data.userId as number),
          ])
        )
      }

      query = query
        .where('t.groupId', '=', data.groupId)
        .where((eb) =>
          eb.or([
            eb('t.startDate', '<=', data.date).and(
              eb.or([
                eb('t.endDate', '>=', data.date),
                eb('t.endDate', 'is', null),
              ])
            ),
          ])
        )

      return query.execute()
    },
  }
}

export type TasksRepository = ReturnType<typeof tasksRepository>
