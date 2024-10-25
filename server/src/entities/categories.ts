import { z } from 'zod'
import type { Selectable, Insertable } from 'kysely'
import type { Categories } from '@server/database/types'
import { idSchema } from './shared'

export const categoriesSchema = z.object({
    createdByUserId: idSchema,
    id: idSchema,
    isDefault: z.boolean(),
    title: z.string().trim().min(3).max(50)
})

export const categoriesKeysAll = Object.keys(categoriesSchema.shape) as (keyof Categories)[]

export const categoriesKeysPublic = ['id', 'title', 'createdByUserId'] as const

export type CategoriesPublic = Pick<Selectable<Categories>, (typeof categoriesKeysPublic)[number]>

export type InsertableGroups = Insertable<Categories>

