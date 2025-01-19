import { z } from 'zod'
import type { Selectable, Insertable } from 'kysely'
import type { Groups } from '@server/database/types'
import { idSchema } from './shared'
import { rewardsSchemaOutput } from './rewards'

export const groupsSchema = z.object({
  createdAt: z.date(),
  createdByUserId: idSchema,
  id: idSchema,
  name: z.string().trim().min(3).max(50),
})

export const userGroupsSchema = z.object({
  groupId: idSchema,
  userId: idSchema,
  role: z.string().trim().min(3).max(50),
})

export const insertGroupSchema = groupsSchema.omit({
  createdByUserId: true,
  id: true,
  createdAt: true,
})

export const memberSchema = z.object({
  id: idSchema,
  email: z.string().email(),
  picture: z.string().nullable(),
  username: z.string().nullable(),
  role: z.string(),
  points: z.number().nullable(),
})
export const groupDataSchema = z.object({
  id: idSchema,
  name: z.string(),
  rewards: z.array(rewardsSchemaOutput).optional(),
  members: z.array(
    z.object({
      id: idSchema,
      email: z.string().email(),
      picture: z.string().nullable(),
      username: z.string().nullable(),
      role: z.string(),
      points: z.number().nullable(),
    })
  ),
})

// list keys that we will return to the client
export const groupsKeysAll = Object.keys(groupsSchema.shape) as (keyof Groups)[]

export const groupsKeysPublic = ['id', 'name', 'createdByUserId'] as const

export type GroupsPublic = Pick<
  Selectable<Groups>,
  (typeof groupsKeysPublic)[number]
>
export type GroupData = z.infer<typeof groupDataSchema>
export type ActiveGroup = Omit<GroupsPublic, 'createdByUserId'>
export type InsertableGroups = Insertable<Groups>
export type GroupMember = z.infer<typeof memberSchema>

export const authGroup = userGroupsSchema.omit({ userId: true })

export type AuthGroup = z.infer<typeof authGroup>
