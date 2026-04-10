
import { test, expect } from '@playwright/test';

test.describe('Billing & Monetization Workflow', () => {
  test('should navigate from landing to pricing and view plans', async ({ page }) => {
    await page.goto('/');
    
    const pricingLink = page.getByRole('link', { name: 'CENNÍK' });
    await expect(pricingLink).toBeVisible();
    
    await pricingLink.click();
    await expect(page).toHaveURL(/\/pricing/);
    
    // Check if plans are rendered
    await expect(page.getByText('BASIC')).toBeVisible();
    await expect(page.getByText('PRO')).toBeVisible();
    await expect(page.getByText('ENTERPRISE')).toBeVisible();
    
    // Check for the Upgrade buttons in the pricing cards
    const upgradeButtons = page.getByRole('button', { name: /Upgrade|Začať teraz/i });
    await expect(upgradeButtons).toHaveCount(3);
  });
});
