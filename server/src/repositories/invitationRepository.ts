import type { Database } from '@server/database'
import type { Invitations } from '@server/database/types'
import { DeleteResult, type Selectable } from 'kysely'
import type { InsertableInvitation } from '@server/entities/invitations'
import { invitationsKeysAll } from '../entities/invitations'

type GroupInvitationData = {
  email: string
  groupId: number
}

export function invitationsRepository(db: Database) {
  return {
    async createInvitation(
      invitation: InsertableInvitation
    ): Promise<Selectable<Invitations>> {
      return db
        .insertInto('invitations')
        .values(invitation)
        .returning(invitationsKeysAll)
        .executeTakeFirstOrThrow()
    },

    async getInvitationByEmail(
      email: Invitations['email'],
    ): Promise<Selectable<Invitations>[]> {
      return db
        .selectFrom('invitations')
        .select(invitationsKeysAll)
        .where('email', '=', email)
        .execute()
    },

    async getInvitationByToken(
      token: string
    ): Promise<Selectable<Invitations> | undefined> {
      return db
        .selectFrom('invitations')
        .select(invitationsKeysAll)
        .where('invitationToken', '=', token)
        .executeTakeFirstOrThrow()
    },

    async getInvitationByGroupAndEmail(
      data: GroupInvitationData
    ): Promise<Selectable<Invitations> | undefined> {
      return db
        .selectFrom('invitations')
        .select(invitationsKeysAll)
        .where('email', '=', data.email)
        .where('groupId', '=', data.groupId)
        .executeTakeFirst()
    },

    async deleteInvitation(
      token: Invitations['invitationToken']
    ): Promise<DeleteResult> {
      return db
        .deleteFrom('invitations')
        .where('invitationToken', '=', token)
        .executeTakeFirstOrThrow()
    },
  }
}

export type InvitationsRepository = ReturnType<typeof invitationsRepository>
