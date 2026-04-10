# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flow >> should navigate to landing page and show the login button
- Location: tests\auth.spec.ts:5:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('H4CK3D ENTERPRISE')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('H4CK3D ENTERPRISE')

```

# Test source

```ts
  1  | 
  2  | import { test, expect } from '@playwright/test';
  3  | 
  4  | test.describe('Authentication Flow', () => {
  5  |   test('should navigate to landing page and show the login button', async ({ page }) => {
  6  |     await page.goto('/');
  7  |     
  8  |     // Check if branding is present
> 9  |     await expect(page.getByText('H4CK3D ENTERPRISE')).toBeVisible();
     |                                                       ^ Error: expect(locator).toBeVisible() failed
  10 |     
  11 |     // Check for Access button
  12 |     const accessButton = page.getByRole('button', { name: 'Vstúpiť do App' });
  13 |     await expect(accessButton).toBeVisible();
  14 |     
  15 |     // Navigate to dashboard (which might trigger login logic)
  16 |     await accessButton.click();
  17 |     await expect(page).toHaveURL(/\/dashboard/);
  18 |   });
  19 | });
  20 | 
```