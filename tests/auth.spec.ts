
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should navigate to landing page and show the login button', async ({ page }) => {
    await page.goto('/');
    
    // Check if branding is present
    await expect(page.getByText('H4CK3D ENTERPRISE')).toBeVisible();
    
    // Check for Access button
    const accessButton = page.getByRole('button', { name: 'Vstúpiť do App' });
    await expect(accessButton).toBeVisible();
    
    // Navigate to dashboard (which might trigger login logic)
    await accessButton.click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
