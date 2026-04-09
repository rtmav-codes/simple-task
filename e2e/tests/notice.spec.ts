import { test, expect } from '@playwright/test';

test.describe('Notice Developer Challenge E2E', () => {
  test('Should successfully register a new notice and parse the description payload correctly', async ({ page }) => {
    // Navigate and Login
    await page.goto('http://localhost:5173/auth/login');
    
    // Fill credentials using exact labels from the login-form component
    await page.getByLabel('Username').fill('admin@school-admin.com');
    await page.getByLabel('Password').fill('3OU4zn3q6Zh9');
    await page.getByRole('button', { name: /Sign In/i }).click();

    // Verify successful auth strictly through the network response instead of guessing DOM text
    await page.waitForResponse(res => res.url().includes('/api/v1/auth/login') && res.status() === 200);
    
    // Navigate via the dynamic sidebar to avoid wiping Redux state with a hard page reload
    await page.getByText('Communication').first().click();
    await page.getByText('Add Notice').first().click();

    // Use accessible labeling mapped down onto the raw <input> tags for stable identification
    await page.getByRole('textbox', { name: /Title/i }).fill('E2E Automated Description Test');
    await page.getByRole('textbox', { name: /Description/i }).fill('This confirms our Zod Schema parsing modification correctly submits the form object to the backend instance!');
    // Fill required fields to pass Zod schema
    await page.getByLabel('Status').click();
    await page.getByRole('option', { name: 'Draft' }).click();

    // Submit
    await page.getByRole('button', { name: 'Save' }).click();

    // Assert that we achieved the success Toast confirmation rather than silent failure from Zod
    await expect(page.getByText('Notice added successfully')).toBeVisible({ timeout: 8000 });
  });
});
