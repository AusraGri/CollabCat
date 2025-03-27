import { test as setup, expect, chromium } from '@playwright/test'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { stringToUrl } from '@/utils/helpers'
import { config } from 'dotenv'

config()
// @ts-ignore  - need to fix it somehow :O -
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const authFile = path.join(__dirname, 'auth.json')

setup('authenticate', async ({context}) => {
  try {
    const { VITE_AUTH0_TEST_EMAIL, VITE_AUTH0_TEST_PASSWORD } = process.env

    if (!VITE_AUTH0_TEST_EMAIL || !VITE_AUTH0_TEST_PASSWORD) {
      throw new Error('Missing environment variables for login')
    }

    const browser = await chromium.launch({ headless: true })
    // const page = await chromium.newPage()
    const page = await context.newPage()

    

    await page.goto('http://localhost:5174/')
    await page.getByTestId('login-button').click()
    await page.getByLabel('Email address').waitFor({ state: 'visible', timeout: 50000 });
    await page.screenshot({ path: 'debug.png' });
    await page.getByLabel('Email address').fill(VITE_AUTH0_TEST_EMAIL)
    await page.getByLabel('Password').fill(VITE_AUTH0_TEST_PASSWORD)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.waitForURL(`http://localhost:5174/${stringToUrl(VITE_AUTH0_TEST_EMAIL)}/calendar`, { timeout: 20000 })

    await expect(page).toHaveURL(/calendar/)
    // await page.context().storageState({ path: authFile })
    await context.storageState({ path: authFile })

    await browser.close()
  } catch (error) {
    console.log(error)
  }
})
