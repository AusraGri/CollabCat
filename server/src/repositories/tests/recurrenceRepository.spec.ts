import { createTestDatabase } from '@tests/utils/database'
import { fakeUser, fakeTask, fakePattern } from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import { recurrenceRepository } from '../recurrenceRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = recurrenceRepository(db)

const [userOne] = await insertAll(db, 'user', [fakeUser()])
const [taskOne] = await insertAll(db, 'tasks', [
  fakeTask({ createdByUserId: userOne.id }),
])

describe('create recurring pattern ', () => {
  it('should create recurring pattern', async () => {
    // Given
    const newPatternData = fakePattern({ taskId: taskOne.id })

    // When
    const result = await repository.createPattern(newPatternData)

    // Then
    expect(result).toEqual({
      ...newPatternData,
      dayOfWeek: null,
      maxNumOfOccurrences: null,
      weekOfMonth: null,
      monthOfYear: null,
      dayOfMonth: null,
    })
  })

  it('should throw error if task id invalid', async () => {
    // Given
    const newPatternData = fakePattern({ taskId: taskOne.id + 1 })

    // Then
    await expect(repository.createPattern(newPatternData)).rejects.toThrowError(
      /foreign key constraint/i
    )
  })

  it('should throw error if input invalid', async () => {
    // Given
    const newPatternData = fakePattern({ taskId: taskOne.id, anything: 'any' })

    // Then
    await expect(repository.createPattern(newPatternData)).rejects.toThrowError(
      /does not exist/i
    )
  })
})
