import { z } from 'zod'
import type { Selectable } from 'kysely'
import type { User } from '@server/database/types'
import { idSchema } from './shared'

export const userSchema = z.object({
  id: idSchema,
  email: z.string().trim().toLowerCase().email(),
  username: z.string().min(1).max(500).nullable(),
  auth0Id: z.string(),
  createdAt: z.date(),
  provider: z.string(),
  updatedAt: z.date(),
  picture: z.string().nullable(),
})

export const userPublicSchema = userSchema.omit({
  auth0Id: true,
  createdAt: true,
  provider: true,
  updatedAt: true,
})

export const userBasicInfoSchema = userPublicSchema.extend({
  points: z.number().positive().nullable(),
})
export const userKeysAll = Object.keys(userSchema.shape) as (keyof User)[]

export const userKeysPublic = ['id', 'username', 'email', 'picture'] as const

export type UserPublic = Pick<Selectable<User>, (typeof userKeysPublic)[number]>

export type UserBaseInfo = z.infer<typeof userBasicInfoSchema>
export const authUserSchema = userSchema.pick({ id: true, email: true })
export const authUserEmail = userSchema.pick({ email: true })
export type AuthUser = z.infer<typeof authUserSchema>
export type AuthUserEmail = z.infer<typeof authUserEmail>
