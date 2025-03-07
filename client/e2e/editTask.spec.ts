import { test, expect } from '@playwright/test'
import { loginTestUser } from 'utils/auth0Setup'

test('Edit task', async ({ page }) => {
  await loginTestUser(page)
  const newTaskTitle = 'New Task'
  const updatedTaskTitle = 'Updated Task Title'

  await test.step('create task without date', async () => {

    const tasksTab = page.getByTestId('Tasks-tab')
    await tasksTab.click()

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
    const task = page.getByTestId(newTaskTitle.replace(' ', '-'))
    await expect(task).toBeVisible()
  })

  await test.step('edit task title', async () => {

    const task = page.getByTestId(newTaskTitle.replace(' ', '-'))
    await expect(task).toBeVisible()

    await task.click()


  })

})
