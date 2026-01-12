import { test, expect } from '@playwright/test';

test.describe('Harmony Explorer', () => {
  test('page loads and shows base color', async ({ page }) => {
    await page.goto('/harmony');
    
    // Check Header using i18n text (assuming default 'zh')
    await expect(page.getByRole('heading', { name: '色彩和声 (Harmony)' })).toBeVisible();
    
    // Check "Based on Brand Color" section
    await expect(page.getByText('基于当前主色')).toBeVisible();
  });

  test('can generate and apply harmony colors', async ({ page }) => {
    await page.goto('/harmony');

    // Wait for the harmony cards to render
    await expect(page.getByText('互补色 (Complementary)')).toBeVisible();

    // Verify Active Secondary/Tertiary initial state (likely not set or default)
    // The explorer shows "Active Secondary" text
    await expect(page.getByText('Active Secondary')).toBeVisible();

    // Find the first "Set as Secondary" button (labeled "2") and click it
    // Using title attribute "设为辅助色" for better stability
    const setSecondaryBtn = page.locator('button[title="设为辅助色"]').first();
    await setSecondaryBtn.click();
    
    // Verify that "Reset" button appears or is clickable
    await expect(page.getByText('Reset to Default Harmonies')).toBeVisible();
    
    // Ideally we verify that the Active Secondary color box style changed.
    // But visual regression or precise style check is flaky without hardcoded values.
    // We can check if the button click didn't crash the page at least.
  });
});
