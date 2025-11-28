# API Information - DAPOGIZI Backend - ARI - Update Vendor, Update Meal Plan, Uploads

**Base URL:** `http://localhost:{PORT}`

## Authentication

All endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer {token}
```

Vendors must be authenticated with the vendor role.

## Planned Features

### 1. Add Vendor Data

**Endpoint:** `PUT /vendor/profile`

**Description:** Allows vendors to update their operational details, including operating days, location (with geocoding via Geoapify), and target school information.

**Authentication:** Required (Vendor role)

**Request Body:**

```json
{
  "vendor_name": "Vendor Gaib",
  "address": "Jln. Tebet Barat",
  "operating_days": ["Monday", "Tuesday", "Wednesday"]
  "kitchen_photos": "https.kitchen.jpg"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "target_schools": {
    [
    "name": "SDN 123",
    "address": "Jln. Tebet",
    "location": [
        "type": "Point",
        "coordinate":[
            "XXXXXXXXX",
            "YYYYYYYYY"
        ]
  ],
  "geoapify_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    ]
}
  {
  "sekolah 2"
  }

  {
  "sekolah 3"
  }
}
```

**Error Responses:**

- 400 - Invalid address or geocoding failure
- 401 - No token provided / Invalid token
- 403 - Not a vendor
- 500 - Server error or Geoapify API issue

### 2. Add & Update Meal Plan

#### Add Meal Plan
**Endpoint:** `POST /vendor/meal-plans

**Description:** Allows vendors to ADD a meal plan.

**Authentication:** Required (Vendor role)

**URL Parameters:**

- `mealPlanId`: ID of the meal plan to update

**Request Body (JSON) and Multipart (for photo):**

**JSON fields (optional):**

```json
{
  "name": "Meal Plan 1",
  "description": "Sehat dan Bergizi",
  "image_url": "https.makanan.jpg"
}
```

**Success Response (200):**

```json
{
  "success": true,
  ...
}
```

#### Update Meal Plan
**Endpoint:** `PUT /vendor/meal-plans/:meal_id

**Description:** Allows vendors to update details of an existing meal plan, including nutritional info (e.g., protein), description, and meal photo.

**Authentication:** Required (Vendor role)

**URL Parameters:**

- `mealPlanId`: ID of the meal plan to update

**Request Body (JSON) and Multipart (for photo):**

**JSON fields (optional):**

```json
{
  "name": "Meal Plan 2",
  "description": "Sehat dan Enak",
  "image_url": "https.makanan.jpg",
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
