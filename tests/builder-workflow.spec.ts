import { expect, test } from '@playwright/test';

test.describe('Builder workspace E2E', () => {
  test('generates a four-prompt component draft and exposes safe exports', async ({ page }) => {
    await page.goto('/builder');

    await expect(page.getByRole('heading', { name: /Builder: 4-prompt workflow/i })).toBeVisible();

    await page.getByLabel('Čo ideš stavať?').fill('Landing page pre PWA obchod s kávou');
    await page.getByLabel('Pre koho to je?').fill('Lokálne kaviarne a malé značky');
    await page.getByLabel('Aké sekcie alebo komponenty chceš?').fill('hero, feature grid, FAQ, CTA');
    await page.getByLabel('Ako to má vyzerať a kam to pôjde?').fill('editorový warm SaaS štýl, React, WordPress-safe HTML');

    await page.getByRole('button', { name: /Generovať komponenty/i }).click();

    await expect(page.getByText(/Výstup je lokálny deterministic draft/i).first()).toBeVisible();
    await expect(page.getByText(/Atomic plan:/i)).toBeVisible();
    await expect(page.getByText(/Landing page pre PWA obchod s kávou/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Stiahnuť WordPress FSE ZIP' })).toBeVisible();

    await page.getByRole('button', { name: 'Partial Files' }).click();
    await expect(page.getByLabel('generated output')).toContainText('Header.html');
    await expect(page.getByLabel('generated output')).toContainText('style-manifest.css');

    await page.getByRole('button', { name: 'CSS Manifest' }).click();
    await expect(page.getByLabel('generated output')).toContainText('--gb-primary');

    await page.getByRole('button', { name: 'WordPress Safe HTML' }).click();
    await expect(page.getByLabel('generated output')).toContainText('gb-wp-card');
    await expect(page.getByLabel('generated output')).not.toContainText('<script');
  });

  test('keeps BlogMagica demo routes reachable without auth', async ({ page }) => {
    const routes = [
      '/blogmagica',
      '/blogmagica/articles',
      '/blogmagica/new',
      '/blogmagica/seo',
      '/blogmagica/drafts',
      '/blogmagica/published',
      '/blogmagica/calendar',
    ];

    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('body')).not.toContainText('Continue with Google');
      await expect(page.locator('body')).not.toContainText('Continue with GitHub');
      await expect(page.locator('body')).not.toContainText('404');
    }
  });
});
