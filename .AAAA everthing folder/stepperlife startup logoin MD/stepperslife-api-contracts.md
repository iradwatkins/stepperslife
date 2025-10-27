# SteppersLife Ecosystem - API Contracts & Webhook Specifications

**Version:** 1.0  
**Purpose:** Define all API contracts and webhook payloads between platforms

---

## Table of Contents

1. [API Contract Overview](#api-contract-overview)
2. [Restaurant SaaS APIs](#restaurant-saas-apis)
3. [Events Platform APIs](#events-platform-apis)
4. [Store Marketplace APIs](#store-marketplace-apis)
5. [Classes Platform APIs](#classes-platform-apis)
6. [Services Directory APIs](#services-directory-apis)
7. [Magazine APIs](#magazine-apis)
8. [Webhook Specifications](#webhook-specifications)
9. [Authentication & Security](#authentication--security)
10. [Error Handling](#error-handling)

---

## API Contract Overview

### Architecture Pattern

```
Main Site (stepperslife.com)
    ↓ Consumes APIs from
    ↓
SaaS Platforms (restaurants, events, store, classes, services, magazine)
    ↓ Send webhooks to
    ↓
Main Site (stepperslife.com)
```

### Base URLs

```
Production:
- Main Site: https://stepperslife.com/api
- Restaurants: https://restaurants.stepperslife.com/api
- Events: https://events.stepperslife.com/api
- Store: https://store.stepperslife.com/api
- Classes: https://classes.stepperslife.com/api
- Services: https://services.stepperslife.com/api
- Magazine: https://magazine.stepperslife.com/api

Development:
- Main Site: http://localhost:3001/api
- Restaurants: http://localhost:3002/api
- Events: http://localhost:3003/api
- Store: http://localhost:3004/api
- Classes: http://localhost:3005/api
- Services: http://localhost:3006/api
- Magazine: http://localhost:3007/api
```

### Common Headers

```http
# All API requests should include:
Content-Type: application/json
Accept: application/json

# For authenticated endpoints:
Authorization: Bearer {nextauth_jwt_token}

# For webhook verification:
X-Webhook-Signature: {hmac_sha256_signature}
X-Webhook-Timestamp: {unix_timestamp}
```

---

## Restaurant SaaS APIs

### Base URL: `https://restaurants.stepperslife.com/api`

---

### 1. List All Restaurants

**Endpoint:** `GET /restaurants`

**Purpose:** Main site fetches all active restaurants to display

**Query Parameters:**
```typescript
{
  cuisine?: string;           // Filter by cuisine type
  acceptingOrders?: boolean;  // Only show restaurants accepting orders
  featured?: boolean;         // Featured restaurants
  limit?: number;             // Default: 50, Max: 100
  offset?: number;            // For pagination
}
```

**Response:** `200 OK`
```json
{
  "restaurants": [
    {
      "id": "rest_abc123",
      "slug": "soul-food-spot",
      "name": "Soul Food Spot",
      "description": "Authentic soul food in the heart of Chicago",
      "cuisine": ["Soul Food", "American"],
      "logoUrl": "https://cdn.stepperslife.com/restaurants/soul-food-spot/logo.jpg",
      "coverImageUrl": "https://cdn.stepperslife.com/restaurants/soul-food-spot/cover.jpg",
      "address": {
        "street": "123 Main St",
        "city": "Chicago",
        "state": "IL",
        "zip": "60601"
      },
      "phone": "(312) 555-1234",
      "email": "info@soulfoodspot.com",
      "acceptingOrders": true,
      "estimatedPickupTime": 30,
      "minimumOrder": 15.00,
      "hours": {
        "monday": { "open": "10:00", "close": "22:00" },
        "tuesday": { "open": "10:00", "close": "22:00" }
        // ... other days
      },
      "averageRating": 4.8,
      "totalReviews": 156,
      "paymentProcessors": ["STRIPE", "PAYPAL"]
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### 2. Get Restaurant Details

**Endpoint:** `GET /restaurants/:slug`

**Purpose:** Get full restaurant details including menu

**Response:** `200 OK`
```json
{
  "restaurant": {
    "id": "rest_abc123",
    "slug": "soul-food-spot",
    "name": "Soul Food Spot",
    // ... all fields from list endpoint
    "menu": [
      {
        "id": "item_xyz789",
        "name": "Fried Chicken Dinner",
        "description": "Our signature fried chicken with two sides",
        "price": 18.99,
        "category": "Entrees",
        "imageUrl": "https://cdn.stepperslife.com/menu/fried-chicken.jpg",
        "available": true,
        "options": [
          {
            "name": "Sides",
            "required": true,
            "max": 2,
            "choices": [
              { "name": "Mac & Cheese", "price": 0 },
              { "name": "Collard Greens", "price": 0 },
              { "name": "Candied Yams", "price": 0 }
            ]
          },
          {
            "name": "Size",
            "required": true,
            "max": 1,
            "choices": [
              { "name": "Regular", "price": 0 },
              { "name": "Large", "price": 3.00 }
            ]
          }
        ]
      }
    ]
  }
}
```

**Error Responses:**
```json
// 404 Not Found
{
  "error": "Restaurant not found",
  "code": "RESTAURANT_NOT_FOUND"
}

// 503 Service Unavailable (restaurant not accepting orders)
{
  "error": "Restaurant is not currently accepting orders",
  "code": "NOT_ACCEPTING_ORDERS",
  "details": {
    "acceptingOrders": false,
    "message": "Closed for the day"
  }
}
```

---

### 3. Create Order

**Endpoint:** `POST /orders`

**Purpose:** Main site creates order after customer checkout

**Request Body:**
```json
{
  "restaurantId": "rest_abc123",
  "customerId": "user_def456",
  "customerName": "John Davis",
  "customerEmail": "john@example.com",
  "customerPhone": "(555) 123-4567",
  "items": [
    {
      "menuItemId": "item_xyz789",
      "name": "Fried Chicken Dinner",
      "price": 18.99,
      "quantity": 2,
      "options": {
        "Sides": ["Mac & Cheese", "Collard Greens"],
        "Size": "Regular"
      },
      "subtotal": 37.98
    }
  ],
  "subtotal": 37.98,
  "tax": 3.80,
  "total": 41.78,
  "pickupTime": "2025-10-07T18:00:00Z",
  "specialInstructions": "Extra crispy please",
  "paymentProcessor": "STRIPE",
  "paymentIntentId": "pi_abc123xyz789",
  "metadata": {
    "source": "stepperslife_main",
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.1"
  }
}
```

**Response:** `201 Created`
```json
{
  "order": {
    "id": "order_ghi789",
    "orderNumber": "SL-REST-12345",
    "restaurantId": "rest_abc123",
    "customerId": "user_def456",
    "customerName": "John Davis",
    "customerEmail": "john@example.com",
    "customerPhone": "(555) 123-4567",
    "items": [ /* same as request */ ],
    "subtotal": 37.98,
    "tax": 3.80,
    "total": 41.78,
    "platformFee": 2.09,
    "restaurantPayout": 39.69,
    "status": "PENDING",
    "pickupTime": "2025-10-07T18:00:00Z",
    "specialInstructions": "Extra crispy please",
    "placedAt": "2025-10-07T17:00:00Z",
    "estimatedReadyTime": "2025-10-07T17:30:00Z"
  }
}
```

**Error Responses:**
```json
// 400 Bad Request - Item unavailable
{
  "error": "Menu item not available",
  "code": "ITEM_UNAVAILABLE",
  "details": {
    "unavailableItems": ["item_xyz789"]
  }
}

// 400 Bad Request - Payment not verified
{
  "error": "Payment verification failed",
  "code": "PAYMENT_NOT_VERIFIED",
  "details": {
    "paymentIntentId": "pi_abc123xyz789",
    "status": "requires_payment_method"
  }
}

// 400 Bad Request - Below minimum order
{
  "error": "Order below minimum",
  "code": "BELOW_MINIMUM",
  "details": {
    "orderTotal": 12.00,
    "minimumRequired": 15.00
  }
}
```

---

### 4. Get Order Status

**Endpoint:** `GET /orders/:id`

**Purpose:** Check order status

**Response:** `200 OK`
```json
{
  "order": {
    "id": "order_ghi789",
    "orderNumber": "SL-REST-12345",
    "status": "READY",
    "placedAt": "2025-10-07T17:00:00Z",
    "confirmedAt": "2025-10-07T17:05:00Z",
    "readyAt": "2025-10-07T17:28:00Z",
    "estimatedReadyTime": "2025-10-07T17:30:00Z",
    "pickupTime": "2025-10-07T18:00:00Z"
  }
}
```

---

## Events Platform APIs

### Base URL: `https://events.stepperslife.com/api`

---

### 1. List All Events

**Endpoint:** `GET /events`

**Query Parameters:**
```typescript
{
  upcoming?: boolean;    // Only future events
  featured?: boolean;    // Featured events only
  startDate?: string;    // ISO date
  endDate?: string;      // ISO date
  limit?: number;        // Default: 50
  offset?: number;
}
```

**Response:** `200 OK`
```json
{
  "events": [
    {
      "id": "event_abc123",
      "slug": "steppin-saturday-oct-2025",
      "title": "Steppin Saturday Night",
      "shortDescription": "Monthly steppin party with DJ Smooth",
      "startDateTime": "2025-10-12T20:00:00Z",
      "endDateTime": "2025-10-13T02:00:00Z",
      "timezone": "America/Chicago",
      "venueName": "Chicago Ballroom",
      "venueAddress": {
        "street": "789 State St",
        "city": "Chicago",
        "state": "IL",
        "zip": "60605"
      },
      "venueCapacity": 500,
      "coverImageUrl": "https://cdn.stepperslife.com/events/steppin-saturday.jpg",
      "organizerName": "Steppin Events LLC",
      "ticketTiers": [
        {
          "id": "tier_xyz789",
          "name": "General Admission",
          "price": 25.00,
          "quantity": 400,
          "sold": 156,
          "available": 244,
          "salesStart": "2025-09-15T00:00:00Z",
          "salesEnd": "2025-10-12T20:00:00Z",
          "isActive": true
        },
        {
          "id": "tier_vip001",
          "name": "VIP",
          "price": 50.00,
          "quantity": 100,
          "sold": 78,
          "available": 22,
          "salesStart": "2025-09-15T00:00:00Z",
          "salesEnd": "2025-10-12T20:00:00Z",
          "isActive": true
        }
      ],
      "totalTicketsSold": 234,
      "isFeatured": true,
      "status": "PUBLISHED"
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### 2. Get Event Details

**Endpoint:** `GET /events/:slug`

**Response:** `200 OK`
```json
{
  "event": {
    "id": "event_abc123",
    "slug": "steppin-saturday-oct-2025",
    "title": "Steppin Saturday Night",
    "description": "Full HTML description...",
    "shortDescription": "Monthly steppin party",
    "startDateTime": "2025-10-12T20:00:00Z",
    "endDateTime": "2025-10-13T02:00:00Z",
    "timezone": "America/Chicago",
    "venueName": "Chicago Ballroom",
    "venueAddress": {
      "street": "789 State St",
      "city": "Chicago",
      "state": "IL",
      "zip": "60605"
    },
    "venueCapacity": 500,
    "coverImageUrl": "https://cdn.stepperslife.com/events/steppin-saturday.jpg",
    "imageGallery": [
      "https://cdn.stepperslife.com/events/gallery1.jpg",
      "https://cdn.stepperslife.com/events/gallery2.jpg"
    ],
    "organizerId": "org_def456",
    "organizerName": "Steppin Events LLC",
    "organizerPhoto": "https://cdn.stepperslife.com/organizers/steppin-events.jpg",
    "ticketTiers": [
      {
        "id": "tier_xyz789",
        "name": "General Admission",
        "description": "Includes entry and one drink ticket",
        "price": 25.00,
        "quantity": 400,
        "sold": 156,
        "available": 244,
        "salesStart": "2025-09-15T00:00:00Z",
        "salesEnd": "2025-10-12T20:00:00Z",
        "minPerOrder": 1,
        "maxPerOrder": 10,
        "isActive": true
      }
    ],
    "totalTicketsSold": 234,
    "totalRevenue": 10450.00,
    "paymentProcessors": ["STRIPE", "PAYPAL"],
    "isFeatured": true,
    "status": "PUBLISHED"
  }
}
```

---

### 3. Purchase Tickets

**Endpoint:** `POST /tickets/purchase`

**Request Body:**
```json
{
  "eventId": "event_abc123",
  "customerId": "user_def456",
  "customerName": "Sarah Johnson",
  "customerEmail": "sarah@example.com",
  "customerPhone": "(555) 987-6543",
  "tickets": [
    {
      "tierId": "tier_xyz789",
      "quantity": 2,
      "holderNames": ["Sarah Johnson", "Mike Davis"]
    },
    {
      "tierId": "tier_vip001",
      "quantity": 1,
      "holderNames": ["Sarah Johnson"]
    }
  ],
  "subtotal": 100.00,
  "fees": 7.50,
  "total": 107.50,
  "paymentProcessor": "STRIPE",
  "paymentIntentId": "pi_xyz789abc123",
  "affiliateCode": "JOHNDOE25",
  "metadata": {
    "source": "stepperslife_main"
  }
}
```

**Response:** `201 Created`
```json
{
  "sale": {
    "id": "sale_jkl012",
    "saleNumber": "SL-EVENT-67890",
    "eventId": "event_abc123",
    "customerId": "user_def456",
    "customerName": "Sarah Johnson",
    "customerEmail": "sarah@example.com",
    "quantity": 3,
    "subtotal": 100.00,
    "fees": 7.50,
    "total": 107.50,
    "platformFee": 7.50,
    "organizerPayout": 92.50,
    "affiliateCommission": 10.00,
    "status": "COMPLETED",
    "purchasedAt": "2025-10-07T15:00:00Z"
  },
  "tickets": [
    {
      "id": "ticket_001",
      "ticketNumber": "SL-EVENT123-0001",
      "tierId": "tier_xyz789",
      "tierName": "General Admission",
      "holderName": "Sarah Johnson",
      "holderEmail": "sarah@example.com",
      "qrCode": "QR_CODE_DATA_BASE64",
      "qrCodeUrl": "https://cdn.stepperslife.com/qr/ticket_001.png",
      "status": "VALID"
    },
    {
      "id": "ticket_002",
      "ticketNumber": "SL-EVENT123-0002",
      "tierId": "tier_xyz789",
      "tierName": "General Admission",
      "holderName": "Mike Davis",
      "holderEmail": "sarah@example.com",
      "qrCode": "QR_CODE_DATA_BASE64",
      "qrCodeUrl": "https://cdn.stepperslife.com/qr/ticket_002.png",
      "status": "VALID"
    },
    {
      "id": "ticket_003",
      "ticketNumber": "SL-EVENT123-0003",
      "tierId": "tier_vip001",
      "tierName": "VIP",
      "holderName": "Sarah Johnson",
      "holderEmail": "sarah@example.com",
      "qrCode": "QR_CODE_DATA_BASE64",
      "qrCodeUrl": "https://cdn.stepperslife.com/qr/ticket_003.png",
      "status": "VALID"
    }
  ]
}
```

**Error Responses:**
```json
// 400 Bad Request - Not enough tickets
{
  "error": "Insufficient tickets available",
  "code": "INSUFFICIENT_TICKETS",
  "details": {
    "requested": {
      "tier_xyz789": 10
    },
    "available": {
      "tier_xyz789": 5
    }
  }
}

// 400 Bad Request - Sales ended
{
  "error": "Ticket sales have ended",
  "code": "SALES_ENDED",
  "details": {
    "salesEndDate": "2025-10-12T20:00:00Z"
  }
}
```

---

## Store Marketplace APIs

### Base URL: `https://store.stepperslife.com/api`

---

### 1. List All Products

**Endpoint:** `GET /products`

**Query Parameters:**
```typescript
{
  category?: string;     // "Clothing", "Shoes", "Accessories"
  storeId?: string;      // Filter by specific vendor
  search?: string;       // Search query
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;     // Only in-stock items
  sort?: string;         // "price_asc", "price_desc", "newest", "popular"
  limit?: number;
  offset?: number;
}
```

**Response:** `200 OK`
```json
{
  "products": [
    {
      "id": "prod_abc123",
      "storeId": "store_def456",
      "storeName": "Steppin Apparel",
      "storeSlug": "steppin-apparel",
      "storeLogo": "https://cdn.stepperslife.com/stores/steppin-apparel/logo.jpg",
      "name": "Chicago Steppin T-Shirt",
      "slug": "chicago-steppin-tshirt",
      "description": "Premium cotton tee with vintage steppin design",
      "price": 29.99,
      "compareAtPrice": 39.99,
      "images": [
        "https://cdn.stepperslife.com/products/tshirt-front.jpg",
        "https://cdn.stepperslife.com/products/tshirt-back.jpg"
      ],
      "category": "Clothing",
      "tags": ["steppin", "vintage", "cotton"],
      "quantity": 50,
      "inStock": true,
      "hasVariants": true,
      "variantOptions": ["Size", "Color"],
      "status": "ACTIVE"
    }
  ],
  "pagination": {
    "total": 125,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 2. Get Product Details

**Endpoint:** `GET /products/:id`

**Response:** `200 OK`
```json
{
  "product": {
    "id": "prod_abc123",
    "storeId": "store_def456",
    "storeName": "Steppin Apparel",
    "storeSlug": "steppin-apparel",
    "name": "Chicago Steppin T-Shirt",
    "slug": "chicago-steppin-tshirt",
    "description": "Full HTML description...",
    "price": 29.99,
    "compareAtPrice": 39.99,
    "sku": "STEP-TS-001",
    "images": [
      "https://cdn.stepperslife.com/products/tshirt-front.jpg",
      "https://cdn.stepperslife.com/products/tshirt-back.jpg",
      "https://cdn.stepperslife.com/products/tshirt-detail.jpg"
    ],
    "category": "Clothing",
    "tags": ["steppin", "vintage", "cotton"],
    "quantity": 50,
    "trackInventory": true,
    "inStock": true,
    "variants": [
      {
        "id": "var_123",
        "name": "Small / Black",
        "options": {
          "Size": "Small",
          "Color": "Black"
        },
        "sku": "STEP-TS-001-SM-BLK",
        "price": 29.99,
        "quantity": 10,
        "available": true,
        "imageUrl": "https://cdn.stepperslife.com/products/tshirt-sm-black.jpg"
      },
      {
        "id": "var_124",
        "name": "Medium / Black",
        "options": {
          "Size": "Medium",
          "Color": "Black"
        },
        "sku": "STEP-TS-001-MD-BLK",
        "price": 29.99,
        "quantity": 15,
        "available": true
      },
      {
        "id": "var_125",
        "name": "Large / Black",
        "options": {
          "Size": "Large",
          "Color": "Black"
        },
        "sku": "STEP-TS-001-LG-BLK",
        "price": 29.99,
        "quantity": 0,
        "available": false
      }
    ],
    "weight": 0.5,
    "requiresShipping": true,
    "status": "ACTIVE"
  }
}
```

---

### 3. Create Order

**Endpoint:** `POST /orders`

**Request Body:**
```json
{
  "storeId": "store_def456",
  "customerId": "user_ghi789",
  "customerName": "Lisa Martinez",
  "customerEmail": "lisa@example.com",
  "customerPhone": "(555) 246-8135",
  "items": [
    {
      "productId": "prod_abc123",
      "variantId": "var_123",
      "name": "Chicago Steppin T-Shirt",
      "variantName": "Small / Black",
      "sku": "STEP-TS-001-SM-BLK",
      "price": 29.99,
      "quantity": 2,
      "imageUrl": "https://cdn.stepperslife.com/products/tshirt-sm-black.jpg",
      "subtotal": 59.98
    }
  ],
  "subtotal": 59.98,
  "shipping": 8.00,
  "tax": 6.00,
  "total": 73.98,
  "shippingAddress": {
    "name": "Lisa Martinez",
    "street": "456 Oak Ave",
    "city": "Chicago",
    "state": "IL",
    "zip": "60610",
    "country": "US"
  },
  "shippingMethod": "USPS Priority Mail",
  "paymentProcessor": "STRIPE",
  "paymentIntentId": "pi_jkl456mno789",
  "customerNotes": "Please gift wrap",
  "metadata": {
    "source": "stepperslife_main"
  }
}
```

**Response:** `201 Created`
```json
{
  "order": {
    "id": "order_mno345",
    "orderNumber": "SL-ORD-98765",
    "storeId": "store_def456",
    "storeName": "Steppin Apparel",
    "customerId": "user_ghi789",
    "customerName": "Lisa Martinez",
    "customerEmail": "lisa@example.com",
    "items": [ /* same as request */ ],
    "subtotal": 59.98,
    "shipping": 8.00,
    "tax": 6.00,
    "total": 73.98,
    "platformFee": 5.18,
    "vendorPayout": 68.80,
    "shippingAddress": { /* same as request */ },
    "shippingMethod": "USPS Priority Mail",
    "status": "PAID",
    "fulfillmentStatus": "UNFULFILLED",
    "placedAt": "2025-10-07T16:00:00Z"
  }
}
```

**Error Responses:**
```json
// 400 Bad Request - Out of stock
{
  "error": "Product variant out of stock",
  "code": "OUT_OF_STOCK",
  "details": {
    "productId": "prod_abc123",
    "variantId": "var_125",
    "requested": 1,
    "available": 0
  }
}
```

---

## Classes Platform APIs

### Base URL: `https://classes.stepperslife.com/api`

---

### 1. List All Classes

**Endpoint:** `GET /classes`

**Query Parameters:**
```typescript
{
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
  instructorId?: string;
  featured?: boolean;
  priceType?: "FREE" | "ONE_TIME" | "SUBSCRIPTION";
  limit?: number;
  offset?: number;
}
```

**Response:** `200 OK`
```json
{
  "courses": [
    {
      "id": "course_abc123",
      "slug": "chicago-steppin-basics",
      "title": "Chicago Steppin Basics",
      "shortDescription": "Learn the foundational steps of Chicago Steppin",
      "thumbnailUrl": "https://cdn.stepperslife.com/courses/basics-thumb.jpg",
      "instructorId": "inst_def456",
      "instructorName": "Marcus Johnson",
      "instructorPhoto": "https://cdn.stepperslife.com/instructors/marcus.jpg",
      "instructorSlug": "marcus-johnson",
      "priceType": "ONE_TIME",
      "price": 49.99,
      "level": "BEGINNER",
      "tags": ["basic", "beginner", "fundamentals"],
      "totalLessons": 12,
      "totalDuration": 180,
      "enrollmentCount": 456,
      "averageRating": 4.9,
      "isFeatured": true,
      "isPublished": true
    }
  ],
  "pagination": {
    "total": 28,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### 2. Get Course Details

**Endpoint:** `GET /courses/:slug`

**Response:** `200 OK`
```json
{
  "course": {
    "id": "course_abc123",
    "slug": "chicago-steppin-basics",
    "title": "Chicago Steppin Basics",
    "description": "Full HTML description...",
    "shortDescription": "Learn the foundational steps",
    "thumbnailUrl": "https://cdn.stepperslife.com/courses/basics-thumb.jpg",
    "promoVideoUrl": "https://cdn.stepperslife.com/courses/basics-promo.mp4",
    "instructorId": "inst_def456",
    "instructorName": "Marcus Johnson",
    "instructorPhoto": "https://cdn.stepperslife.com/instructors/marcus.jpg",
    "instructorBio": "Marcus has been teaching for 15 years...",
    "priceType": "ONE_TIME",
    "price": 49.99,
    "level": "BEGINNER",
    "tags": ["basic", "beginner", "fundamentals"],
    "lessons": [
      {
        "id": "lesson_123",
        "title": "Introduction to Chicago Steppin",
        "duration": 300,
        "moduleNumber": 1,
        "lessonNumber": 1,
        "isFree": true,
        "thumbnailUrl": "https://cdn.stepperslife.com/lessons/lesson1-thumb.jpg"
      },
      {
        "id": "lesson_124",
        "title": "Basic Step Pattern",
        "duration": 600,
        "moduleNumber": 1,
        "lessonNumber": 2,
        "isFree": false,
        "thumbnailUrl": "https://cdn.stepperslife.com/lessons/lesson2-thumb.jpg"
      }
      // ... more lessons
    ],
    "totalLessons": 12,
    "totalDuration": 180,
    "enrollmentCount": 456,
    "averageRating": 4.9,
    "reviews": [
      {
        "id": "review_001",
        "studentName": "Amy Chen",
        "rating": 5,
        "title": "Perfect for beginners!",
        "comment": "Marcus explains everything clearly...",
        "createdAt": "2025-09-15T10:00:00Z"
      }
    ],
    "isFeatured": true,
    "isPublished": true
  }
}
```

---

### 3. Enroll in Course

**Endpoint:** `POST /enrollments`

**Request Body:**
```json
{
  "courseId": "course_abc123",
  "studentId": "user_pqr789",
  "studentName": "David Wilson",
  "studentEmail": "david@example.com",
  "amountPaid": 49.99,
  "paymentProcessor": "STRIPE",
  "paymentIntentId": "pi_stu901vwx234",
  "metadata": {
    "source": "stepperslife_main"
  }
}
```

**Response:** `201 Created`
```json
{
  "enrollment": {
    "id": "enroll_yza567",
    "courseId": "course_abc123",
    "studentId": "user_pqr789",
    "studentName": "David Wilson",
    "studentEmail": "david@example.com",
    "amountPaid": 49.99,
    "platformFee": 4.99,
    "instructorPayout": 45.00,
    "hasAccess": true,
    "completionPercent": 0,
    "enrolledAt": "2025-10-07T17:00:00Z"
  },
  "message": "Successfully enrolled! Check your email for access details."
}
```

---

## Services Directory APIs

### Base URL: `https://services.stepperslife.com/api`

---

### 1. List Service Providers

**Endpoint:** `GET /services`

**Query Parameters:**
```typescript
{
  category?: "DJ" | "PHOTOGRAPHER" | "VIDEOGRAPHER" | "VENUE" | "CATERING" | etc;
  location?: string;      // City or area
  search?: string;
  rating?: number;        // Minimum rating
  premium?: boolean;      // Premium listings only
  limit?: number;
  offset?: number;
}
```

**Response:** `200 OK`
```json
{
  "providers": [
    {
      "id": "provider_abc123",
      "slug": "smooth-sounds-dj",
      "businessName": "Smooth Sounds DJ Service",
      "tagline": "Keeping the party steppin' since 2010",
      "description": "Professional DJ service specializing in Chicago Steppin events",
      "logoUrl": "https://cdn.stepperslife.com/services/smooth-sounds-logo.jpg",
      "coverImageUrl": "https://cdn.stepperslife.com/services/smooth-sounds-cover.jpg",
      "category": "DJ",
      "subCategories": ["Wedding DJ", "Event DJ", "Mobile DJ"],
      "serviceArea": ["Chicago", "Suburbs", "Northwest Indiana"],
      "email": "info@smoothsounds.com",
      "phone": "(312) 555-DJ01",
      "showContactInfo": true,
      "website": "https://smoothsounds.com",
      "startingPrice": 500.00,
      "priceRange": "$$",
      "averageRating": 4.9,
      "totalReviews": 87,
      "portfolioImages": [
        "https://cdn.stepperslife.com/services/portfolio1.jpg",
        "https://cdn.stepperslife.com/services/portfolio2.jpg"
      ],
      "isPriority": true,
      "subscriptionTier": "PREMIUM"
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### 2. Get Provider Profile

**Endpoint:** `GET /services/:slug`

**Response:** `200 OK`
```json
{
  "provider": {
    "id": "provider_abc123",
    "slug": "smooth-sounds-dj",
    "businessName": "Smooth Sounds DJ Service",
    "tagline": "Keeping the party steppin' since 2010",
    "description": "Full HTML description...",
    "ownerName": "DJ Smooth",
    "logoUrl": "https://cdn.stepperslife.com/services/smooth-sounds-logo.jpg",
    "coverImageUrl": "https://cdn.stepperslife.com/services/smooth-sounds-cover.jpg",
    "category": "DJ",
    "subCategories": ["Wedding DJ", "Event DJ", "Mobile DJ"],
    "serviceArea": ["Chicago", "Suburbs", "Northwest Indiana"],
    "address": {
      "city": "Chicago",
      "state": "IL"
    },
    "email": "info@smoothsounds.com",
    "phone": "(312) 555-DJ01",
    "showContactInfo": true,
    "website": "https://smoothsounds.com",
    "instagramUrl": "https://instagram.com/smoothsoundsdj",
    "facebookUrl": "https://facebook.com/smoothsounds",
    "services": [
      {
        "id": "service_001",
        "name": "Wedding DJ Package",
        "description": "Full wedding reception DJ service",
        "price": 1200.00,
        "priceType": "per_event"
      },
      {
        "id": "service_002",
        "name": "Steppin Event DJ",
        "description": "4-hour steppin event",
        "price": 600.00,
        "priceType": "per_event"
      }
    ],
    "portfolioImages": [
      "https://cdn.stepperslife.com/services/portfolio1.jpg",
      "https://cdn.stepperslife.com/services/portfolio2.jpg",
      "https://cdn.stepperslife.com/services/portfolio3.jpg"
    ],
    "portfolioVideos": [
      "https://cdn.stepperslife.com/services/video1.mp4"
    ],
    "averageRating": 4.9,
    "totalReviews": 87,
    "reviews": [
      {
        "id": "review_001",
        "customerName": "Jennifer Lee",
        "rating": 5,
        "title": "Amazing DJ!",
        "comment": "DJ Smooth made our wedding unforgettable...",
        "photos": ["https://cdn.stepperslife.com/reviews/review1.jpg"],
        "createdAt": "2025-08-20T10:00:00Z"
      }
    ],
    "isPriority": true,
    "subscriptionTier": "PREMIUM"
  }
}
```

---

### 3. Submit Inquiry

**Endpoint:** `POST /inquiries`

**Request Body:**
```json
{
  "providerId": "provider_abc123",
  "customerId": "user_bcd234",
  "customerName": "Rachel Green",
  "customerEmail": "rachel@example.com",
  "customerPhone": "(555) 369-2580",
  "eventDate": "2026-06-15T18:00:00Z",
  "eventType": "Wedding",
  "message": "Hi, I'm interested in booking DJ service for my wedding...",
  "metadata": {
    "source": "stepperslife_main"
  }
}
```

**Response:** `201 Created`
```json
{
  "inquiry": {
    "id": "inquiry_efg345",
    "providerId": "provider_abc123",
    "customerId": "user_bcd234",
    "customerName": "Rachel Green",
    "customerEmail": "rachel@example.com",
    "customerPhone": "(555) 369-2580",
    "eventDate": "2026-06-15T18:00:00Z",
    "eventType": "Wedding",
    "message": "Hi, I'm interested in booking DJ service for my wedding...",
    "status": "NEW",
    "createdAt": "2025-10-07T18:00:00Z"
  },
  "message": "Your inquiry has been sent! The provider will contact you soon."
}
```

---

## Magazine APIs

### Base URL: `https://magazine.stepperslife.com/api`

---

### 1. List Articles

**Endpoint:** `GET /articles`

**Query Parameters:**
```typescript
{
  category?: "NEWS" | "EVENTS" | "INTERVIEWS" | etc;
  featured?: boolean;
  authorId?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}
```

**Response:** `200 OK`
```json
{
  "articles": [
    {
      "id": "article_abc123",
      "slug": "chicago-steppin-history",
      "title": "The Rich History of Chicago Steppin",
      "subtitle": "From its roots to modern day",
      "excerpt": "Chicago Steppin has a deep cultural history...",
      "featuredImage": "https://cdn.stepperslife.com/articles/history-cover.jpg",
      "category": "HISTORY",
      "tags": ["history", "culture", "chicago"],
      "authorId": "writer_def456",
      "authorName": "James Thompson",
      "authorPhoto": "https://cdn.stepperslife.com/writers/james.jpg",
      "publishedAt": "2025-10-01T10:00:00Z",
      "viewCount": 1542,
      "likeCount": 89,
      "isFeatured": true
    }
  ],
  "pagination": {
    "total": 67,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 2. Get Article

**Endpoint:** `GET /articles/:slug`

**Response:** `200 OK`
```json
{
  "article": {
    "id": "article_abc123",
    "slug": "chicago-steppin-history",
    "title": "The Rich History of Chicago Steppin",
    "subtitle": "From its roots to modern day",
    "content": "<p>Full HTML content...</p>",
    "excerpt": "Chicago Steppin has a deep cultural history...",
    "featuredImage": "https://cdn.stepperslife.com/articles/history-cover.jpg",
    "images": [
      "https://cdn.stepperslife.com/articles/image1.jpg",
      "https://cdn.stepperslife.com/articles/image2.jpg"
    ],
    "category": "HISTORY",
    "tags": ["history", "culture", "chicago"],
    "authorId": "writer_def456",
    "authorName": "James Thompson",
    "authorPhoto": "https://cdn.stepperslife.com/writers/james.jpg",
    "authorBio": "James is a cultural historian...",
    "metaTitle": "The Rich History of Chicago Steppin | SteppersLife",
    "metaDescription": "Explore the deep cultural roots...",
    "publishedAt": "2025-10-01T10:00:00Z",
    "viewCount": 1542,
    "likeCount": 89,
    "shareCount": 34,
    "comments": [
      {
        "id": "comment_001",
        "userName": "Denise Brown",
        "userPhoto": "https://cdn.stepperslife.com/users/denise.jpg",
        "content": "Great article! Very informative.",
        "createdAt": "2025-10-02T14:30:00Z",
        "replies": []
      }
    ],
    "isFeatured": true
  }
}
```

---

## Webhook Specifications

### Overview

All SaaS platforms send webhooks to the main site when important events occur. Webhooks ensure real-time synchronization and customer notifications.

### Webhook Security

**HMAC SHA256 Signature Verification:**

```typescript
// Signing webhook (SaaS platform)
import crypto from 'crypto';

function signWebhook(payload: object, secret: string): string {
  const payloadString = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex');
  return signature;
}

// Verifying webhook (Main site)
function verifyWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

**Headers:**
```http
POST /api/webhooks/restaurants HTTP/1.1
Host: stepperslife.com
Content-Type: application/json
X-Webhook-Signature: a1b2c3d4e5f6...
X-Webhook-Timestamp: 1696704000
X-Webhook-ID: wh_abc123def456
```

---

### Restaurant Webhooks

**Endpoint:** `https://stepperslife.com/api/webhooks/restaurants`

#### 1. Order Created

```json
{
  "event": "order.created",
  "timestamp": "2025-10-07T17:00:00Z",
  "data": {
    "orderId": "order_ghi789",
    "orderNumber": "SL-REST-12345",
    "restaurantId": "rest_abc123",
    "restaurantName": "Soul Food Spot",
    "customerId": "user_def456",
    "total": 41.78,
    "status": "PENDING",
    "pickupTime": "2025-10-07T18:00:00Z",
    "placedAt": "2025-10-07T17:00:00Z"
  }
}
```

**Main Site Action:**
- Create order reference in database
- Send confirmation email to customer
- Show order in customer's order history

---

#### 2. Order Status Changed

```json
{
  "event": "order.confirmed",
  "timestamp": "2025-10-07T17:05:00Z",
  "data": {
    "orderId": "order_ghi789",
    "orderNumber": "SL-REST-12345",
    "restaurantId": "rest_abc123",
    "restaurantName": "Soul Food Spot",
    "customerId": "user_def456",
    "status": "CONFIRMED",
    "confirmedAt": "2025-10-07T17:05:00Z"
  }
}
```

```json
{
  "event": "order.ready",
  "timestamp": "2025-10-07T17:28:00Z",
  "data": {
    "orderId": "order_ghi789",
    "orderNumber": "SL-REST-12345",
    "restaurantId": "rest_abc123",
    "restaurantName": "Soul Food Spot",
    "customerId": "user_def456",
    "status": "READY",
    "readyAt": "2025-10-07T17:28:00Z",
    "pickupTime": "2025-10-07T18:00:00Z"
  }
}
```

**Main Site Actions:**
- Update order status in database
- Send push notification: "Your order is ready for pickup!"
- Update order page in real-time (if customer is viewing)

---

#### 3. Order Completed

```json
{
  "event": "order.completed",
  "timestamp": "2025-10-07T18:15:00Z",
  "data": {
    "orderId": "order_ghi789",
    "orderNumber": "SL-REST-12345",
    "restaurantId": "rest_abc123",
    "customerId": "user_def456",
    "status": "COMPLETED",
    "completedAt": "2025-10-07T18:15:00Z"
  }
}
```

**Main Site Actions:**
- Mark order as complete
- Prompt customer for review

---

#### 4. Order Cancelled

```json
{
  "event": "order.cancelled",
  "timestamp": "2025-10-07T17:10:00Z",
  "data": {
    "orderId": "order_ghi789",
    "orderNumber": "SL-REST-12345",
    "restaurantId": "rest_abc123",
    "customerId": "user_def456",
    "status": "CANCELLED",
    "cancelledAt": "2025-10-07T17:10:00Z",
    "cancelReason": "Out of ingredients",
    "refundAmount": 41.78,
    "refundStatus": "PROCESSING"
  }
}
```

**Main Site Actions:**
- Update order status
- Notify customer of cancellation
- Show refund status

---

### Events Webhooks

**Endpoint:** `https://stepperslife.com/api/webhooks/events`

#### 1. Tickets Purchased

```json
{
  "event": "tickets.purchased",
  "timestamp": "2025-10-07T15:00:00Z",
  "data": {
    "saleId": "sale_jkl012",
    "saleNumber": "SL-EVENT-67890",
    "eventId": "event_abc123",
    "eventTitle": "Steppin Saturday Night",
    "customerId": "user_def456",
    "quantity": 3,
    "total": 107.50,
    "ticketIds": ["ticket_001", "ticket_002", "ticket_003"],
    "purchasedAt": "2025-10-07T15:00:00Z"
  }
}
```

**Main Site Actions:**
- Create ticket sale reference
- Send confirmation email with QR codes
- Add to customer's "My Tickets" page

---

#### 2. Ticket Checked In

```json
{
  "event": "ticket.checked_in",
  "timestamp": "2025-10-12T20:15:00Z",
  "data": {
    "ticketId": "ticket_001",
    "ticketNumber": "SL-EVENT123-0001",
    "eventId": "event_abc123",
    "customerId": "user_def456",
    "checkedInAt": "2025-10-12T20:15:00Z"
  }
}
```

---

#### 3. Event Updated

```json
{
  "event": "event.updated",
  "timestamp": "2025-10-08T10:00:00Z",
  "data": {
    "eventId": "event_abc123",
    "eventTitle": "Steppin Saturday Night",
    "changes": {
      "startDateTime": {
        "old": "2025-10-12T20:00:00Z",
        "new": "2025-10-12T19:00:00Z"
      },
      "venueName": {
        "old": "Chicago Ballroom",
        "new": "Grand Ballroom Chicago"
      }
    },
    "message": "Event start time moved to 7 PM. Venue name updated."
  }
}
```

**Main Site Actions:**
- Notify all ticket holders of changes
- Update event display

---

### Store Webhooks

**Endpoint:** `https://stepperslife.com/api/webhooks/store`

#### 1. Order Created

```json
{
  "event": "order.created",
  "timestamp": "2025-10-07T16:00:00Z",
  "data": {
    "orderId": "order_mno345",
    "orderNumber": "SL-ORD-98765",
    "storeId": "store_def456",
    "storeName": "Steppin Apparel",
    "customerId": "user_ghi789",
    "total": 73.98,
    "status": "PAID",
    "fulfillmentStatus": "UNFULFILLED",
    "placedAt": "2025-10-07T16:00:00Z"
  }
}
```

---

#### 2. Order Shipped

```json
{
  "event": "order.shipped",
  "timestamp": "2025-10-08T14:00:00Z",
  "data": {
    "orderId": "order_mno345",
    "orderNumber": "SL-ORD-98765",
    "storeId": "store_def456",
    "storeName": "Steppin Apparel",
    "customerId": "user_ghi789",
    "fulfillmentStatus": "SHIPPED",
    "trackingNumber": "1Z999AA10123456784",
    "carrier": "UPS",
    "trackingUrl": "https://www.ups.com/track?tracknum=1Z999AA10123456784",
    "shippedAt": "2025-10-08T14:00:00Z",
    "estimatedDelivery": "2025-10-10T17:00:00Z"
  }
}
```

**Main Site Actions:**
- Send shipping confirmation email
- Send push notification with tracking info
- Update order page

---

### Classes Webhooks

**Endpoint:** `https://stepperslife.com/api/webhooks/classes`

#### 1. Enrollment Created

```json
{
  "event": "enrollment.created",
  "timestamp": "2025-10-07T17:00:00Z",
  "data": {
    "enrollmentId": "enroll_yza567",
    "courseId": "course_abc123",
    "courseTitle": "Chicago Steppin Basics",
    "studentId": "user_pqr789",
    "amountPaid": 49.99,
    "enrolledAt": "2025-10-07T17:00:00Z"
  }
}
```

**Main Site Actions:**
- Send welcome email with course access
- Add to "My Classes" page

---

#### 2. Lesson Completed

```json
{
  "event": "lesson.completed",
  "timestamp": "2025-10-08T19:30:00Z",
  "data": {
    "enrollmentId": "enroll_yza567",
    "courseId": "course_abc123",
    "lessonId": "lesson_124",
    "lessonTitle": "Basic Step Pattern",
    "studentId": "user_pqr789",
    "completionPercent": 16.67,
    "completedAt": "2025-10-08T19:30:00Z"
  }
}
```

---

#### 3. Course Completed

```json
{
  "event": "course.completed",
  "timestamp": "2025-10-20T16:00:00Z",
  "data": {
    "enrollmentId": "enroll_yza567",
    "courseId": "course_abc123",
    "courseTitle": "Chicago Steppin Basics",
    "studentId": "user_pqr789",
    "completionPercent": 100,
    "completedAt": "2025-10-20T16:00:00Z",
    "certificateUrl": "https://cdn.stepperslife.com/certificates/cert_123.pdf"
  }
}
```

**Main Site Actions:**
- Send congratulations email
- Prompt for course review
- Display certificate

---

### Services Webhooks

**Endpoint:** `https://stepperslife.com/api/webhooks/services`

#### 1. Inquiry Created

```json
{
  "event": "inquiry.created",
  "timestamp": "2025-10-07T18:00:00Z",
  "data": {
    "inquiryId": "inquiry_efg345",
    "providerId": "provider_abc123",
    "providerName": "Smooth Sounds DJ Service",
    "customerId": "user_bcd234",
    "eventDate": "2026-06-15T18:00:00Z",
    "eventType": "Wedding",
    "createdAt": "2025-10-07T18:00:00Z"
  }
}
```

---

#### 2. Inquiry Responded

```json
{
  "event": "inquiry.responded",
  "timestamp": "2025-10-08T09:00:00Z",
  "data": {
    "inquiryId": "inquiry_efg345",
    "providerId": "provider_abc123",
    "providerName": "Smooth Sounds DJ Service",
    "customerId": "user_bcd234",
    "response": "Thanks for reaching out! I'd love to DJ your wedding...",
    "respondedAt": "2025-10-08T09:00:00Z"
  }
}
```

**Main Site Actions:**
- Notify customer of response
- Update inquiry status

---

### Magazine Webhooks

**Endpoint:** `https://stepperslife.com/api/webhooks/magazine`

#### 1. Article Published

```json
{
  "event": "article.published",
  "timestamp": "2025-10-01T10:00:00Z",
  "data": {
    "articleId": "article_abc123",
    "slug": "chicago-steppin-history",
    "title": "The Rich History of Chicago Steppin",
    "category": "HISTORY",
    "authorId": "writer_def456",
    "authorName": "James Thompson",
    "featuredImage": "https://cdn.stepperslife.com/articles/history-cover.jpg",
    "publishedAt": "2025-10-01T10:00:00Z",
    "isFeatured": true
  }
}
```

**Main Site Actions:**
- Feature on homepage if `isFeatured: true`
- Send notification to followers

---

## Authentication & Security

### API Key Authentication (Server-to-Server)

For server-to-server API calls (main site calling SaaS platforms):

```http
GET /api/restaurants HTTP/1.1
Host: restaurants.stepperslife.com
Authorization: Bearer sk_live_abc123def456ghi789
```

**Environment Variables:**
```bash
# Main Site
RESTAURANTS_API_KEY="sk_live_abc123..."
EVENTS_API_KEY="sk_live_def456..."
STORE_API_KEY="sk_live_ghi789..."
# etc.

# Each SaaS Platform
API_SECRET_KEY="sk_live_abc123..." # For validating incoming requests
```

---

### JWT Authentication (User Requests)

For user-initiated requests (customer placing order):

```http
POST /api/orders HTTP/1.1
Host: restaurants.stepperslife.com
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

The JWT token is issued by NextAuth and validated by all platforms.

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": {
    // Additional context
  },
  "timestamp": "2025-10-07T18:00:00Z",
  "requestId": "req_abc123def456"
}
```

### Common HTTP Status Codes

```
200 OK - Request succeeded
201 Created - Resource created successfully
400 Bad Request - Invalid request data
401 Unauthorized - Missing or invalid authentication
403 Forbidden - Authenticated but not authorized
404 Not Found - Resource doesn't exist
409 Conflict - Resource conflict (e.g., already exists)
422 Unprocessable Entity - Validation failed
429 Too Many Requests - Rate limit exceeded
500 Internal Server Error - Server error
503 Service Unavailable - Service temporarily down
```

### Common Error Codes

```
VALIDATION_ERROR - Request validation failed
AUTHENTICATION_REQUIRED - Must be authenticated
UNAUTHORIZED - Not authorized for this action
NOT_FOUND - Resource not found
ALREADY_EXISTS - Resource already exists
INSUFFICIENT_INVENTORY - Not enough stock
PAYMENT_FAILED - Payment processing failed
RATE_LIMIT_EXCEEDED - Too many requests
INTERNAL_ERROR - Internal server error
SERVICE_UNAVAILABLE - Service temporarily unavailable
```

---

## Rate Limiting

All APIs implement rate limiting:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1696704600
Retry-After: 60
```

```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "limit": 100,
    "window": "1 minute",
    "retryAfter": 60
  }
}
```

**Rate Limits:**
- Authenticated requests: 100 per minute
- Unauthenticated requests: 20 per minute
- Webhook deliveries: No limit (server-to-server)

---

## Versioning

APIs use URL versioning:

```
https://restaurants.stepperslife.com/api/v1/restaurants
https://events.stepperslife.com/api/v1/events
```

Current version: `v1` (default if not specified)

---

**End of API Contracts & Webhook Specifications**