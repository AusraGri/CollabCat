import { test, expect } from '@playwright/test'

test('Create new personal category, select category, delete category', async ({ page }) => {
  await page.goto('http://localhost:5174/')
  const newCategoryTitle = 'New Category'

  const tasksTab = page.getByTestId('Tasks-tab')
  const addCategoryTab = page.getByTestId('+ Category-tab')
  const createCategoryModalHeader = page.getByTestId('modal-header')
  const categoriesButton = page.getByTestId('select-category')
  const categoryTitleInput = page.getByTestId('category-title-input')
  const addCategoryButton = page.getByTestId('accept-button')
  const categorySelectButton = page.getByTestId('select-category-button')

  await test.step('create personal category', async () => {
    await tasksTab.click()

    await expect(addCategoryTab).toBeVisible()
    await expect(categoriesButton).not.toBeVisible()

    await addCategoryTab.click()

    await expect(createCategoryModalHeader).toBeVisible()
    await expect(createCategoryModalHeader).toHaveText('Create New Category')

    await expect(categoryTitleInput).toBeVisible()
    await expect(addCategoryButton).toBeDisabled()

    const placeholderText = await categoryTitleInput.getAttribute('placeholder')
    expect(placeholderText).toBe('enter category title')

    await categoryTitleInput.click()
    await categoryTitleInput.fill('er')
    await expect(addCategoryButton).toBeDisabled()

    await categoryTitleInput.fill(newCategoryTitle)

    await expect(addCategoryButton).toBeEnabled()

    await addCategoryButton.click()

    await expect(createCategoryModalHeader).not.toBeVisible()
    await expect(categoriesButton).toBeVisible()

    await expect(categoriesButton).toContainText('Categories')
  })

  await test.step('select personal category', async () => {
    const categorySelectButton = page.getByRole('button', { name: newCategoryTitle })

    await expect(categoriesButton).toBeVisible()

    await expect(categoriesButton).toContainText('Categories')

    await categoriesButton.click()

    await expect(categorySelectButton).toBeVisible()

    await categorySelectButton.click()
    await categoriesButton.click()

    await expect(categoriesButton).toContainText(newCategoryTitle)
  })

  await test.step('unselect personal category', async () => {
    await expect(categoriesButton).toBeVisible()

    await expect(categoriesButton).toContainText(newCategoryTitle)

    await categoriesButton.click()

    await expect(categorySelectButton).toBeVisible()
    await expect(categorySelectButton).toHaveText(newCategoryTitle)
    await categorySelectButton.click()
    await categoriesButton.click()

    await expect(categoriesButton).toContainText('Categories')
  })

  await test.step('delete personal category', async () => {
    const userMenu = page.getByTestId('user-menu-trigger')
    const userSettings = page.getByTestId('user-settings-button')
    const categoriesManageButton = page.getByTestId('manage-categories')
    const confirmationModal = page.getByRole('heading', { name: 'Please Confirm the Action' })
    const categoriesModalHeader = page.getByTestId('categories-modal-header')
    const saveChangesButton = page.getByTestId('save-changes')
    const categoryDeleteButton = page.getByTestId('delete-category-button')
    const categoryTitle = page.getByTestId('category-title')
    const confirmDeletionButton = page.getByTestId('accept-button')

    await expect(userMenu).toBeVisible()
    await expect(categoriesButton).toBeVisible()

    await userMenu.click()
    await expect(userSettings).toBeVisible()
    await userSettings.click()

    await expect(categoriesManageButton).toBeVisible()
    await categoriesManageButton.click()

    await expect(categoriesModalHeader).toBeVisible()
    await expect(categoriesModalHeader).toHaveText('Categories')
    await expect(categoryTitle).toBeVisible()
    await expect(categoryTitle).toHaveText(newCategoryTitle)
    await expect(categoryDeleteButton).toBeVisible()

    categoryDeleteButton.click()

    await expect(confirmationModal).toBeVisible()
    await expect(confirmDeletionButton).toBeVisible()

    await confirmDeletionButton.click()

    await expect(confirmationModal).not.toBeVisible()
    await expect(categoriesModalHeader).not.toBeVisible()
    await expect(saveChangesButton).toBeVisible()

    await saveChangesButton.click()

    await expect(categoriesButton).not.toBeVisible()
  })
})
