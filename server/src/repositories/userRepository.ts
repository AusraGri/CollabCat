import type { Database } from '@server/database'
import type { User } from '@server/database/types'
import {
  type UserPublic,
  userKeysAll,
  userKeysPublic,
} from '@server/entities/user'
import type { Insertable, Selectable } from 'kysely'

export function userRepository(db: Database) {
  return {
    async create(user: Insertable<User>): Promise<UserPublic> {
      return db
        .insertInto('user')
        .values(user)
        .returning(userKeysPublic)
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

    async getAll(): Promise<Selectable<User>[] | undefined> {
      const user = await db
        .selectFrom('user')
        .selectAll()
        .execute()

      return user
    },

    async findByAuth0Id(auth0Id: string): Promise<Selectable<User> | undefined> {
      const user = await db
        .selectFrom('user')
        .select(userKeysAll)
        .where('auth0Id', '=', auth0Id)
        .executeTakeFirst()

      return user
    },

    async findById(id: number[]): Promise<Selectable<User>[]> {
      const user = await db
        .selectFrom('user')
        .select(userKeysAll)
        .where('id', 'in', id)
        .execute()

      return user
    },
  }
}

export type UserRepository = ReturnType<typeof userRepository>
