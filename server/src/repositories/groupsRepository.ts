import type { Database } from '@server/database'
import type { Groups, UserGroups } from '@server/database/types'
import { groupsKeysPublic, type GroupsPublic } from '@server/entities/groups'
import { userKeysPublic, type UserPublic } from '@server/entities/user'
import {
  userGroupsKeysPublic,
  type UserGroupsPublic,
} from '@server/entities/userGroups'
import { type DeleteResult, type Insertable } from 'kysely'

export interface GetGroupsOptions {
  createdByUserId?: number
  id?: number
  userId?: number
}

export interface GroupData {
  createdByUserId: number
  id: number
}

export interface GroupUserData {
  userId: number
  groupId: number
}

type GroupsUpdate = Omit<GroupsPublic, 'createdByUserId'>

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
        .values({
          groupId: newGroup.id,
          role: 'Admin',
          userId: group.createdByUserId,
        })
        .executeTakeFirstOrThrow()

      return newGroup
    },

    async get(options: GetGroupsOptions): Promise<GroupsPublic[]> {
      if (
        options.createdByUserId === undefined &&
        options.id === undefined &&
        options.userId === undefined
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

      if (options.userId !== undefined) {
        query = query
          .innerJoin('userGroups', 'userGroups.groupId', 'groups.id')
          .where('userGroups.userId', '=', options.userId)
      }

      return query.execute()
    },

    async delete(groupData: GroupData): Promise<DeleteResult> {
      return db
        .deleteFrom('groups')
        .where('id', '=', groupData.id)
        .where('createdByUserId', '=', groupData.createdByUserId)
        .executeTakeFirstOrThrow()
    },

    async updateName(groupData: GroupsUpdate): Promise<GroupsPublic> {
      return db
        .updateTable('groups')
        .set({ name: groupData.name })
        .where('id', '=', groupData.id)
        .returning(groupsKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async addGroupMember(
      groupData: Insertable<UserGroups>
    ): Promise<UserGroupsPublic> {
      return db
        .insertInto('userGroups')
        .values(groupData)
        .returning(userGroupsKeysPublic)
        .executeTakeFirstOrThrow()
    },

    async removeGroupMember(groupData: GroupUserData): Promise<DeleteResult> {
      return db
        .deleteFrom('userGroups')
        .where((eb) =>
          eb.and({ groupId: groupData.groupId, userId: groupData.userId })
        )
        .executeTakeFirstOrThrow()
    },

    async getGroupMembers(groupId: number): Promise<UserPublic[]> {
      return db
        .selectFrom('user')
        .select(userKeysPublic)
        .innerJoin('userGroups', 'user.id', 'userGroups.userId')
        .where('userGroups.groupId', '=', groupId)
        .execute()
    },

    async getRole(
      data: GroupUserData
    ): Promise<{ role: UserGroups['role'] } | undefined> {
      return db
        .selectFrom('userGroups')
        .select('role')
        .where((eb) =>
          eb('userGroups.userId', '=', data.userId).and(
            'userGroups.groupId',
            '=',
            data.groupId
          )
        )
        .executeTakeFirst()
    },

    async removeUser(data: GroupUserData): Promise<DeleteResult> {
      return db
        .deleteFrom('userGroups')
        .where((eb) =>
          eb('userGroups.userId', '=', data.userId).and(
            'userGroups.groupId',
            '=',
            data.groupId
          )
        )
        .executeTakeFirstOrThrow()
    },
  }
}

export type GroupRepository = ReturnType<typeof groupsRepository>
