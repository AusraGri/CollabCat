import type { Database } from '@server/database'
import type { Invitations } from '@server/database/types'
import {
  DeleteResult,
  type Selectable,
} from 'kysely'
import type { InsertableInvitation } from '@server/entities/invitations'
import { invitationsKeysAll } from '../entities/invitations'

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
      email: Invitations['email']
    ): Promise<Selectable<Invitations> | undefined> {
      return db
        .selectFrom('invitations')
        .select(invitationsKeysAll)
        .where('email', '=', email)
        .executeTakeFirstOrThrow()
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
