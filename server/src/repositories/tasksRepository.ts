import type { Database } from '@server/database'
import type { Tasks } from '@server/database/types'
import {
  type TasksPublic,
  type TasksUpdateables,
  tasksKeysPublic,
} from '@server/entities/tasks'
import type { DeleteResult, Insertable, Updateable } from 'kysely'
import { sql } from 'kysely'

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

    async delete(taskId: number): Promise<DeleteResult> {
      return db
        .deleteFrom('tasks')
        .where('id', '=', taskId)
        .executeTakeFirstOrThrow()
    },

    async getTasksDue(date: Date): Promise<TasksPublic[]> {
      // not working
      return db
      .selectFrom('tasks as t')
      .selectAll()
      .innerJoin('recurringPattern as rp', 'rp.taskId', 't.id')
      .where((eb) =>
        eb.or([
          eb('t.startDate', '<=', date).and(
            eb.or([
              eb('t.endDate', '>=', date),
              eb('t.endDate', 'is', null),
            ])
          ),
        ])
      )
      .where((eb)=>eb.or([
          eb('rp.recurringTypeId', '=', 1)
      ]))
      .execute()
  }

  }
}

export type TasksRepository = ReturnType<typeof tasksRepository>
