import { createTestDatabase } from '@tests/utils/database'
import { DeleteResult } from 'kysely'
import {
  fakeUser,
  fakeGroup,
  randomId,
  fakeCategory,
  fakeUserGroup,
} from '@server/entities/tests/fakes'
import { wrapInRollbacks } from '@tests/utils/transactions'
import { insertAll } from '@tests/utils/records'
import { categoriesRepository } from '../categoriesRepository'

const db = await wrapInRollbacks(createTestDatabase())
const repository = categoriesRepository(db)

const [userOne, userTwo] = await insertAll(db, 'user', [fakeUser(), fakeUser()])
const [groupOne, groupTwo] = await insertAll(db, 'groups', [
  fakeGroup({ createdByUserId: userOne.id }),
  fakeGroup({ createdByUserId: userTwo.id }),
])

await insertAll(db, 'userGroups', [
  fakeUserGroup({ groupId: groupOne.id, userId: userOne.id }),
  fakeUserGroup({ groupId: groupTwo.id, userId: userOne.id }),
])
const [categoryOne, categoryTwo, categoryThree, categoryFour, defaultCategory] =
  await insertAll(db, 'categories', [
    fakeCategory({ groupId: groupOne.id, createdByUserId: null }),
    fakeCategory({ createdByUserId: userOne.id, groupId: null }),
    fakeCategory({ createdByUserId: userOne.id, groupId: groupTwo.id }),
    fakeCategory({ createdByUserId: userTwo.id, groupId: groupOne.id }),
    fakeCategory({
      isDefault: true,
      createdByUserId: null,
      groupId: null,
    }),
  ])

describe('create category', () => {
  it('should create new category', async () => {
    // Given
    const title = 'New Category'

    // When
    const result = await repository.createCategory({ title })

    // Then
    expect(result).toEqual({
      id: expect.any(Number),
      title,
      groupId: null,
      isDefault: false,
      createdByUserId: null,
    })
  })

  it('should create new category for the group', async () => {
    // Given
    const newCategory = { title: 'New Category', groupId: groupTwo.id }

    // When
    const result = await repository.createCategory(newCategory)

    // Then
    expect(result).toEqual({
      ...newCategory,
      id: expect.any(Number),
      isDefault: false,
      createdByUserId: null,
    })
  })

  it('should throw error if failed to create new category for non existent group', async () => {
    // Given
    const newCategory = { title: 'New Category', groupId: randomId() }

    // Then
    await expect(repository.createCategory(newCategory)).rejects.toThrowError(
      /foreign key constraint/i
    )
  })

  it('should throw error if failed to create new category for non existent user', async () => {
    // Given
    const newCategory = { title: 'New Category', createdByUserId: randomId() }

    // Then
    await expect(repository.createCategory(newCategory)).rejects.toThrowError(
      /foreign key constraint/i
    )
  })
})

describe('get categories data', () => {
  it('should get categories by group id (including all defaults)', async () => {
    // Given
    const groupId = groupOne.id

    // When
    const result = await repository.getCategoriesByGroupId(groupId)

    // Then
    expect(result).toBeTruthy()
    expect(result).toContainEqual(categoryOne)
  })

  it('should get categories created by user id', async () => {
    // Given
    const userId = userOne.id

    // When
    const result = await repository.getCategoriesByUserId(userId)

    // Then
    expect(result).toHaveLength(2)
    expect(result).toEqual([categoryTwo, categoryThree])
  })

  it('should get personal categories created by user id (including defaults)', async () => {
    // Given
    const userId = userOne.id

    // When
    const result = await repository.getPersonalCategoriesByUserId(userId)

    // Then
    expect(result).toBeTruthy()
    expect(result).toEqual(
      expect.arrayContaining([categoryTwo, defaultCategory])
    )
  })

  it('should return only default categories if no personal user or group created categories found', async () => {
    // Given
    const userId = userOne.id + randomId()
    const groupId = groupOne.id + randomId()

    // When
    const result = await repository.getPersonalCategoriesByUserId(userId)
    const groupResult = await repository.getCategoriesByGroupId(groupId)

    // Then
    expect(result).toBeTruthy()
    expect(groupResult).toBeTruthy()
    expect(groupResult).toContainEqual(defaultCategory)
    expect(result).toContainEqual(defaultCategory)
  })

  it('should return all user related categories (including user group categories, but not defaults)', async () => {
    // Given
    const userId = userOne.id
    // When
    const result = await repository.getAllRelatedCategoriesByUserId(userId)

    // Then
    expect(result).toBeTruthy()
    expect(result.length).toBe(4)
    expect(result).toEqual(
      expect.arrayContaining([
        categoryOne,
        categoryTwo,
        categoryThree,
        categoryFour,
      ])
    )
  })

  it('should return no categories if no created categories found by user id', async () => {
    // Given
    const userId = userOne.id + randomId()

    // When
    const result = await repository.getCategoriesByUserId(userId)

    // Then
    expect(result).toHaveLength(0)
    expect(result).toEqual([])
  })
})

describe('delete category', () => {
  it('should delete category by category id', async () => {
    // Given
    const categoryId = categoryTwo.id

    // When
    const result = await repository.deleteCategory(categoryId)

    // Then
    expect(result).toBeInstanceOf(DeleteResult)
    expect(result.numDeletedRows).toBe(1n)
  })

  it('should not throw error if category id was not found', async () => {
    // Given
    const categoryId = categoryTwo.id + randomId()

    // When
    const result = await repository.deleteCategory(categoryId)

    // Then
    expect(result).toBeInstanceOf(DeleteResult)
    expect(result.numDeletedRows).toBe(0n)
  })
})
