import { test, expect } from '@playwright/test'
import { formatDateToLongString } from '../src/utils/helpers'

test('User calendar, mark tasks as done', async ({ page }) => {
  await page.goto('http://localhost:5174/')

  const newTaskTitle = 'Test Recurring Task'
  const today = new Date()
  const calendarTab = page.getByTestId('Calendar-tab')
  const datePicker = page.getByTestId('date-picker')
  const todayButton = page.getByTestId('today-button')
  const taskListDate = page.getByTestId('task-list-date')
  const task = page.getByTestId(newTaskTitle.replace(' ', '-'))
  const taskCheckbox = task.getByTestId('task-status').locator('input')

  await test.step('user can see the calendar and pick dates', async () => {
    await expect(calendarTab).toBeVisible()
    await calendarTab.click()

    await expect(datePicker).toBeVisible()
    await expect(todayButton).toBeVisible()
    await expect(taskListDate).toBeVisible()
    await expect(taskListDate).toContainText(`Today ${formatDateToLongString(today)}`)

    await datePicker.getByText('19').click()

    await expect(taskListDate).toContainText('19')

    await todayButton.click()
    await expect(taskListDate).toContainText(`Today ${formatDateToLongString(today)}`)
  })

  await test.step('add recurring task', async () => {
    today.setHours(0, 0, 0, 0)
    const startDateValue = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const endDateValue = new Date(today.getFullYear(), today.getMonth() + 2, 0)
    const taskTitle = page.getByTestId('task-title-input')
    const startDate = page.getByTestId('start-date-picker')
    const endDate = page.getByTestId('end-date-picker')

    await page.getByTestId('Tasks-tab').click()
    await page.getByTestId('+ Task-tab').click()
    await taskTitle.click()
    await taskTitle.fill(newTaskTitle)
    await page.getByTestId('recurring-checkbox').check()
    await startDate.click()
    await page.click('[data-dp-element="action-prev"]')
    await page.locator(`[data-test-id*="${startDateValue.toString().split(' GMT')[0]}"]`).click()
    await endDate.click()
    await page.click('[data-dp-element="action-next"]')
    await page.locator(`[data-test-id*="${endDateValue.toString().split(' GMT')[0]}"]`).click()
    await page.getByTestId('add-task-button').click()
    await expect(task).toBeVisible()
    await calendarTab.click()
  })

  await test.step('task should be visible in the calendar and allow to check it', async () => {
    await expect(taskListDate).toContainText(`Today ${formatDateToLongString(today)}`)
    await expect(task).toBeVisible()

    await expect(taskCheckbox).toBeVisible()
    await expect(taskCheckbox).not.toBeChecked()
    await expect(datePicker).toBeVisible()
    await taskCheckbox.check()
    await expect(taskCheckbox).toBeChecked()
    await page.reload()
    await expect(taskCheckbox).toBeChecked()
  })

  await test.step('task should be visible in the calendar and allow to check it in the past dates', async () => {
    const currentDate = new Date()
    currentDate.setMonth(today.getMonth() - 1)
    currentDate.setDate(15)
    const day = '15'
    const previousMonthButton = page.locator('[data-dp-element="action-prev"]')

    await expect(taskListDate).toContainText(`Today ${formatDateToLongString(today)}`)
    await expect(task).toBeVisible()

    await expect(taskCheckbox).toBeVisible()
    await expect(taskCheckbox).toBeChecked()

    await expect(datePicker).toBeVisible()

    await previousMonthButton.click()
    await datePicker.getByText(day).click()
    await expect(taskListDate).toContainText(`${formatDateToLongString(currentDate)}`)
    await expect(task).toBeVisible()
    await expect(taskCheckbox).toBeVisible()
    await taskCheckbox.check()
    await expect(taskCheckbox).toBeChecked()

    await todayButton.click()
  })
  await test.step('task should be visible in the calendar and not allow to check it in the future dates', async () => {
    const currentDate = new Date()
    currentDate.setMonth(today.getMonth() + 1)
    currentDate.setDate(15)
    const day = '15'
    const nextMonthButton = page.locator('[data-dp-element="action-next"]')

    await todayButton.click()
    await expect(taskListDate).toContainText(`Today ${formatDateToLongString(today)}`)
    await expect(task).toBeVisible()

    await expect(taskCheckbox).toBeVisible()
    await expect(taskCheckbox).toBeChecked()

    await expect(datePicker).toBeVisible()
    await nextMonthButton.click()
    await datePicker.getByText(day).click()

    await expect(taskListDate).toContainText(`${formatDateToLongString(currentDate)}`)

    await expect(task).toBeVisible()
    await expect(taskCheckbox).not.toBeVisible()

    await todayButton.click()
  })

  await test.step('user can uncheck the task', async () => {
    await todayButton.click()
    await expect(taskListDate).toContainText(`Today ${formatDateToLongString(today)}`)
    await expect(task).toBeVisible()

    await expect(taskCheckbox).toBeVisible()
    await expect(taskCheckbox).toBeChecked()
    await taskCheckbox.uncheck()
    await expect(taskCheckbox).not.toBeChecked()
    await page.reload()
    await expect(taskCheckbox).not.toBeChecked()
    await todayButton.click()
  })

  await test.step('delete test task', async () => {
    await page.getByTestId('Tasks-tab').click()
    await task.click()
    await page.getByTestId('delete-task').click()
    await page.getByTestId('accept-button').click()

    await calendarTab.click()

    await expect(task).not.toBeVisible()
  })
})
