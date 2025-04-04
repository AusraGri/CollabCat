import { z } from 'zod'
import type { Selectable, Insertable } from 'kysely'
import type { Categories } from '@server/database/types'
import { idSchema } from './shared'

export const categoriesSchema = z.object({
  createdByUserId: idSchema.nullable(),
  id: idSchema,
  isDefault: z.boolean(),
  title: z.string().trim().min(3).max(50),
  groupId: idSchema.nullable(),
})

export const publicCategorySchema = categoriesSchema.omit({isDefault: true})

export const insertCategorySchema = z.object({
  title: z.string().trim().min(3).max(50),
  groupId: idSchema.nullable().optional(),
})
export const categoriesKeysAll = Object.keys(
  categoriesSchema.shape
) as (keyof Categories)[]

export const categoriesKeysPublic = [
  'id',
  'title',
  'createdByUserId',
  'groupId',
] as const

export type CategoriesPublic = Pick<
  Selectable<Categories>,
  (typeof categoriesKeysPublic)[number]
>

export type InsertableCategory = Insertable<Categories>
