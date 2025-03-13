import { test, expect } from '@playwright/test'

test('Create tasks, delete tasks', async ({ page }) => {

  await page.goto('http://localhost:5174/')

  const taskTitle = page.getByTestId('task-title-input')
  const taskDescription = page.getByTestId('task-description-input')
  const taskRecurrenceCheckbox = page.getByTestId('recurring-checkbox')
  const taskDate = page.getByTestId('task-date-picker')
  const categorySelection = page.getByTestId('category-select')
  const taskPointsCheckbox = page.getByTestId('task-points-checkbox')
  const taskPoints = page.getByTestId('points-input')
  const addTaskButton = page.getByTestId('add-task-button')
  const declineButton = page.getByTestId('decline-button')
  const taskTimeCheckbox = page.getByTestId('task-time-checkbox')
  const startDate = page.getByTestId('start-date-picker')
  const endDate = page.getByTestId('end-date-picker')
  const recurringTypeSelection = page.getByTestId('recurring-type-select').locator('select')
  const separationCount = page.getByTestId('every-x-count-input')
  const addTask = page.getByTestId('+ Task-tab')
  const newTaskModalTitle = page.getByTestId('new-task-modal-title')
  const tasksTab = page.getByTestId('Tasks-tab')
  const alert = page.getByRole('alert')

  await test.step('Create recurring task', async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const futureDate = new Date(today)
    futureDate.setHours(0, 0, 0, 0)
    futureDate.setDate(today.getDate() + 3)
    const newTaskTitle = 'New Recurring Task'

    await tasksTab.click()
    await addTask.click()

    await expect(newTaskModalTitle).toBeVisible()
    await expect(newTaskModalTitle).toHaveText('New Task')

    await expect(taskTitle).toBeVisible()
    await expect(taskDescription).toBeVisible()
    await expect(taskRecurrenceCheckbox).toBeVisible()
    await expect(taskDate).toBeVisible()
    await expect(categorySelection).toBeVisible()
    await expect(taskPointsCheckbox).toBeVisible()
    await expect(taskPoints).not.toBeVisible()
    await expect(addTaskButton).toBeVisible()
    await expect(declineButton).toBeVisible()
    await expect(addTaskButton).toBeDisabled()
    await expect(startDate).not.toBeVisible()
    await expect(endDate).not.toBeVisible()
    await expect(taskTimeCheckbox).not.toBeVisible()
    await expect(recurringTypeSelection).not.toBeVisible()
    await expect(separationCount).not.toBeVisible()

    await taskTitle.click()
    await taskTitle.fill('no')

    await expect(addTaskButton).toBeDisabled()

    await taskTitle.fill(newTaskTitle)

    await expect(addTaskButton).toBeEnabled()

    await taskDescription.click()
    await taskDescription.fill('New task description')

    await taskRecurrenceCheckbox.check()

    await expect(startDate).toBeVisible()
    await expect(endDate).toBeVisible()
    await expect(recurringTypeSelection).toBeVisible()
    await expect(recurringTypeSelection.locator('option:checked')).toHaveText('Daily')
    await expect(separationCount).toBeVisible()

    await startDate.click()
    await page.locator(`[data-test-id*="${today.toString().split(' GMT')[0]}"]`).click()
    await endDate.click()
    await page.locator(`[data-test-id*="${futureDate.toString().split(' GMT')[0]}"]`).click()
    await separationCount.click()
    await page.getByTestId('task-time-checkbox').click()
    await page.getByLabel('Select Category-- No Category').selectOption('')
    await taskPointsCheckbox.check()
    await taskPoints.click()
    await taskPoints.fill('10')
    await addTaskButton.click()

    const task = page.getByTestId(newTaskTitle.replace(' ', '-'))

    await expect(task).toBeVisible()
  })

  await test.step('Create scheduled task', async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const now = new Date()
    const expectedHour = now.getHours().toString().padStart(2, '0')
    const newTaskTitle = 'New Scheduled Task'

    await addTask.click()
    await expect(newTaskModalTitle).toBeVisible()

    await expect(taskTitle).toBeVisible()
    await expect(taskDescription).toBeVisible()
    await expect(taskRecurrenceCheckbox).toBeVisible()
    await expect(taskDate).toBeVisible()
    await expect(categorySelection).toBeVisible()
    await expect(taskPointsCheckbox).toBeVisible()
    await expect(taskPoints).not.toBeVisible()
    await expect(addTaskButton).toBeVisible()
    await expect(declineButton).toBeVisible()
    await expect(addTaskButton).toBeDisabled()
    await expect(taskTimeCheckbox).not.toBeVisible()
    await expect(addTaskButton).toBeDisabled()

    await taskTitle.click()
    await taskTitle.fill(newTaskTitle)

    await expect(addTaskButton).toBeEnabled()

    await taskDescription.click()
    await taskDescription.fill('New task description')
    await taskDate.click()
    await page.locator(`[data-test-id*="${today.toString().split(' GMT')[0]}"]`).click()

    await expect(taskTimeCheckbox).toBeVisible()
    await taskTimeCheckbox.click()
    const taskTimePicker = page.getByTestId('task-time-picker')
    const timeInput = taskTimePicker.locator("[data-test-id='dp-input']")

    await expect(taskTimePicker).toBeVisible()
    const value = await timeInput.inputValue()
    const inputHour = value.split(':')[0]
    expect(inputHour).toBe(expectedHour)

    await timeInput.click()

    const incrementHourBtn = page.locator('[data-test-id="hours-time-inc-btn-0"]')
    const incrementMinuteBtn = page.locator('[data-test-id="minutes-time-inc-btn-0"]')
    await incrementHourBtn.click()
    await incrementMinuteBtn.click()

    const newTimeValue = await timeInput.inputValue()
    expect(newTimeValue).not.toContain(expectedHour)

    await taskPointsCheckbox.check()
    await taskPoints.click()
    await taskPoints.fill('10')
    await addTaskButton.click()

    await expect(newTaskModalTitle).not.toBeVisible()

    const task = page.getByTestId(newTaskTitle.replace(' ', '-'))

    await expect(task).toBeVisible()
  })

  await test.step('create task without date', async () => {
    const newTaskTitle = 'New Task'

    await addTask.click()
    await expect(newTaskModalTitle).toBeVisible()

    await expect(taskTitle).toBeVisible()
    await expect(addTaskButton).toBeDisabled()

    await taskTitle.click()
    await taskTitle.fill(newTaskTitle)

    await expect(addTaskButton).toBeEnabled()
    await addTaskButton.click()
    await expect(newTaskModalTitle).not.toBeVisible()
    const task = page.getByTestId(newTaskTitle.replace(' ', '-'))
    await expect(task).toBeVisible()
  })

  await test.step('Same task title is not allowed', async () => {
    const newTaskTitle = 'New Task'

    await addTask.click()
    await expect(newTaskModalTitle).toBeVisible()

    await expect(taskTitle).toBeVisible()
    await expect(addTaskButton).toBeDisabled()

    await taskTitle.click()
    await taskTitle.fill(newTaskTitle)

    await expect(addTaskButton).toBeEnabled()
    await addTaskButton.click()

    await expect(alert).toBeVisible()

    const closeButton = page.getByRole('button', { name: 'close' })
    await expect(closeButton).toBeVisible()
    await closeButton.click()

    await expect(newTaskModalTitle).not.toBeVisible()
  })

  await test.step('Recurring task without start day is not allowed', async () => {
    const newTaskTitle = 'New Recur Task'

    await addTask.click()
    await expect(newTaskModalTitle).toBeVisible()

    await expect(taskRecurrenceCheckbox).toBeVisible()
    await expect(taskTitle).toBeVisible()
    await expect(addTaskButton).toBeDisabled()
    await expect(declineButton).toBeVisible()

    await taskTitle.click()
    await taskTitle.fill(newTaskTitle)
    await taskRecurrenceCheckbox.click()

    await expect(addTaskButton).toBeEnabled()
    await addTaskButton.click()

    await expect(alert).toBeVisible()

    await declineButton.click()

    await expect(newTaskModalTitle).not.toBeVisible()
  })

  await test.step('Delete tasks', async () => {
    const firstTaskTitle = 'New Recurring Task'
    const secondTaskTitle = 'New Task'
    const thirdTaskTitle = 'New Scheduled Task'

    const firstTask = page.getByTestId(firstTaskTitle.replace(' ', '-'))
    const secondTask = page.getByTestId(secondTaskTitle.replace(' ', '-'))
    const thirdTask = page.getByTestId(thirdTaskTitle.replace(' ', '-'))
    const deleteButton = page.getByTestId('delete-task')
    const acceptButton = page.getByTestId('accept-button')

    await expect(firstTask).toBeVisible()
    await expect(secondTask).toBeVisible()
    await expect(thirdTask).toBeVisible()
    await expect(deleteButton).not.toBeVisible()
    await expect(acceptButton).not.toBeVisible()

    firstTask.click()
    await expect(deleteButton).toBeVisible()
    await deleteButton.click()
    await expect(acceptButton).toBeVisible()
    await acceptButton.click()
    await expect(firstTask).not.toBeVisible()

    secondTask.click()
    await expect(deleteButton).toBeVisible()
    await deleteButton.click()
    await expect(acceptButton).toBeVisible()
    await acceptButton.click()
    await expect(secondTask).not.toBeVisible()

    thirdTask.click()
    await expect(deleteButton).toBeVisible()
    await deleteButton.click()
    await expect(acceptButton).toBeVisible()
    await acceptButton.click()
    await expect(thirdTask).not.toBeVisible()
  })
})
