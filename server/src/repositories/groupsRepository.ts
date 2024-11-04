import type { Database } from '@server/database'
import type { Groups, UserGroups } from '@server/database/types'
import { groupsKeysPublic, type GroupsPublic } from '@server/entities/groups'
import type { DeleteResult, Insertable } from 'kysely'

export interface GetGroupsOptions {
  createdByUserId?: number
  id?: number
  name?: string
}

export interface GroupData {
  createdByUserId: number
  id: number
}

export interface GroupUserData {
  userId: number
  groupId: number
}

export function groupsRepository(db: Database) {
  return {
    async create(group: Insertable<Groups>): Promise<GroupsPublic> {
      const newGroup = await db
        .insertInto('groups')
        .values(group)
        .returning(groupsKeysPublic)
        .executeTakeFirstOrThrow()

       await db
      .insertInto('userGroups')
      .values({groupId: newGroup.id, role: 'Admin', userId: group.createdByUserId })
      .executeTakeFirstOrThrow()

      return newGroup
    },

    async get(options: GetGroupsOptions): Promise<GroupsPublic[]> {
      if (
        options.createdByUserId === undefined &&
        options.id === undefined &&
        options.name === undefined
      )
        return []

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
        .where('id', '=', groupData.id)
        .where('createdByUserId', '=', groupData.createdByUserId)
        .executeTakeFirstOrThrow()
    },

    async getRole(data: GroupUserData): Promise<{ role: UserGroups['role'] }>{
      return db
      .selectFrom('userGroups')
      .select('role')
      .where((eb)=> eb('userGroups.userId', '=', data.userId).and('userGroups.groupId', '=', data.groupId))
      .executeTakeFirstOrThrow()
    },

    async removeUser(data: GroupUserData): Promise<DeleteResult>{
      return db
      .deleteFrom('userGroups')
      .where((eb)=> eb('userGroups.userId', '=', data.userId).and('userGroups.groupId', '=', data.groupId))
      .executeTakeFirstOrThrow()
    }
  }
}

export type GroupRepository = ReturnType<typeof groupsRepository>
