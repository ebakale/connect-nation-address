# Test Suite for ConnectNation Address Management System

This directory contains comprehensive tests for the CAR (Citizen Address Registry) module and related functionality.

## Test Structure

### Unit Tests (`unit/`)
SQL-based unit tests for RPC functions using pgTAP framework:

- `rpc_functions_test.sql` - Tests core RPC functions like UAC generation, completeness scoring
- `address_management_test.sql` - Tests address approval, rejection, and flagging functions  
- `verification_privacy_test.sql` - Tests verification workflows and privacy consent functions

### E2E Tests (`e2e/`)
Playwright-based end-to-end tests covering user workflows:

- `address-management.spec.ts` - Tests address registration, search, and management flows
- `user-roles.spec.ts` - Tests role-based access and authentication workflows
- `api-integration.spec.ts` - Tests external API endpoints and webhook functionality

## Running Tests

### Prerequisites
```bash
# Install Playwright
npm run test:setup

# Ensure Supabase CLI is installed
npm install -g supabase
```

### Unit Tests
```bash
# Run all unit tests
npm run test:unit

# Run specific test file
supabase test db --file tests/unit/rpc_functions_test.sql
```

### E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run with UI for debugging
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e:headed

# Run specific test file
npx playwright test address-management.spec.ts
```

### All Tests
```bash
# Run complete test suite
npm run test:all
```

## Test Configuration

### Environment Variables
Set these for E2E API testing:
- `PLAYWRIGHT_TEST_BASE_URL` - Base URL for the application
- `TEST_API_KEY` - API key for external API testing

### Database Setup
Unit tests use transaction rollbacks to maintain clean state. They create and clean up test data automatically.

### Browser Configuration
E2E tests run against:
- Desktop: Chrome, Firefox, Safari
- Mobile: Chrome (Pixel 5), Safari (iPhone 12)

## Test Coverage

### Functional Areas Covered

**Address Management:**
- Address registration and validation
- UAC generation and lookup
- Duplicate detection
- Completeness scoring

**User Authentication & Roles:**
- Role-based access control
- Dashboard navigation
- Authentication flows

**API Integration:**
- REST endpoint functionality
- Webhook delivery
- External system integration
- Error handling

**Data Quality:**
- Coordinate validation
- Address standardization
- Analytics calculation

### RPC Functions Tested
- `calculate_completeness_score()`
- `generate_unified_uac_unique()`
- `has_role()` / `has_role_with_scope()`
- `check_address_duplicates()`
- `approve_address_request()` / `reject_address_request_with_feedback()`
- `flag_address_for_review()`
- `set_primary_address()` / `add_secondary_address()`
- `initiate_residency_verification()` / `record_privacy_consent()`

## Debugging Tests

### Unit Test Debugging
```sql
-- Add debug output in test files
SELECT diag('Debug message: ' || variable_name);
```

### E2E Test Debugging
```bash
# Run with debug mode
DEBUG=pw:api npx playwright test

# Generate trace files
npx playwright test --trace on

# View test results
npx playwright show-report
```

## Maintenance

### Adding New Tests
1. For RPC functions: Add to appropriate unit test file in `unit/`
2. For user workflows: Add to appropriate E2E test file in `e2e/`
3. Follow existing naming conventions and structure

### Test Data Management
- Unit tests: Use transaction rollbacks, create minimal test data
- E2E tests: Use page object pattern for reusable components
- Mock external dependencies when possible

### CI/CD Integration
Tests are configured for continuous integration with:
- Parallel execution in CI
- Retry logic for flaky tests
- Artifact collection on failure