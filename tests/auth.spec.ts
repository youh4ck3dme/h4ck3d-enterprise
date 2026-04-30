
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('opens the original landing page and enters dashboard without OAuth blocker', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('navigation').getByText('H4CK3D')).toBeVisible();
    await expect(page.getByRole('navigation').getByText('ENTERPRISE')).toBeVisible();

    const accessButton = page.getByRole('button', { name: 'Vstúpiť do App' }).first();
    await expect(accessButton).toBeVisible();

    await accessButton.click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Continue with Google')).toHaveCount(0);
    await expect(page.getByText('Continue with GitHub')).toHaveCount(0);
  });
});
