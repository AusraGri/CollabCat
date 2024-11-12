import type { Database } from '@server/database'
import type { Tasks, CompletedTasks } from '@server/database/types'
import {
  type TasksPublic,
  type TasksUpdateables,
  type TasksDue,
  tasksKeysPublic,
} from '@server/entities/tasks'
import type { DeleteResult, Insertable, Updateable, Selectable } from 'kysely'
import { jsonObjectFrom } from 'kysely/helpers/postgres'
import { sql } from 'kysely'

export type SelectableCompletedTask = Selectable<CompletedTasks>

export interface GetTasksOptions {
  assignedUserId?: number
  categoryId?: number
  limit?: number
  isCompleted?: boolean
  createdByUserId?: number
  deadline?: Date
  groupId?: number
  id?: number
  importance?: string
  title?: string
}

export interface TaskUpdate {
  id: number
  task: Updateable<TasksUpdateables>
}

export interface TaskCompletion {
  taskId: number
  instanceDate: Date
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

    async getTasks(options: GetTasksOptions): Promise<TasksPublic[] | []> {
      let query = db.selectFrom('tasks').selectAll()

      const filters: Array<{
        column: keyof Tasks
        operator: string
        value: any
        isString?: boolean
      }> = [
        {
          column: 'assignedUserId',
          operator: '=',
          value: options.assignedUserId,
        },
        { column: 'categoryId', operator: '=', value: options.categoryId },
        { column: 'isCompleted', operator: '=', value: options.isCompleted },
        {
          column: 'createdByUserId',
          operator: '=',
          value: options.createdByUserId,
        },
        { column: 'groupId', operator: '=', value: options.groupId },
        { column: 'id', operator: '=', value: options.id },
        { column: 'importance', operator: '=', value: options.importance },
        {
          column: 'title',
          operator: 'like',
          value: options.title ? `%${options.title.toLowerCase()}%` : undefined,
          isString: true,
        },
      ]

      filters.forEach((filter) => {
        if (filter.value !== undefined) {
          query = query.where(
            filter.isString
              ? sql`LOWER(${sql.ref(filter.column)})`
              : filter.column,
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

    async update(taskData: TaskUpdate): Promise<TasksPublic> {
      return db
        .updateTable('tasks')
        .set(taskData.task)
        .where('id', '=', taskData.id)
        .returning(tasksKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async addToCompletedTasks(
      taskData: TaskCompletion
    ): Promise<SelectableCompletedTask> {
      return db
        .insertInto('completedTasks')
        .values(taskData)
        .returningAll()
        .executeTakeFirstOrThrow()
    },

    async removeCompletedTasks(
      taskData: TaskCompletion
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

    async getTasksDue(date: Date, userId: number): Promise<TasksDue[]> {
      const tasksToDate = await db
        .selectFrom('tasks as t')
        .select((eb) => [
          't.id',
          't.title',
          't.description',
          't.createdByUserId',
          't.assignedUserId',
          't.categoryId',
          't.startDate',
          't.endDate',
          't.completedAt',
          't.groupId',
          't.parentTaskId',
          't.importance',
          't.isCompleted',
          't.points',
          't.startTime',
          't.endTime',
          't.isFullDayEvent',

          // Use jsonObjectFrom to structure the recurrence pattern as a nested object
          jsonObjectFrom(
            eb
              .selectFrom('recurringPattern as rp')
              .selectAll()
              .whereRef('rp.taskId', '=', 't.id')
          ).as('recurrence'),
          jsonObjectFrom(
            eb
              .selectFrom('completedTasks as ct')
              .selectAll()
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

      if (tasksToDate.length === 0) return []
      return tasksToDate as TasksDue[]
    },
  }
}

export type TasksRepository = ReturnType<typeof tasksRepository>
