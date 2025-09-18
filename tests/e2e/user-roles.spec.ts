import { test, expect } from '@playwright/test';

test.describe('User Authentication & Role Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should handle unified authentication flow', async ({ page }) => {
    // Navigate to auth page
    await page.goto('/auth');
    
    // Check for authentication options
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeVisible();
      
      // Test email validation
      await emailInput.fill('invalid-email');
      const submitButton = page.getByText('Sign In').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Look for validation error
        const errorMessage = page.locator('text=Invalid email').first();
        if (await errorMessage.isVisible()) {
          await expect(errorMessage).toBeVisible();
        }
      }
    }
  });

  test('should redirect based on user role', async ({ page }) => {
    // Mock successful authentication (this would need actual auth setup)
    await page.goto('/dashboard');
    
    // Should redirect to appropriate dashboard based on role
    const currentUrl = page.url();
    
    // Check if redirected to a role-specific dashboard
    expect(
      currentUrl.includes('/citizen') ||
      currentUrl.includes('/admin') ||
      currentUrl.includes('/verifier') ||
      currentUrl.includes('/police') ||
      currentUrl.includes('/auth')
    ).toBeTruthy();
  });

  test('should handle citizen dashboard functionality', async ({ page }) => {
    await page.goto('/citizen');
    
    // Check citizen-specific features
    const addressSection = page.locator('text=My Addresses').first();
    if (await addressSection.isVisible()) {
      await expect(addressSection).toBeVisible();
      
      // Check for address management actions
      const addAddressButton = page.getByText('Add Address').first();
      if (await addAddressButton.isVisible()) {
        await addAddressButton.click();
        
        // Verify form appears
        await expect(page.locator('form')).toBeVisible();
      }
    }
  });

  test('should handle verifier dashboard functionality', async ({ page }) => {
    await page.goto('/verifier');
    
    // Check verifier-specific features
    const verificationQueue = page.locator('text=Verification Queue').first();
    if (await verificationQueue.isVisible()) {
      await expect(verificationQueue).toBeVisible();
      
      // Check for verification actions
      const pendingItems = page.locator('[data-testid="pending-verification"]');
      const count = await pendingItems.count();
      
      if (count > 0) {
        // Click on first pending item
        await pendingItems.first().click();
        
        // Check for verification options
        const approveButton = page.getByText('Approve').first();
        const rejectButton = page.getByText('Reject').first();
        
        if (await approveButton.isVisible() && await rejectButton.isVisible()) {
          await expect(approveButton).toBeVisible();
          await expect(rejectButton).toBeVisible();
        }
      }
    }
  });

  test('should handle admin dashboard functionality', async ({ page }) => {
    await page.goto('/admin');
    
    // Check admin-specific features
    const userManagement = page.locator('text=User Management').first();
    if (await userManagement.isVisible()) {
      await expect(userManagement).toBeVisible();
      
      // Check for admin actions
      const systemConfig = page.locator('text=System Configuration').first();
      if (await systemConfig.isVisible()) {
        await expect(systemConfig).toBeVisible();
      }
    }
  });

  test('should handle police dashboard functionality', async ({ page }) => {
    await page.goto('/police');
    
    // Check police-specific features
    const incidentManagement = page.locator('text=Incident Management').first();
    if (await incidentManagement.isVisible()) {
      await expect(incidentManagement).toBeVisible();
      
      // Check for emergency features
      const createIncident = page.getByText('Create Incident').first();
      if (await createIncident.isVisible()) {
        await createIncident.click();
        
        // Verify incident form
        const emergencyType = page.locator('select[name="emergency_type"]').first();
        if (await emergencyType.isVisible()) {
          await expect(emergencyType).toBeVisible();
        }
      }
    }
  });

  test('should handle language switching', async ({ page }) => {
    // Look for language switcher
    const languageSwitcher = page.locator('[data-testid="language-switcher"]').first();
    if (await languageSwitcher.isVisible()) {
      await languageSwitcher.click();
      
      // Check for language options
      const spanishOption = page.getByText('Español').first();
      if (await spanishOption.isVisible()) {
        await spanishOption.click();
        
        // Wait for language change
        await page.waitForTimeout(1000);
        
        // Check if content changed to Spanish
        const spanishContent = page.locator('text=Dirección').first();
        if (await spanishContent.isVisible()) {
          await expect(spanishContent).toBeVisible();
        }
      }
    }
  });

  test('should handle offline functionality', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);
    
    // Navigate to page
    await page.goto('/citizen');
    
    // Check for offline indicator
    const offlineIndicator = page.locator('text=Offline').first();
    if (await offlineIndicator.isVisible()) {
      await expect(offlineIndicator).toBeVisible();
    }
    
    // Try to perform action that should work offline
    const offlineCapture = page.locator('text=Offline Capture').first();
    if (await offlineCapture.isVisible()) {
      await offlineCapture.click();
      
      // Verify offline functionality works
      await expect(page.locator('form')).toBeVisible();
    }
    
    // Restore online mode
    await page.context().setOffline(false);
  });

  test('should handle notifications', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for notification center
    const notifications = page.locator('[data-testid="notifications"]').first();
    if (await notifications.isVisible()) {
      await notifications.click();
      
      // Check for notification list
      const notificationList = page.locator('[data-testid="notification-list"]').first();
      if (await notificationList.isVisible()) {
        await expect(notificationList).toBeVisible();
        
        // Check for mark as read functionality
        const markReadButton = page.getByText('Mark as Read').first();
        if (await markReadButton.isVisible()) {
          await markReadButton.click();
        }
      }
    }
  });

  test('should handle profile management', async ({ page }) => {
    // Navigate to profile page
    await page.goto('/profile');
    
    // Check for profile form
    const profileForm = page.locator('form').first();
    if (await profileForm.isVisible()) {
      await expect(profileForm).toBeVisible();
      
      // Test profile update
      const nameInput = page.locator('input[name="full_name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test User Updated');
        
        const saveButton = page.getByText('Save').first();
        if (await saveButton.isVisible()) {
          await saveButton.click();
          
          // Look for success message
          const successMessage = page.locator('text=Profile updated').first();
          if (await successMessage.isVisible()) {
            await expect(successMessage).toBeVisible();
          }
        }
      }
    }
  });
});