import type { Database } from '@server/database'
import type { Groups, UserGroups } from '@server/database/types'
import {
  groupsKeysPublic,
  type GroupMember,
  type GroupsPublic,
} from '@server/entities/groups'
import { userKeysPublic, type UserPublic } from '@server/entities/user'
import {
  userGroupsKeysPublic,
  type UserGroupsPublic,
} from '@server/entities/userGroups'
import { jsonArrayFrom } from 'kysely/helpers/postgres'
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

// type GroupsUpdate = Omit<GroupsPublic, 'createdByUserId'>

export function groupsRepository(db: Database) {
  return {
    async createGroup(group: Insertable<Groups>): Promise<GroupsPublic> {
      return db.transaction().execute(async (trx) => {
        const newGroup = await trx
          .insertInto('groups')
          .values(group)
          .returning(groupsKeysPublic)
          .executeTakeFirstOrThrow()

        await trx
          .insertInto('userGroups')
          .values({
            groupId: newGroup.id,
            role: 'Admin',
            userId: group.createdByUserId,
          })
          .executeTakeFirstOrThrow()

        return newGroup
      })
    },
    async getGroup(options: GetGroupsOptions): Promise<GroupsPublic[] | GroupsPublic> {
      if (
        options.createdByUserId === undefined &&
        options.id === undefined &&
        options.userId === undefined
      )
        return []

      let query = db.selectFrom('groups').select(groupsKeysPublic)

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

    async deleteGroup(groupId: number): Promise<DeleteResult> {
      return db
        .deleteFrom('groups')
        .where('id', '=', groupId)
        .executeTakeFirst()
    },

    async getUserGroupsByUserId(userId: number): Promise<GroupsPublic[]> {
      return db
        .selectFrom('groups')
        .select(groupsKeysPublic)
        .innerJoin('userGroups', 'userGroups.groupId', 'groups.id')
        .where((eb) => eb.or([eb('userGroups.userId', '=', userId)]))
        .execute()
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

    async getGroupMembers(groupId: number): Promise<UserPublic[]> {
      return db
        .selectFrom('user')
        .select(userKeysPublic)
        .innerJoin('userGroups', 'user.id', 'userGroups.userId')
        .where('userGroups.groupId', '=', groupId)
        .execute()
    },

    async getUserGroupMembershipInfo(
      data: GroupUserData
    ): Promise<GroupMember> {
      return db
        .selectFrom('userGroups')
        .innerJoin('user', 'userGroups.userId', 'user.id')
        .leftJoin('points', (join) =>
          join
            .onRef('points.groupId', '=', 'userGroups.groupId')
            .onRef('points.userId', '=', 'userGroups.userId')
        )
        .select([
          'user.id',
          'user.username',
          'user.picture',
          'user.email',
          'userGroups.role',
          'points.points',
        ])
        .where('userGroups.groupId', '=', data.groupId)
        .where('userGroups.userId', '=', data.userId)
        .executeTakeFirstOrThrow()
    },
    async getGroupMembersAndRewards(groupId: number) {
      return db
        .selectFrom('groups')
        .select((eb) => [
          'groups.id',
          'groups.name',
          jsonArrayFrom(
            eb
              .selectFrom('rewards')
              .select([
                'rewards.groupId',
                'rewards.amount',
                'rewards.cost',
                'rewards.createdByUserId',
                'rewards.id',
                'rewards.targetUserIds',
                'rewards.title',
              ])
              .where('rewards.groupId', '=', groupId)
          ).as('rewards'),
          jsonArrayFrom(
            eb
              .selectFrom('userGroups')
              .innerJoin('user', 'user.id', 'userGroups.userId')
              .leftJoin('points', (join) =>
                join
                  .onRef('points.groupId', '=', 'userGroups.groupId')
                  .onRef('points.userId', '=', 'userGroups.userId')
              )
              .select([
                'user.email',
                'user.id',
                'user.picture',
                'user.username',
                'userGroups.role',
                'points.points',
              ])
              .where('userGroups.groupId', '=', groupId)
          ).as('members'),
        ])
        .where('groups.id', '=', groupId)
        .executeTakeFirst()
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

    async removeUserFromGroup(data: GroupUserData): Promise<DeleteResult> {
      return db
        .deleteFrom('userGroups')
        .where((eb) =>
          eb('userGroups.userId', '=', data.userId).and(
            'userGroups.groupId',
            '=',
            data.groupId
          )
        )
        .executeTakeFirst()
    },
  }
}

export type GroupRepository = ReturnType<typeof groupsRepository>
