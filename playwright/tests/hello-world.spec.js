const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Hello World Page', () => {
  test('should display hello world message', async ({ page }) => {
    // Navigate to our local HTML file
    const filePath = path.join(__dirname, '..', 'hello.html');
    await page.goto(`file://${filePath}`);

    // Check that the page title is correct
    await expect(page).toHaveTitle('Hello World');

    // Check that the main heading is visible
    await expect(page.getByRole('heading', { name: 'Hello World!' })).toBeVisible();

    // Check that the welcome message is visible
    await expect(page.getByText('Welcome to our simple Hello World page.')).toBeVisible();

    // Check that the button is visible
    await expect(page.getByRole('button', { name: 'Click Me!' })).toBeVisible();
  });

  test('should show message when button is clicked', async ({ page }) => {
    // Navigate to our local HTML file
    const filePath = path.join(__dirname, '..', 'hello.html');
    await page.goto(`file://${filePath}`);

    // Click the button
    await page.getByRole('button', { name: 'Click Me!' }).click();

    // Check that the JavaScript message appears
    await expect(page.locator('#message')).toHaveText('Hello from JavaScript!');
  });

  test('should have proper styling', async ({ page }) => {
    // Navigate to our local HTML file
    const filePath = path.join(__dirname, '..', 'hello.html');
    await page.goto(`file://${filePath}`);

    // Check that the container has the expected background color
    const container = page.locator('.container');
    await expect(container).toHaveCSS('background-color', 'rgb(255, 255, 255)');

    // Check that the button has the expected background color
    const button = page.getByRole('button', { name: 'Click Me!' });
    await expect(button).toHaveCSS('background-color', 'rgb(0, 124, 186)');
  });
});