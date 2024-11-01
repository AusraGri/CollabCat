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

export function tasksRepositoryTest(db: Database) {
  return {
    async getTasksDue(date: Date): Promise<TasksPublic[]> {
      const dayOfWeek = date.getDay()
      const dayOfMonth = date.getDate()
      const monthOfYear = date.getMonth()
      const weekOfMonth = Math.ceil(dayOfMonth / 7)

      return db
        .selectFrom('tasks as t')
        .selectAll()
        .innerJoin('recurringPattern as rp', 'rp.taskId', 't.id')
        .where((eb) =>
          eb.or([
            eb('t.startDate', '<=', date).and(
              eb.or([eb('t.endDate', '>=', date), eb('t.endDate', 'is', null)])
            ),
          ])
        )
        .where((eb) => eb.or([eb('rp.recurringTypeId', '=', 1)]))
        .execute()
    },
  }
}

export type TasksRepositoryTest = ReturnType<typeof tasksRepositoryTest>
