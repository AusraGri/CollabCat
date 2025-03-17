import { test, expect } from '@playwright/test'

test('Create new personal reward, edit reward, delete reward', async ({ page }) => {
  await page.goto('http://localhost:5174/')

  const newRewardTitle = 'Reward Test'
  const updatedRewardTitle = 'Updated Reward Test'
  const rewardLimit = 20
  const rewardCost = '100'
  const updatedCost = '50'

  const rewardTab = page.getByTestId('Rewards-tab')
  const rewardModalHeader = page.getByTestId('reward-modal-header')
  const rewardTitleInput = page.getByTestId('reward-title-input')
  const rewardClaimsLimitCheckbox = page.getByTestId('reward-claim-limit')
  const rewardClaimLimitInput = page.getByTestId('claim-value-range').locator('input')
  const rewardCostInput = page.getByTestId('reward-cost-input')
  const submitRewardButton = page.getByTestId('submit-reward-button')
  const deleteRewardButton = page.getByTestId('delete-reward-button')
  const editRewardButton = page.getByTestId('edit-reward-button')
  const rewardItem = page.getByLabel(`Reward: ${newRewardTitle}`)

  await test.step('create new reward', async () => {
    const newReward = page.getByTestId('add-reward')
    await expect(rewardTab).toBeVisible()
    await rewardTab.click()

    await expect(newReward).toBeVisible()
    await newReward.click()
    await expect(rewardModalHeader).toBeVisible()
    await expect(rewardModalHeader).toHaveText(/create new reward/i)
    await expect(rewardTitleInput).toBeVisible()
    await expect(rewardClaimsLimitCheckbox).toBeVisible()
    await expect(rewardCostInput).toBeVisible()
    await expect(submitRewardButton).toBeVisible()
    await expect(submitRewardButton).toBeDisabled()

    await rewardTitleInput.click()
    await rewardTitleInput.fill(newRewardTitle)

    await rewardClaimsLimitCheckbox.click()

    await expect(rewardClaimLimitInput).toBeVisible()
    await rewardClaimLimitInput.focus()

    await rewardClaimLimitInput.press('ArrowRight')
    await rewardClaimLimitInput.press('ArrowLeft')

    const boundingBox = await rewardClaimLimitInput.boundingBox()
    if (boundingBox) {
      const x = boundingBox.x + boundingBox.width * 0.5
      const y = boundingBox.y + boundingBox.height / 2

      await page.mouse.click(x, y)
    }

    await rewardClaimLimitInput.evaluate((el, value) => {
      ;(el as HTMLInputElement).value = String(value)
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }, rewardLimit)

    await rewardCostInput.click()
    await rewardCostInput.fill(rewardCost)

    await expect(submitRewardButton).toBeEnabled()
    await submitRewardButton.click()
  })

  await test.step('new created reward should be seen in the rewards list', async () => {
    const rewardTitle = page.getByTestId('reward-title')
    const rewardClaimsValue = page.getByTestId('reward-amount-badge')
    const rewardCostValue = page.getByTestId('reward-cost-badge')
    const claimRewardButton = page.getByTestId('claim-reward-button')

    await rewardTab.click()
    await expect(rewardItem).toBeVisible()
    await expect(rewardTitle).toHaveText(newRewardTitle)
    await expect(rewardClaimsValue).toBeVisible()
    await expect(rewardClaimsValue).toHaveText(String(rewardLimit))
    await expect(rewardCostValue).toBeVisible()
    await expect(rewardCostValue).toHaveText(rewardCost)
    await expect(deleteRewardButton).toBeVisible()
    await expect(editRewardButton).toBeVisible()
    await expect(claimRewardButton).not.toBeVisible()

    await rewardTab.click()
  })

  await test.step('edit reward title, limit and cost', async () => {
    await rewardTab.click()
    await expect(rewardItem).toBeVisible()
    const editButton = rewardItem.getByTestId('edit-reward-button')
    await expect(editButton).toBeVisible()
    await editButton.click()

    await expect(rewardModalHeader).toContainText(/update reward/i)
    await expect(rewardTitleInput).toHaveValue(newRewardTitle)
    await expect(rewardClaimLimitInput).toHaveValue(String(rewardLimit))
    await expect(rewardCostInput).toHaveValue(rewardCost)

    await rewardTitleInput.click()
    await rewardTitleInput.fill(updatedRewardTitle)

    await rewardClaimLimitInput.focus()
    await rewardClaimLimitInput.press('ArrowRight')

    await rewardCostInput.click()
    await rewardCostInput.fill('10000000000')

    await submitRewardButton.click()
    const rewardCostErrorMessage = page.getByLabel('Reward cost error message');

    await expect(rewardCostErrorMessage).toBeVisible()
    await expect(rewardCostErrorMessage).toContainText(/enter a valid cost for the reward/i)

    await rewardCostInput.fill(updatedCost)
    await submitRewardButton.click()

  })

  await test.step('updated reward should be seen in the rewards list', async () => {
    const rewardTitle = page.getByTestId('reward-title')
    const rewardClaimsValue = page.getByTestId('reward-amount-badge')
    const rewardCostValue = page.getByTestId('reward-cost-badge')
    const claimRewardButton = page.getByTestId('claim-reward-button')
    const reward = page.getByLabel(`Reward: ${updatedRewardTitle}`)

    await rewardTab.click()
    await expect(reward).toBeVisible()
    await expect(rewardTitle).toHaveText(updatedRewardTitle)
    await expect(rewardClaimsValue).toBeVisible()
    await expect(rewardClaimsValue).toHaveText(String(rewardLimit + 1))
    await expect(rewardCostValue).toBeVisible()
    await expect(rewardCostValue).toHaveText(updatedCost)
    await expect(deleteRewardButton).toBeVisible()
    await expect(editRewardButton).toBeVisible()
    await expect(claimRewardButton).not.toBeVisible()

    await rewardTab.click()
  })

  await test.step('delete reward', async () => {
    await rewardTab.click()

    const reward = page.getByLabel(`Reward: ${updatedRewardTitle}`)
    const confirmationQuestion = page.getByTestId('confirmation-question')
    const confirmDeletionButton = page.getByTestId('accept-button')

    await expect(reward).toBeVisible()
    await reward.getByTestId('delete-reward-button').click()

    await expect(confirmationQuestion).toBeVisible()
    await expect(confirmationQuestion).toContainText(updatedRewardTitle)
    await expect(confirmDeletionButton).toBeVisible()

    await confirmDeletionButton.click()

    await expect(reward).not.toBeVisible()

  })
})
