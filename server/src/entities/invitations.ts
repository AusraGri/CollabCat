import { z } from 'zod'
import type { Invitations } from '@server/database/types'
import { type Selectable } from 'kysely'
import { idSchema } from './shared'
import { userSchema } from './user'

export const invitationSchema = z.object({
  createdAt: z.date(),
  email: z.string().email(),
  groupId: idSchema,
  id: idSchema,
  invitationToken: z.string(),
})

export const invitationDataSchema = z.object({
  invitation: invitationSchema,
  groupName: z.string(),
  groupOwner: userSchema.pick({
    username: true,
    email: true,
    picture: true,
    id: true,
  }),
})

export const createInvitationSchema = invitationSchema.omit({
  id: true,
  createdAt: true,
})

export const invitationsKeysAll = Object.keys(
  invitationSchema.shape
) as (keyof Invitations)[]

export type InvitationData = z.infer<typeof invitationDataSchema>
export type PublicInvitation = Selectable<Invitations>
export type InsertableInvitation = z.infer<typeof createInvitationSchema>
