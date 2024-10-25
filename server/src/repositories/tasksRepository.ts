import type { Database } from '@server/database'
import type { Tasks } from '@server/database/types'
import {
  type TasksPublic,
  tasksKeysPublic,
} from '@server/entities/tasks'
import type { Insertable} from 'kysely'

export interface GetTasksOptions {
  assignedUserId?: number
  categoryId?: number
  limit?: number
  completed?: boolean
  createdByUserId?: number
  deadline?: Date
  groupId?: number
  id?: number
  importance?: string
  title?: string
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

    async getTasks(
      options: GetTasksOptions
    ): Promise<TasksPublic[] | undefined> {
      let query = db.selectFrom('tasks').selectAll()

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
        { column: 'completed', operator: '=', value: options.completed },
        {
          column: 'createdByUserId',
          operator: '=',
          value: options.createdByUserId,
        },
        { column: 'deadline', operator: '=', value: options.deadline },
        { column: 'groupId', operator: '=', value: options.groupId },
        { column: 'id', operator: '=', value: options.id },
        { column: 'importance', operator: '=', value: options.importance },
        {
          column: 'title',
          operator: 'like',
          value: options.title ? `%${options.title}%` : undefined,
        },
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
  }
}

export type UserRepository = ReturnType<typeof tasksRepository>
