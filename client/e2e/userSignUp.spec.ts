import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

test('new user signup, user settings', async ({ page }) => {
  const userEmail = 'someemail@email.com'
  const password = 'SOMEemail123$'
  const username = 'Test User'

  await test.step('Signup new user', async () => {
    await page.goto('http://localhost:5174/')
    const heading = page.getByRole('heading', { name: 'CollabCat' })
    const signup = page.getByTestId('signup-button')
    const login = page.getByTestId('login-button')

    await expect(heading).toBeVisible()
    await expect(signup).toBeVisible()
    await expect(login).toBeVisible()

    await signup.click()
    await page.getByLabel('Email address').click()
    await page.getByLabel('Email address').fill(userEmail)
    await page.getByLabel('Password').click()
    await page.getByLabel('Password').fill(password)

    const google = page.getByRole('button', { name: 'Continue with Google' })
    await expect(google).toBeVisible()

    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.getByRole('button', { name: 'Accept' }).click()

    const usernameDisplayed = page.getByTestId('user-name')
    const avatar = page.getByTestId('user-avatar')
    const menuTrigger = page.getByTestId('user-menu-trigger')

    await expect(usernameDisplayed).toBeVisible()
    await expect(avatar).toBeVisible()
    await expect(menuTrigger).toBeVisible()

    await expect(page).toHaveURL(`/${userEmail}/calendar`)
  })

  await test.step('Change username', async () => {
    const usernameDisplayed = page.getByTestId('user-name')
    await expect(usernameDisplayed).toHaveText(userEmail)

    const menuTrigger = page.getByTestId('user-menu-trigger')
    await menuTrigger.click()

    const settings = page.getByTestId('user-settings-button')
    const logout = page.getByTestId('logout-button')

    await expect(settings).toBeVisible()
    await expect(logout).toBeVisible()

    await page.getByTestId('user-settings-button').click()
    await page.getByPlaceholder('Username').click()
    await page.getByPlaceholder('Username').fill(username)
    await page.getByRole('button', { name: 'Save Changes' }).click()

    await expect(usernameDisplayed).toHaveText(username)
  })

  await test.step('Enable user task points', async () => {
    const menuTrigger = page.getByTestId('user-menu-trigger')
    const userPoints = page.getByTestId('points-display')

    await expect(userPoints).not.toBeVisible()

    await menuTrigger.click()
    await page.getByTestId('user-settings-button').click()
    await page.getByRole('checkbox', { name: 'Task Points' }).check()
    await page.getByRole('button', { name: 'Save Changes' }).click()

    await expect(userPoints).toBeVisible()
    await expect(userPoints).toHaveText('0')
  })

  await test.step('Delete user', async () => {
    const menuTrigger = page.getByTestId('user-menu-trigger')
    await menuTrigger.click()
    await page.getByTestId('user-settings-button').click()

    const deleteAccountButton = page.getByTestId('delete-account')
    await expect(deleteAccountButton).toBeVisible()

    await deleteAccountButton.click()

    const modalTitle = page.getByRole('heading', { name: 'Please Confirm the Action' })
    const acceptButton = page.getByRole('button', { name: 'I accept' })
    const declineButton = page.getByRole('button', { name: 'Decline' })

    await expect(acceptButton).toBeVisible()
    await expect(declineButton).toBeVisible()
    await expect(modalTitle).toBeVisible()

    await acceptButton.click()

    await expect(page).toHaveURL('/')

    const heading = page.getByRole('heading', { name: 'CollabCat' })
    const signup = page.getByTestId('signup-button')
    const login = page.getByTestId('login-button')

    await expect(heading).toBeVisible()
    await expect(signup).toBeVisible()
    await expect(login).toBeVisible()
  })
})
