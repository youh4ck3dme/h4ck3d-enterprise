
import { test, expect } from '@playwright/test';

test.describe('Billing & Monetization Workflow', () => {
  test('should navigate from landing to pricing and view plans', async ({ page }) => {
    await page.goto('/');

    const pricingLink = page.getByRole('navigation').getByRole('link', { name: 'CENNÍK', exact: true }).first();
    await expect(pricingLink).toBeVisible();

    await pricingLink.click();
    await expect(page).toHaveURL(/\/pricing/);

    await expect(page.getByRole('heading', { name: 'Free' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pro' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Enterprise' })).toBeVisible();

    await expect(page.getByRole('button', { name: 'Začať zadarmo' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Prejsť na Pro' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Kontaktovať predaj' })).toBeVisible();
  });
});
