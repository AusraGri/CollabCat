import type { Database } from '@server/database'
import type { User } from '@server/database/types'
import { userKeysAll, userKeysPublic, type UserBaseInfo, type UserPublic } from '@server/entities/user'
import type { DeleteResult, Insertable, Selectable } from 'kysely'

export type UserUpdatables = {
  username?: string
  picture?: string
}

export function userRepository(db: Database) {
  return {
    async create(user: Insertable<User>): Promise<Selectable<User>> {
      return db
        .insertInto('user')
        .values(user)
        .returning(userKeysAll)
        .executeTakeFirstOrThrow()
    },

    async findByEmail(email: string): Promise<Selectable<User> | undefined> {
      const user = await db
        .selectFrom('user')
        .select(userKeysAll)
        .where('email', '=', email)
        .executeTakeFirst()

      return user
    },

    async findAssignedUsersByTaskId(
      taskId: number
    ): Promise<UserPublic| undefined> {
      const user = await db
        .selectFrom('tasks')
        .where('tasks.id', '=', taskId)
        .innerJoin('user', 'user.id', 'tasks.assignedUserId')
        .select(userKeysPublic)
        .executeTakeFirst()

      return user
    },

    async getAll(): Promise<Selectable<User>[] | undefined> {
      const user = await db.selectFrom('user').select(userKeysAll).execute()

      return user
    },

    async findByAuth0Id(
      auth0Id: string
    ): Promise<Selectable<User> | undefined> {
      const user = await db
        .selectFrom('user')
        .select(userKeysAll)
        .where('auth0Id', '=', auth0Id)
        .executeTakeFirst()

      return user
    },

    async findById(id: number): Promise<Selectable<User> | undefined> {
      const user = await db
        .selectFrom('user')
        .select(userKeysAll)
        .where('id', '=', id)
        .executeTakeFirst()

      return user
    },
    async findUserInfoById(id: number): Promise<UserBaseInfo> {
      return db
        .selectFrom('user')
        .leftJoin('points', 'points.userId', 'user.id')
        .select([
          'user.id',
          'user.username',
          'user.picture',
          'user.email',
          'points.points',
        ])
        .where('user.id', '=', id)
        .where('points.groupId', '=', null)
        .executeTakeFirstOrThrow()
    },

    async deleteUser(userId: number): Promise<DeleteResult> {
      const user = await db
        .deleteFrom('user')
        .where('id', '=', userId)
        .executeTakeFirstOrThrow()

      return user
    },

    async updateUser(
      userId: number,
      userData: UserUpdatables
    ): Promise<UserPublic> {
      const user = await db
        .updateTable('user')
        .set({ ...userData, updatedAt: new Date() })
        .where('id', '=', userId)
        .returning(userKeysPublic)
        .executeTakeFirstOrThrow()

      return user
    },
  }
}

export type UserRepository = ReturnType<typeof userRepository>
