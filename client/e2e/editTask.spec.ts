import { test, expect } from '@playwright/test'

test('Edit task', async ({ page }) => {
  await page.goto('http://localhost:5174/')
  const newCategoryTitle = 'Category for Editing'
  const newTaskTitle = 'New Task'
  const updatedTaskTitle = 'Updated Task Title'

  const taskEditInfoModal = page.getByTestId('task-edit-info')
  const tasksTab = page.getByTestId('Tasks-tab')
  const categorySelectButton = page.getByRole('button', { name: newCategoryTitle })

  const addCategoryTab = page.getByTestId('+ Category-tab')
  const createCategoryModalHeader = page.getByTestId('modal-header')
  const categoriesButton = page.getByTestId('select-category')
  const categoryTitleInput = page.getByTestId('category-title-input')
  const addCategoryButton = page.getByTestId('accept-button')
  const declineCategoryButton = page.getByTestId('decline-button')
  await tasksTab.click()

  const task = page.getByTestId(newTaskTitle.replace(' ', '-'))
  const updatedTask = page.getByTestId(updatedTaskTitle.replace(' ', '-'))
  const saveTaskChangesButton = page.getByTestId('save-task-changes')
  const isCategory = await categoriesButton.isVisible()

  await test.step('create task without date', async () => {
    const addTask = page.getByTestId('+ Task-tab')
    const newTaskModalTitle = page.getByTestId('new-task-modal-title')
    await addTask.click()
    await expect(newTaskModalTitle).toBeVisible()

    const taskTitle = page.getByTestId('task-title-input')
    const addTaskButton = page.getByTestId('add-task-button')

    await expect(taskTitle).toBeVisible()
    await expect(addTaskButton).toBeDisabled()

    await taskTitle.click()
    await taskTitle.fill(newTaskTitle)

    await expect(addTaskButton).toBeEnabled()
    await addTaskButton.click()
    await expect(newTaskModalTitle).not.toBeVisible()
    await expect(task).toBeVisible()
  })

  if (!isCategory) {
    await test.step('create category', async () => {
      await expect(addCategoryTab).toBeVisible()
      await expect(categoriesButton).not.toBeVisible()

      await addCategoryTab.click()

      await expect(createCategoryModalHeader).toBeVisible()
      await expect(createCategoryModalHeader).toHaveText('Create New Category')

      await expect(categoryTitleInput).toBeVisible()
      await expect(addCategoryButton).toBeDisabled()
      await expect(declineCategoryButton).toBeVisible()

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
      await categoriesButton.click()
      await expect(categorySelectButton).toBeVisible()
    })
  }

  await test.step('edit task title', async () => {
    const taskTitleInput = page.getByTestId('edit-task-title')
    const editTaskTitle = page.getByTestId('edit-title')
    await expect(task).toBeVisible()

    await task.click()

    await expect(saveTaskChangesButton).not.toBeVisible()
    await expect(editTaskTitle).toBeVisible()
    await editTaskTitle.click()

    await expect(taskTitleInput).toBeVisible()
    await expect(taskTitleInput).toHaveValue(newTaskTitle)
    await taskTitleInput.fill(updatedTaskTitle)
    await page.keyboard.press('Enter')

    await expect(saveTaskChangesButton).toBeVisible()

    await saveTaskChangesButton.click()

    await expect(updatedTask).toBeVisible()
    await expect(task).not.toBeVisible()
  })

  await test.step('edit task category', async () => {
    await expect(updatedTask).toBeVisible()
    await updatedTask.click()

    await expect(taskEditInfoModal).toBeVisible()

    const taskCategoryEdit = taskEditInfoModal.getByTestId('edit-category')
    const taskCategory = taskEditInfoModal.getByTestId('task-category')
    const categorySelect = taskEditInfoModal.getByTestId('select-category')
    const categorySelection = taskEditInfoModal.getByTestId('category-selection')

    await expect(taskCategory).toHaveText(/uncategorized/i)
    await expect(taskCategoryEdit).toBeVisible()
    await expect(categorySelection).not.toBeVisible()

    await taskCategoryEdit.click()
    await expect(categorySelect).toBeVisible()

    await categorySelect.click()
    await expect(categorySelection).toBeVisible()
    await categorySelection.click()

    const select = page.locator('#category-select select')
    await select.selectOption({ label: newCategoryTitle })

    await expect(select.locator('option:checked')).toHaveText(newCategoryTitle)

    await expect(saveTaskChangesButton).toBeVisible()
    await saveTaskChangesButton.click()

    await expect(updatedTask).toBeVisible()

    await expect(updatedTask.getByTestId('task-category')).toContainText(newCategoryTitle)
  })

  await test.step('edit task points', async () => {
    const points = '10'
    await expect(updatedTask).toBeVisible()
    await updatedTask.click()

    await expect(taskEditInfoModal).toBeVisible()

    const taskPoints = taskEditInfoModal.getByTestId('task-points-edit')
    const taskPointsInput = taskEditInfoModal.getByTestId('task-points-input')

    await expect(taskPoints).toBeVisible()
    await expect(taskPoints).toContainText(/add points/i)

    await taskPoints.click()

    await expect(taskPointsInput).toBeVisible()
    await taskPointsInput.fill(points)
    await page.keyboard.press('Enter')

    const regex = new RegExp(`task points:\\s*${points}`, 'i')

    await expect(taskPoints).toContainText(regex)

    await expect(saveTaskChangesButton).toBeVisible()
    await saveTaskChangesButton.click()

    await expect(updatedTask).toBeVisible()

    await expect(updatedTask.getByTestId('task-points')).toBeVisible()
    await expect(updatedTask.getByTestId('task-points')).toHaveText(points)
  })

  await test.step('edit task date and time', async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const now = new Date()
    const expectedHour = now.getHours().toString().padStart(2, '0')

    await expect(updatedTask).toBeVisible()
    await updatedTask.click()
    await expect(taskEditInfoModal).toBeVisible()

    const taskDateAndTime = taskEditInfoModal.getByTestId('task-date-time-edit')
    await expect(taskDateAndTime).toContainText(/not scheduled/i)

    await taskDateAndTime.click()

    const editDateModal = page.locator('#dateModalTitle')

    await expect(editDateModal).toHaveText(/edit date/i)

    const dateInput = page.locator('[data-test-id="dp-input"]')
    const timeCheckbox = page.getByRole('checkbox', {
      name: 'Task Time',
    })
    const taskTimeInput = page.getByTestId('start-time-picker')
    const saveButton = page.getByTestId('save-button')

    await expect(dateInput).toBeVisible()
    await expect(timeCheckbox).toBeVisible()

    await dateInput.click()
    await page.locator(`[data-test-id*="${today.toString().split(' GMT')[0]}"]`).click()

    await expect(taskTimeInput).not.toBeVisible()
    await timeCheckbox.click()
    const isChecked = await timeCheckbox.isChecked()
    expect(isChecked).toBe(true)

    await expect(taskTimeInput).toBeVisible()

    await taskTimeInput.click()

    const timeInput = taskTimeInput.locator("[data-test-id='dp-input']")

    const value = await timeInput.inputValue()
    const inputHour = value.split(':')[0]
    expect(inputHour).toBe(expectedHour)

    await expect(saveButton).toBeVisible()
    await saveButton.click()
    await expect(saveTaskChangesButton).toBeVisible()
    await saveTaskChangesButton.click()
    await expect(updatedTask).toBeVisible()

    await expect(updatedTask.getByTestId('task-start-date')).toContainText(
      today.toString().split('T')[0]
    )
    await expect(updatedTask.getByTestId('task-time')).toContainText(expectedHour)
  })

  await test.step('edit task recurrence', async () => {
    const separation = '3'

    await expect(updatedTask).toBeVisible()
    await updatedTask.click()
    await expect(taskEditInfoModal).toBeVisible()

    const taskRecurrenceEdit = taskEditInfoModal.getByTestId('edit-recurrence')
    const recurrenceEditModal = page.getByTestId('recurrence-change-modal')
    const recurrenceCheckbox = recurrenceEditModal.getByRole('checkbox', {
      name: 'Enable recurring pattern',
    })
    const recurringTypeSelect = recurrenceEditModal
      .getByTestId('recurring-type-select')
      .locator('select')
    const recurrenceSeparation = recurrenceEditModal.getByTestId('recurrence-separation')
    const separationInput = recurrenceEditModal.getByTestId('every-x-count-input')
    const saveRecurrencePattern = recurrenceEditModal.getByTestId('save-pattern-changes')

    await expect(taskRecurrenceEdit).toBeVisible()
    await taskRecurrenceEdit.click()

    await expect(recurrenceEditModal).toBeVisible()
    await expect(recurrenceCheckbox).toBeVisible()

    const isChecked = await recurrenceCheckbox.isChecked()
    expect(isChecked).toBe(false)
    await recurrenceCheckbox.check()
    const isCheckedAfter = await recurrenceCheckbox.isChecked()
    expect(isCheckedAfter).toBe(true)

    await expect(recurringTypeSelect).toBeVisible()
    await expect(recurrenceSeparation).toBeVisible()

    await recurringTypeSelect.click()

    await recurringTypeSelect.selectOption({ value: 'daily' })
    await recurringTypeSelect.selectOption({ value: 'weekly' })

    const daysOfWeekDropdown = recurrenceEditModal.getByRole('button', { name: 'Choose days' })

    await expect(daysOfWeekDropdown).toBeVisible()

    await daysOfWeekDropdown.click()

    const listItems = await page.getByRole('listitem').all()
    expect(listItems.length).toBe(7)

    await page.getByLabel('Select Tuesday for weekly').check()
    await page.getByLabel('Select Thursday for weekly').check()
    await page.getByLabel('Select Saturday for weekly').check()

    await taskRecurrenceEdit.click()

    await separationInput.click()
    await separationInput.fill(separation)

    await taskRecurrenceEdit.click()
    await expect(saveRecurrencePattern).toBeVisible()
    await saveRecurrencePattern.click()

    await expect(saveTaskChangesButton).toBeVisible()
    await saveTaskChangesButton.click()
    await expect(updatedTask).toBeVisible()

    await expect(updatedTask.getByTestId('task-recurrence-pattern-info')).toBeVisible()

    const daysOfWeek = updatedTask.getByTestId('task-days-of-week')

    await expect(daysOfWeek).toBeVisible()
    const counted = await daysOfWeek.getByLabel(/Day of the week:/i).all()

    expect(counted.length).toBe(3)

    await expect(updatedTask.getByTestId('task-repeat-weekly')).toBeVisible()
    await expect(updatedTask.getByTestId('task-repeat-weekly')).toContainText(/every 3 weeks/i)
  })

  await test.step('edit task description', async () => {
    const description = 'This is task description'

    await expect(updatedTask).toBeVisible()
    await updatedTask.click()
    await expect(taskEditInfoModal).toBeVisible()

    const taskDescriptionEdit = taskEditInfoModal.getByTestId('edit-task-description')
    const descriptionInput = taskDescriptionEdit.getByRole('textbox')
    const taskDescription = taskEditInfoModal.getByTestId('task-description')

    await expect(taskDescriptionEdit).toBeVisible()
    await expect(taskDescriptionEdit).toContainText(/no description/i)

    await taskDescriptionEdit.click()

    await expect(descriptionInput).toBeVisible()

    await descriptionInput.fill(description)

    await page.keyboard.press('Enter')
    await expect(saveTaskChangesButton).toBeVisible()
    await saveTaskChangesButton.click()
    await expect(updatedTask).toBeVisible()

    await updatedTask.click()

    await expect(taskDescription).toBeVisible()
    await expect(taskDescription).toContainText(description)

    await page.getByRole('button', { name: 'close' }).click()
  })

  await test.step('delete task and category', async () => {
    await expect(updatedTask).toBeVisible()
    await updatedTask.click()
    await expect(taskEditInfoModal).toBeVisible()

    const deleteTaskButton = page.getByRole('button', { name: 'Delete task' })
    const acceptDeletionButton = page.getByTestId('accept-button')

    await expect(deleteTaskButton).toBeVisible()

    await deleteTaskButton.click()
    await acceptDeletionButton.click()

    await expect(updatedTask).not.toBeVisible()

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
