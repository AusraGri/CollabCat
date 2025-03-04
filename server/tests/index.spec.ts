import type { Mock } from 'vitest'
import createApp from '../src/app'
import { createDatabase } from '../src/database'
import config from '../src/config'

vi.mock('../src/database', () => ({
  createDatabase: vi.fn(() => ({})),
}))

vi.mock('../src/app', () => ({
  default: vi.fn(() => ({ listen: vi.fn() })),
}))

const mockedCreateDatabase = createDatabase as Mock
const mockedCreateApp = createApp as Mock
describe('Server Initialization', () => {
  it('should create the database with the correct configuration', async () => {
    const mockDatabase = {}
    mockedCreateDatabase.mockReturnValue(mockDatabase)
    const environment = config.env
    const database = environment === 'test' ? config.testDatabase : config.database


    await import('../src')

    expect(mockedCreateDatabase).toHaveBeenCalledWith(database)
  })

  it('should create the app with the correct database instance', async () => {
    const mockApp = {}
    mockedCreateApp.mockReturnValue(mockApp)

    await import('../src')

    expect(mockedCreateApp).toHaveBeenCalledWith(expect.anything())
  })

})
