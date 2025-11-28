# API Information - DAPOGIZI Backend - ARI - Update Vendor, Update Meal Plan, Uploads

**Base URL:** `http://localhost:{PORT}`

## Authentication

All endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer {token}
```

Vendors must be authenticated with the vendor role.

## Planned Features

### 1. Update Vendor Data

**Endpoint:** `PUT /vendor/update-data`

**Description:** Allows vendors to update their operational details, including operating days, location (with geocoding via Geoapify), and target school information.

**Authentication:** Required (Vendor role)

**Request Body:**

```json
{
  "vendor_name": "Vendor Gaib",
  "address": "Jln. Tebet Barat",
  "operating_days": ["Monday", "Tuesday", "Wednesday"]
}
```

**Success Response (200):**

```json
{
  "success": true,
  ...
}
```

**Error Responses:**

- 400 - Invalid address or geocoding failure
- 401 - No token provided / Invalid token
- 403 - Not a vendor
- 500 - Server error or Geoapify API issue

### 2. Update Kitchen Photo

**Endpoint:** `PUT /vendor/update-kitchen-photo`

**Description:** Allows vendors to upload or update a photo of their kitchen for cleanliness verification or admin review.

**Authentication:** Required (Vendor role)

**Request:** Multipart/form-data (for file upload)

**Form Data:**

- `kitchen_photo`: File (image, JPG, max 3MB)

**Success Response (200):**

```json
{
  "success": true,
  ...
}
```

**Error Responses:**

- 400 - Invalid file type/size
- 401 - No token provided / Invalid token
- 403 - Not a vendor
- 500 - Upload failure

### 3. Update Meal Plan

**Endpoint:** `PUT /vendor/update-meal-plan/:mealPlanId`

**Description:** Allows vendors to update details of an existing meal plan, including nutritional info (e.g., protein), description, and meal photo.

**Authentication:** Required (Vendor role)

**URL Parameters:**

- `mealPlanId`: ID of the meal plan to update

**Request Body (JSON) and Multipart (for photo):**

**JSON fields (optional):**

```json
{
  "name": "Meal Plan 1",
  "description": "Sehat dan Bergizi",
  "overall_calories": "310",
  "protein": "10",
  "fat": "10",
  "carbs": "10",
  "sugar": "10",
  "fiber": "10"
}
```

**Multipart:** `meal_photo`: File (image for the meal, JPG, max 3MB)

**Success Response (200):**

```json
{
  "success": true,
  ...
}
```

**Error Responses:**

- 400 - Invalid nutritional values or file
- 401 - No token provided / Invalid token
- 403 - Not the owner or not a vendor
- 404 - Meal plan not found
- 500 - Server error
