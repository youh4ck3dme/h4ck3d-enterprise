# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: billing.spec.ts >> Billing & Monetization Workflow >> should navigate from landing to pricing and view plans
- Location: tests\billing.spec.ts:5:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('link', { name: 'CENNÍK' })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('link', { name: 'CENNÍK' })

```

# Test source

```ts
  1  | 
  2  | import { test, expect } from '@playwright/test';
  3  | 
  4  | test.describe('Billing & Monetization Workflow', () => {
  5  |   test('should navigate from landing to pricing and view plans', async ({ page }) => {
  6  |     await page.goto('/');
  7  |     
  8  |     const pricingLink = page.getByRole('link', { name: 'CENNÍK' });
> 9  |     await expect(pricingLink).toBeVisible();
     |                               ^ Error: expect(locator).toBeVisible() failed
  10 |     
  11 |     await pricingLink.click();
  12 |     await expect(page).toHaveURL(/\/pricing/);
  13 |     
  14 |     // Check if plans are rendered
  15 |     await expect(page.getByText('BASIC')).toBeVisible();
  16 |     await expect(page.getByText('PRO')).toBeVisible();
  17 |     await expect(page.getByText('ENTERPRISE')).toBeVisible();
  18 |     
  19 |     // Check for the Upgrade buttons in the pricing cards
  20 |     const upgradeButtons = page.getByRole('button', { name: /Upgrade|Začať teraz/i });
  21 |     await expect(upgradeButtons).toHaveCount(3);
  22 |   });
  23 | });
  24 | 
```