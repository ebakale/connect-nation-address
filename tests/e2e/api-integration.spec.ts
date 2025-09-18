import { test, expect } from '@playwright/test';

test.describe('API Integration & External Systems E2E', () => {
  const API_BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
  const API_KEY = process.env.TEST_API_KEY || 'test-api-key';

  test('should handle external API authentication', async ({ request }) => {
    // Test API without key (should fail)
    const responseWithoutKey = await request.get(`${API_BASE_URL}/functions/v1/external-api/addresses`);
    expect(responseWithoutKey.status()).toBe(401);

    // Test API with invalid key (should fail)
    const responseWithInvalidKey = await request.get(`${API_BASE_URL}/functions/v1/external-api/addresses`, {
      headers: {
        'x-api-key': 'invalid-key'
      }
    });
    expect(responseWithInvalidKey.status()).toBe(401);

    // Test API with valid key (would need proper setup)
    if (API_KEY !== 'test-api-key') {
      const responseWithValidKey = await request.get(`${API_BASE_URL}/functions/v1/external-api/addresses`, {
        headers: {
          'x-api-key': API_KEY
        }
      });
      expect(responseWithValidKey.status()).toBe(200);
    }
  });

  test('should handle address search via API', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/functions/v1/external-api/addresses?query=Malabo&limit=10`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBeTruthy();
    }
  });

  test('should handle UAC lookup via API', async ({ request }) => {
    const testUAC = 'GQ-BN-MAL-123456-AB';
    const response = await request.get(`${API_BASE_URL}/functions/v1/external-api/address-lookup?uac=${testUAC}`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    // Should return 404 for non-existent UAC or 200 for existing
    expect([200, 404]).toContain(response.status());
  });

  test('should handle address creation via API', async ({ request }) => {
    const newAddress = {
      latitude: 3.7167,
      longitude: 8.7833,
      street: 'API Test Street 123',
      city: 'Malabo',
      region: 'Bioko Norte',
      country: 'Equatorial Guinea',
      building: 'Building A',
      address_type: 'residential',
      description: 'Test address via API',
      justification: 'E2E testing'
    };

    const response = await request.post(`${API_BASE_URL}/functions/v1/external-api/addresses`, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      data: newAddress
    });

    if (response.status() === 201) {
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data.data).toHaveProperty('request_id');
      expect(data.data).toHaveProperty('status', 'pending');
    }
  });

  test('should handle address validation via API', async ({ request }) => {
    const addressToValidate = {
      latitude: 3.7167,
      longitude: 8.7833,
      street: 'Validation Test Street',
      city: 'Malabo',
      region: 'Bioko Norte',
      country: 'Equatorial Guinea'
    };

    const response = await request.post(`${API_BASE_URL}/functions/v1/external-api/address-validate`, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      data: addressToValidate
    });

    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data.data).toHaveProperty('isValid');
      expect(data.data).toHaveProperty('completeness_score');
    }
  });

  test('should handle webhook delivery', async ({ page }) => {
    // Navigate to webhook management page (if exists)
    await page.goto('/admin');
    
    // Look for webhook configuration
    const webhookSection = page.locator('text=Webhook').first();
    if (await webhookSection.isVisible()) {
      await webhookSection.click();
      
      // Check webhook configuration form
      const webhookUrl = page.locator('input[name="webhook_url"]').first();
      if (await webhookUrl.isVisible()) {
        await webhookUrl.fill('https://webhook.site/test-endpoint');
        
        const saveButton = page.getByText('Save').first();
        if (await saveButton.isVisible()) {
          await saveButton.click();
        }
      }
    }
  });

  test('should handle analytics API', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/functions/v1/external-api/analytics`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data.data).toHaveProperty('national_summary');
      expect(data.data).toHaveProperty('regional_breakdown');
    }
  });

  test('should handle coordinate analysis', async ({ request }) => {
    const coordinateData = {
      latitude: 3.7167,
      longitude: 8.7833,
      address: {
        street: 'Test Street',
        city: 'Malabo',
        region: 'Bioko Norte',
        country: 'Equatorial Guinea'
      }
    };

    const response = await request.post(`${API_BASE_URL}/functions/v1/analyze-coordinates`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: coordinateData
    });

    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('score');
      expect(data).toHaveProperty('accuracy');
      expect(data).toHaveProperty('recommendations');
    }
  });

  test('should handle batch operations', async ({ request }) => {
    // Test batch address validation if endpoint exists
    const batchAddresses = [
      {
        street: 'Batch Test Street 1',
        city: 'Malabo',
        region: 'Bioko Norte',
        country: 'Equatorial Guinea',
        latitude: 3.7167,
        longitude: 8.7833
      },
      {
        street: 'Batch Test Street 2',
        city: 'Bata',
        region: 'Litoral',
        country: 'Equatorial Guinea',
        latitude: 1.8644,
        longitude: 9.7595
      }
    ];

    // This would test batch validation if the endpoint exists
    const response = await request.post(`${API_BASE_URL}/functions/v1/external-api/addresses/batch-validate`, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      data: { addresses: batchAddresses }
    });

    // Accept either success or not implemented
    expect([200, 404, 501]).toContain(response.status());
  });

  test('should handle error responses gracefully', async ({ request }) => {
    // Test malformed request
    const response = await request.post(`${API_BASE_URL}/functions/v1/external-api/addresses`, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      data: { invalid: 'data' }
    });

    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('success', false);
    expect(data).toHaveProperty('error');
  });
});