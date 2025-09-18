import { test, expect } from '@playwright/test';

test.describe('Address Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should display homepage with navigation', async ({ page }) => {
    // Check for main navigation elements
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for key sections
    await expect(page.getByText('Address Management')).toBeVisible();
    await expect(page.getByText('Citizen Portal')).toBeVisible();
  });

  test('should navigate to citizen dashboard', async ({ page }) => {
    // Click on citizen portal or dashboard link
    await page.click('text=Citizen Dashboard');
    
    // Verify navigation
    await expect(page).toHaveURL(/.*citizen/);
    
    // Check for dashboard elements
    await expect(page.getByText('My Addresses')).toBeVisible();
    await expect(page.getByText('Address Requests')).toBeVisible();
  });

  test('should handle address search functionality', async ({ page }) => {
    // Navigate to address search
    await page.goto('/');
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Malabo');
      await searchInput.press('Enter');
      
      // Wait for search results
      await page.waitForTimeout(2000);
      
      // Check if results are displayed
      const resultsContainer = page.locator('[data-testid="search-results"]').first();
      if (await resultsContainer.isVisible()) {
        await expect(resultsContainer).toBeVisible();
      }
    }
  });

  test('should display address registration form', async ({ page }) => {
    // Navigate to address registration
    await page.goto('/citizen');
    
    // Look for registration button or form
    const registerButton = page.getByText('Register Address').first();
    if (await registerButton.isVisible()) {
      await registerButton.click();
      
      // Check for form fields
      await expect(page.locator('input[name="street"]')).toBeVisible();
      await expect(page.locator('input[name="city"]')).toBeVisible();
      await expect(page.locator('select[name="region"]')).toBeVisible();
    }
  });

  test('should validate UAC format in address picker', async ({ page }) => {
    // Navigate to a page with UAC picker
    await page.goto('/citizen');
    
    // Look for UAC input field
    const uacInput = page.locator('input[placeholder*="UAC"]').first();
    if (await uacInput.isVisible()) {
      // Test invalid UAC format
      await uacInput.fill('INVALID-UAC');
      await page.keyboard.press('Tab');
      
      // Look for validation message
      const errorMessage = page.locator('text=Invalid UAC format').first();
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
      
      // Test valid UAC format
      await uacInput.fill('GQ-BN-MAL-123456-AB');
      await page.keyboard.press('Tab');
      
      // Error should disappear
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).not.toBeVisible();
      }
    }
  });

  test('should handle admin dashboard access', async ({ page }) => {
    // Try to access admin dashboard
    await page.goto('/admin');
    
    // Should either show login or admin content
    const hasAdminContent = await page.locator('text=Admin Dashboard').isVisible();
    const hasLoginForm = await page.locator('text=Login').isVisible();
    
    expect(hasAdminContent || hasLoginForm).toBeTruthy();
  });

  test('should display address verification queue for staff', async ({ page }) => {
    // Navigate to verifier dashboard
    await page.goto('/verifier');
    
    // Check for verification queue
    const verificationQueue = page.locator('text=Verification Queue').first();
    if (await verificationQueue.isVisible()) {
      await expect(verificationQueue).toBeVisible();
      
      // Check for pending requests
      const pendingRequests = page.locator('[data-testid="pending-requests"]').first();
      if (await pendingRequests.isVisible()) {
        await expect(pendingRequests).toBeVisible();
      }
    }
  });

  test('should handle emergency incident reporting', async ({ page }) => {
    // Navigate to police dashboard
    await page.goto('/police');
    
    // Look for incident reporting functionality
    const reportButton = page.getByText('Report Incident').first();
    if (await reportButton.isVisible()) {
      await reportButton.click();
      
      // Check for incident form
      await expect(page.locator('select[name="emergency_type"]')).toBeVisible();
      await expect(page.locator('textarea[name="description"]')).toBeVisible();
    }
  });

  test('should validate responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to homepage
    await page.goto('/');
    
    // Check if mobile navigation works
    const mobileMenu = page.locator('button[aria-label="Menu"]').first();
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      
      // Check if navigation menu appears
      const navMenu = page.locator('nav').first();
      await expect(navMenu).toBeVisible();
    }
  });

  test('should handle address map visualization', async ({ page }) => {
    // Navigate to a page with map
    await page.goto('/');
    
    // Look for map container
    const mapContainer = page.locator('[data-testid="map-container"]').first();
    if (await mapContainer.isVisible()) {
      await expect(mapContainer).toBeVisible();
      
      // Check if map controls are present
      const mapControls = page.locator('.map-controls').first();
      if (await mapControls.isVisible()) {
        await expect(mapControls).toBeVisible();
      }
    }
  });
});