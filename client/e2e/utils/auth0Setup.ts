import { Page } from '@playwright/test'
import { config } from 'dotenv'

config()

export async function loginTestUser(page: Page) {
  const { VITE_AUTH0_TEST_EMAIL, VITE_AUTH0_TEST_PASSWORD } = process.env

  if (!VITE_AUTH0_TEST_EMAIL || !VITE_AUTH0_TEST_PASSWORD) {
    throw new Error(
      'Missing environment variables VITE_AUTH0_TEST_EMAIL or VITE_AUTH0_TEST_PASSWORD'
    )
  }

  await page.goto('http://localhost:5174/')
  await page.getByTestId('login-button').click()
  await page.getByLabel('Email address').click()
  await page.getByLabel('Email address').fill(VITE_AUTH0_TEST_EMAIL)
  await page.getByLabel('Password').click()
  await page.getByLabel('Password').fill(VITE_AUTH0_TEST_PASSWORD)
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.waitForURL(`http://localhost:5174/${VITE_AUTH0_TEST_EMAIL}/calendar`);

  return true
}