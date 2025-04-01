import createApp from '@server/app'
import supertest from 'supertest'
import { createTestDatabase } from './utils/database'

const database = createTestDatabase()
const app = createApp(database)

afterAll(() => {
  database.destroy()
})

it('should return status 200 and a healthy database', async () => {
  const response = await supertest(app).get('/api/health');

  expect(response.status).toBe(200);

  expect(response.body).toEqual({
    status: 'OK',
    database: 'connected',
  });
});

it('should check TRPC health', async () => {
  const response = await supertest(app)
    .get('/api/v1/trpc/health.health')
    .send({})
    .expect(200)

  expect(response.body.result.data.json).toEqual({ status: 'ok' })
})