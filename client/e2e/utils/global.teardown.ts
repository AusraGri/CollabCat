import { test as teardown } from '@playwright/test'
import { getTrpcClient } from './config'

teardown('delete test user data', async () => {
  console.log(`🧹 Cleaning up test data for test user `)

  try {
    const trpc = await getTrpcClient()
    await trpc.user.deleteUser.mutate()

    console.log('✅ Test data cleanup done')
  } catch (err) {
    console.error('❌ Error cleaning up test data:', err)
  }
})
