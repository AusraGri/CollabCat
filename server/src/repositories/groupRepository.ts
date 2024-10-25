import type { Database } from '@server/database'
import type { Groups } from '@server/database/types'
import { groupsKeysPublic, type GroupsPublic } from '@server/entities/groups'
import type { DeleteResult, Insertable} from 'kysely'

export interface GetGroupsOptions {
  createdByUserId?: number
  id?: number
  name?: string
}

export interface GroupData {
    createdByUserId: number
    id: number
}

export function groupsRepository(db: Database) {
  return {
    async create(group: Insertable<Groups>): Promise<GroupsPublic> {
      return db
        .insertInto('groups')
        .values(group)
        .returning(groupsKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async get(
      options: GetGroupsOptions
    ): Promise<GroupsPublic[] | undefined> {
      let query = db.selectFrom('groups').selectAll()

      const filters: Array<{
        column: keyof Groups
        operator: string
        value: any
      }> = [
        {
          column: 'createdByUserId',
          operator: '=',
          value: options.createdByUserId,
        },
        { column: 'id', operator: '=', value: options.id },
        {
          column: 'name',
          operator: 'like',
          value: options.name ? `%${options.name}%` : undefined,
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

      return query.execute()
    },

    async delete(groupData: GroupData): Promise<DeleteResult> {
        return db
          .deleteFrom('groups')
          .where('id',  '=', groupData.id )
          .where('createdByUserId', '=', groupData.createdByUserId)
          .executeTakeFirstOrThrow()
      },
  }
}

export type GroupRepository = ReturnType<typeof groupsRepository>
