import createApp from '@server/app'
import supertest from 'supertest'
import { createTestDatabase } from './utils/database'

const database = createTestDatabase()
const app = createApp(database)

afterAll(() => {
  database.destroy()
})

it('can launch the app', async () => {
  await supertest(app).get('/api/health').expect(200, 'OK')
})

it('should check TRPC health', async () => {
  const response = await supertest(app)
    .get('/api/v1/trpc/health.health')
    .send({})
    .expect(200)

  expect(response.body.result.data.json).toEqual({ status: 'ok' })
})