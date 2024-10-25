import { z } from 'zod'
import type { Selectable, Insertable } from 'kysely'
import type { Groups } from '@server/database/types'
import { idSchema } from './shared'

export const groupsSchema = z.object({
    createdAt: z.date(),
    createdByUserId: idSchema,
    id: idSchema,
    name: z.string().trim().min(3).max(50)
})

export const insertGroupSchema = groupsSchema.omit({createdByUserId: true, id: true, createdAt: true})

// list keys that we will return to the client
export const groupsKeysAll = Object.keys(groupsSchema.shape) as (keyof Groups)[]

export const groupsKeysPublic = ['id', 'name', 'createdByUserId'] as const

export type GroupsPublic = Pick<Selectable<Groups>, (typeof groupsKeysPublic)[number]>

export type InsertableGroups = Insertable<Groups>

