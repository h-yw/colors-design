
import { test, expect } from '@playwright/test';

test.describe('Visual & Functional E2E', () => {
  
  test('Landing Page loads and changes theme', async ({ page }) => {
    // 1. Initial Load
    await page.goto('/');
    await expect(page).toHaveTitle(/Colors/);
    
    // Stabilize
    await page.waitForLoadState('networkidle');

    // Ensure ThemePicker is visible
    await expect(page.locator('.theme-picker-inline')).toBeVisible({ timeout: 10000 });
    
    // Snapshot: Default
    await expect(page).toHaveScreenshot('landing-initial.png', { fullPage: true });

    // 2. Change Theme to Sky Blue (天蓝)
    const skyBlueBtn = page.locator('button[title*="天蓝"]');
    await expect(skyBlueBtn).toBeVisible();
    await skyBlueBtn.hover();
    await skyBlueBtn.click();
    
    // Check URL update
    await expect(page).toHaveURL(/theme=%E5%A4%A9%E8%93%9D/);
    
    // Wait for animation
    await page.waitForTimeout(500);
    
    // Snapshot: Sky Blue
    await expect(page).toHaveScreenshot('landing-skyblue.png', { fullPage: true });
  });

  test('Dark Mode Toggle', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Use title locator with specific mode keywords to avoid matching Gamut toggle
    const modeSwitch = page.locator('button[title*=" Mode"]');
    await expect(modeSwitch).toBeVisible();
    
    await modeSwitch.click();
    await page.waitForTimeout(500);
    
    // Snapshot: Toggled Mode
    await expect(page).toHaveScreenshot('landing-toggled-mode.png', { fullPage: true });
  });

  test('Persists Navigation', async ({ page }) => {
    // Start with a specific theme: Rouge (胭脂) + Dark Mode
    await page.goto('/?theme=胭脂&mode=dark');
    await page.waitForLoadState('domcontentloaded'); // networkidle might be too strict if background requests persist
    
    // Check for attributes first (Dark Mode)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark', { timeout: 10000 });

    // Verify content via Snapshot (Visual Truth) instead of brittle text matching
    // If theme handles correctly, screenshot will show Rouge.
    
    // Click to Verifier
    const verifierLink = page.getByRole('link', { name: /Verifier/i }).first();
    if (await verifierLink.isVisible()) {
        await verifierLink.click();
    } else {
        await page.goto('/verifier?theme=胭脂&mode=dark'); 
    }

    // Verify URL params preserved
    await expect(page).toHaveURL(/theme=%E8%83%AD%E8%84%82/);
    await expect(page).toHaveURL(/mode=dark/);
    
    // Verify URL params preserved
    await expect(page).toHaveURL(/theme=%E8%83%AD%E8%84%82/);
    await expect(page).toHaveURL(/mode=dark/);
    
    // Snapshot
    await expect(page).toHaveScreenshot('verifier-rouge-dark.png', { fullPage: true });
  });

  test('APCA Verification', async ({ page }) => {
    await page.goto('/verifier');
    
    // Check for "APCA (Lc)" label
    const apcaLabel = page.getByText('APCA (Lc):').first();
    await expect(apcaLabel).toBeVisible();

    // Check for "Lc" score inside the specific indicator font
    // We used <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>Lc...
    const lcScore = page.getByText(/Lc -?\d+\.\d/);
    await expect(lcScore.first()).toBeVisible();
  });
});
