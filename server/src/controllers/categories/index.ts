import { router } from '@server/trpc'
import createCategory from './createCategory'
import getGroupCategories from './getGroupCategories'
import getUserCategories from './getUserCategories'

export default router({
    createCategory,
    getGroupCategories,
    getUserCategories
  
})
