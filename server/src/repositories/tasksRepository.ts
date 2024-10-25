import type { Database } from '@server/database'
import type { Tasks } from '@server/database/types'
import {
  type TasksPublic,
  tasksKeysAll,
  tasksKeysPublic,
} from '@server/entities/tasks'
import type { Insertable, Selectable } from 'kysely'


export interface GetTasksOptions {
    assignedUserId?: number
    categoryId?: number
    limit?: number
    comleted?: boolean
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

    async get (options: string): Promise<Selectable<Tasks> | undefined> {
        let query = db.selectFrom('tasks').selectAll()

        if (options.username !== undefined) {
          query = query.where('username', '=', options.username)
        }
    
        if (options.sprintCode !== undefined) {
          query = query.where('sprintCode', '=', options.sprintCode)
        }
    
        if (options.limit !== undefined && options.limit > 0) {
          query = query.limit(options.limit)
        }
    
        return query.execute()
    },
  }
}

export type UserRepository = ReturnType<typeof userRepository>
