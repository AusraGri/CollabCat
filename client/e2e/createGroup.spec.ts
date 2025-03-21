import { test, expect } from '@playwright/test'

test('Create new group, select group, delete group', async ({ page }) => {
  await page.goto('http://localhost:5174/')
  const newGroupTitle = 'New Group'
  const expectedUrlPart = `/${newGroupTitle.replace(' ', '-')}/.*`

  const groupDropdownButton = page.getByTestId('group-dropdown-button')
  const noGroupsSelection = page.getByTestId('no-groups')
  const createGroupButton = page.getByTestId('create-group-button')
  const newGroupModal = page.getByTestId('group-modal-header')
  const addGroupButton = page.getByTestId('accept-button')
  const declineGroupButton = page.getByTestId('decline-button')
  const groupNameInput = page.getByTestId('group-name-input')
  const alert = page.getByRole('alert')
  const groupItem = page.getByRole('listitem', { name: `Select ${newGroupTitle} group` })

  await test.step('create new group', async () => {
    await expect(groupDropdownButton).toBeVisible()

    await groupDropdownButton.click()
    await expect(noGroupsSelection).toBeVisible()
    await expect(noGroupsSelection).toContainText('You have no groups')
    await expect(createGroupButton).toBeVisible()

    await createGroupButton.click()

    await expect(newGroupModal).toBeVisible()
    await expect(newGroupModal).toContainText('Create New Group')
    await expect(addGroupButton).toBeVisible()
    await expect(addGroupButton).toBeDisabled()
    await expect(groupNameInput).toBeVisible()

    await groupNameInput.click()
    await groupNameInput.fill('no')
    await expect(addGroupButton).toBeDisabled()
    await groupNameInput.fill(newGroupTitle)

    await expect(addGroupButton).toBeEnabled()

    await addGroupButton.click()

    await groupDropdownButton.click()

    await expect(groupItem).toBeVisible()
    await groupDropdownButton.click()
  })

  await test.step('create group with already existing group name not allowed', async () => {
    await expect(alert).not.toBeVisible()

    await groupDropdownButton.click()
    await createGroupButton.click()
    await groupNameInput.click()
    await expect(addGroupButton).toBeDisabled()
    await groupNameInput.fill(newGroupTitle)
    await expect(addGroupButton).toBeEnabled()
    await addGroupButton.click()

    await expect(alert).toBeVisible()
    await expect(alert).toContainText('group name already exist')
    await expect(declineGroupButton).toBeVisible()

    await declineGroupButton.click()
  })

  await test.step('select/go to group page', async () => {
    await groupDropdownButton.click()
    await expect(groupItem).toBeVisible()

    await groupItem.click()

    await expect(groupDropdownButton).toContainText(newGroupTitle)
    await expect(page).toHaveURL(new RegExp(expectedUrlPart))
  })

  await test.step('group page should have tasks, calendar, rewards, members, settings tabs', async () => {
    const calendarTab = page.getByTestId('Calendar-tab')
    const tasksTab = page.getByTestId('Tasks-tab')
    const rewardsTab = page.getByTestId('Rewards-tab')
    const membersTab = page.getByTestId('Members-tab')
    const settingsTab = page.getByTestId('Settings-tab')

    await expect(calendarTab).toBeVisible()
    await expect(tasksTab).toBeVisible()
    await expect(rewardsTab).toBeVisible()
    await expect(membersTab).toBeVisible()
    await expect(settingsTab).toBeVisible()
  })

  await test.step('delete group', async () => {
    const settingsTab = page.getByTestId('Settings-tab')
    const removeGroupButton = page.getByTestId('remove-group-button')
    const confirmationModalTitle = page.locator('#group-settings-modal')
    const confirmDeleteButton = page.getByTestId('accept-button')

    await expect(settingsTab).toBeVisible()
    await settingsTab.click()

    await expect(removeGroupButton).toBeVisible()
    await removeGroupButton.click()
    await expect(confirmationModalTitle).toBeVisible()
    await expect(confirmDeleteButton).toBeVisible()
    await confirmDeleteButton.click()

    await expect(groupDropdownButton).toContainText('Groups')
    await expect(groupDropdownButton).not.toContainText(newGroupTitle)

    await groupDropdownButton.click()
    await expect(noGroupsSelection).toBeVisible()
  })
})
