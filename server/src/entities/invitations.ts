import { z } from 'zod'
import type { Invitations } from '@server/database/types'
import { idSchema } from './shared'

export const invitationSchema = z.object({
    createdAt: z.date(),
    email: z.string().email(),
    groupId: idSchema,
    id: idSchema,
    invitationToken: z.string()

})

export const createInvitationSchema = invitationSchema.omit({ id: true, createdAt: true })

export const invitationsKeysAll = Object.keys(invitationSchema.shape) as (keyof Invitations)[]

export type InsertableInvitation = z.infer<typeof createInvitationSchema>

