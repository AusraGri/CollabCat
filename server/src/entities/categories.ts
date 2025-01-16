import { z } from 'zod'
import type { Selectable, Insertable } from 'kysely'
import type { Categories } from '@server/database/types'
import { idSchema } from './shared'

export const categoriesSchema = z.object({
  createdByUserId: idSchema.nullable(),
  id: idSchema,
  isDefault: z.boolean(),
  isGroupDefault: z.boolean(),
  title: z.string().trim().min(3).max(50),
  groupId: idSchema.nullable()
})

export const insertCategorySchema = categoriesSchema.omit({id:true, createdByUserId: true, isDefault:true, isGroupDefault: true})
export const categoriesKeysAll = Object.keys(
  categoriesSchema.shape
) as (keyof Categories)[]

export const categoriesKeysPublic = ['id', 'title', 'createdByUserId', 'groupId', 'isDefault', 'isGroupDefault'] as const

export type CategoriesPublic = Pick<
  Selectable<Categories>,
  (typeof categoriesKeysPublic)[number]
>

export type InsertableCategory = Insertable<Categories>