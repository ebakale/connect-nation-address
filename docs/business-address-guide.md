# Biakam National Address System - Business Address Guide

## Overview

This guide explains how to register and manage business addresses in the Biakam National Address System. Business addresses are part of the NAR (National Address Registry) module and appear in the public Business Directory.

---

## Business Address Types

### Address Type Classifications

| Type | Code | Description | Example |
|------|------|-------------|---------|
| Commercial | `COMMERCIAL` | Retail and commercial establishments | Shops, stores, malls |
| Headquarters | `HEADQUARTERS` | Company main offices | Corporate HQ |
| Branch | `BRANCH` | Branch offices | Bank branches |
| Warehouse | `WAREHOUSE` | Storage and distribution | Logistics centers |
| Industrial | `INDUSTRIAL` | Manufacturing facilities | Factories |
| Government | `GOVERNMENT` | Government buildings | Ministries |

### Business Categories

| Category | Description | Examples |
|----------|-------------|----------|
| `retail` | Retail shops and stores | Supermarkets, boutiques |
| `restaurant` | Food and beverage | Restaurants, cafes, bars |
| `healthcare` | Medical services | Hospitals, clinics, pharmacies |
| `education` | Educational institutions | Schools, universities |
| `government` | Government services | Ministries, municipal offices |
| `financial` | Financial services | Banks, insurance, microfinance |
| `hospitality` | Accommodation | Hotels, hostels, resorts |
| `professional` | Professional services | Law firms, accounting |
| `industrial` | Manufacturing | Factories, workshops |
| `religious` | Religious institutions | Churches, mosques |
| `entertainment` | Entertainment venues | Cinemas, sports facilities |
| `transportation` | Transport services | Bus stations, airports |
| `utilities` | Utility providers | Water, electricity |
| `nonprofit` | Non-profit organizations | NGOs, charities |
| `other` | Other categories | Mixed use, unclassified |

---

## Registration Process

### Step 1: Access Business Registration

**Option A: Via Unified Address Request**
1. Log in to Citizen Portal
2. Click "Request Address"
3. Select "Register Business"

**Option B: Via My Businesses**
1. Log in to Citizen Portal
2. Navigate to "My Businesses"
3. Click "Add New Business"

### Step 2: Select Address

Choose how to link your business to an address:

**Use Existing Address:**
- Search by UAC code
- Search by location/map
- Browse verified addresses

**Request New Address:**
- If business location not in system
- Submits NAR request first
- Business registration proceeds after address approval

### Step 3: Business Information

**Required Fields:**
- Organization Name
- Business Category

**Optional Fields:**
- Business Address Type
- Business Registration Number
- Tax Identification Number (NIF)

### Step 4: Contact Information

**Required:**
- Primary Contact Name
- Primary Contact Phone
- Primary Contact Email

**Optional:**
- Secondary Contact Phone
- Website URL

### Step 5: Business Details

- Employee Count
- Customer Capacity
- Parking Available (Yes/No)
  - If yes: Parking Capacity
- Wheelchair Accessible (Yes/No)
- Public Service (Yes/No)
- Appointment Required (Yes/No)
- Services Offered (multi-select)

### Step 6: Operating Hours

For each day of the week:
- Opening Time
- Closing Time
- Or mark as "Closed"

Languages Spoken (multi-select):
- Spanish
- French
- English
- Other local languages

### Step 7: Visibility Settings

- **Publicly Visible**: Show in Business Directory?
- **Show on Maps**: Display location on maps?
- **Show Contact Info**: Display phone/email publicly?

### Step 8: Submit

Review all information and submit for approval.

---

## Approval Process

### Verification Steps

1. **Information Completeness**
   - Organization name provided
   - Business category selected
   - Contact information valid

2. **Address Validation**
   - Address exists in NAR (or approved)
   - Location accurate

3. **Business Verification** (optional)
   - Registration number valid
   - Tax ID valid

### Approval Timeline

- Standard review: 3-5 business days
- Expedited (government): 1-2 business days

### After Approval

- Business appears in directory
- Address marked as public
- UAC code assigned (if new address)
- Owner notified via email

---

## Managing Your Business

### Viewing Business Details

1. Navigate to "My Businesses"
2. Click on business card to expand
3. View all registered information

### Editing Business Information

1. Click "Edit" on business card
2. Modify allowed fields:
   - Contact information
   - Operating hours
   - Services offered
   - Visibility settings
3. Submit changes

**Note:** Some fields require re-verification:
- Organization name
- Business category
- Address change

### Deleting a Business

1. Click "Delete" on business card
2. Confirm deletion
3. Business removed from directory
4. Address remains in NAR

---

## Business Directory

### Public Access

The Business Directory is accessible:
- Without authentication (public)
- Via Public Portal
- Via Citizen Portal

### Search Features

**Filter by:**
- Business Category
- Location (Region/City)
- Services Offered
- Operating Hours

**Sort by:**
- Name (A-Z)
- Category
- Location
- Recently Added

### Directory Display

Each listing shows:
- Business Name
- Category
- Address (UAC)
- Contact Info (if enabled)
- Operating Hours
- Map Location

---

## Best Practices

### Registration Tips

1. **Accurate Information**
   - Use official business name
   - Verify contact details
   - Check operating hours

2. **Complete Profile**
   - Add all services offered
   - List languages spoken
   - Include accessibility info

3. **Quality Photos**
   - Clear storefront image
   - Interior photos (optional)
   - Signage visible

### Visibility Recommendations

**Recommended Settings:**
- `publicly_visible: true` - Appear in directory
- `show_on_maps: true` - Help customers find you
- `show_contact_info: true` - Enable inquiries

**Privacy Option:**
- `publicly_visible: false` - Private listing
- Use for: Internal offices, warehouses

---

## Troubleshooting

### Common Issues

**Business Not Appearing in Directory**

Causes:
- Pending approval
- `publicly_visible: false`
- Address not verified

Solutions:
1. Check approval status in "My Businesses"
2. Verify visibility settings
3. Wait for address verification

**Cannot Edit Business**

Causes:
- Not the owner
- Pending verification
- System error

Solutions:
1. Log in with owner account
2. Wait for verification to complete
3. Contact support

**Address Not Found**

Causes:
- Address not in NAR
- Address not verified

Solutions:
1. Request new address via NAR workflow
2. Wait for address approval
3. Then complete business registration

---

## API Integration

### Partner Access

Partners can access business directory via API:

```typescript
// Search businesses
const { data, error } = await supabase
  .from('organization_addresses')
  .select(`
    *,
    address:addresses(*)
  `)
  .eq('publicly_visible', true)
  .eq('business_category', 'restaurant')
  .limit(50);
```

### Webhook Notifications

Partners can subscribe to business updates:
- New business registered
- Business updated
- Business removed

---

## Support

### Contact Information

- **Business Registration Support**: business@biakam.gq
- **Technical Support**: tech-support@biakam.gq
- **General Inquiries**: info@biakam.gq

### FAQ

**Q: How long does approval take?**
A: Standard review is 3-5 business days.

**Q: Can I register multiple businesses?**
A: Yes, there is no limit on business registrations per user.

**Q: Is there a fee for registration?**
A: No, business registration is free.

**Q: Can I change my business address?**
A: Yes, submit an address change request. Requires re-verification.

---

*Last Updated: March 2026*
*Version: 1.1*
