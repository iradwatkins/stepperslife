# SteppersLife API Clients

This directory contains API clients for all SteppersLife subdomains with automatic fallback to mock data.

## 🎯 Features

- **Automatic Mock/Real API Switching**: Use `NEXT_PUBLIC_USE_MOCK_DATA` to toggle
- **Type-Safe**: Full TypeScript support for all API methods
- **Error Handling**: Built-in error handling with custom `APIError` class
- **Consistent Interface**: All clients follow the same pattern

## 📁 Structure

```
lib/api/
├── config.ts              # Base configuration & utilities
├── magazine-client.ts     # Magazine API
├── events-client.ts       # Events API
├── shop-client.ts         # Shop API
├── restaurants-client.ts  # Restaurants API
├── classes-client.ts      # Classes API
├── services-client.ts     # Services API
└── index.ts              # Export all clients
```

## 🚀 Quick Start

### 1. Environment Variables

Create a `.env.local` file:

```bash
# Toggle between mock data and real APIs
NEXT_PUBLIC_USE_MOCK_DATA=true

# API Endpoints (for production)
NEXT_PUBLIC_MAGAZINE_API=https://magazine.stepperslife.com/api
NEXT_PUBLIC_EVENTS_API=https://events.stepperslife.com/api
NEXT_PUBLIC_SHOP_API=https://shop.stepperslife.com/api
NEXT_PUBLIC_RESTAURANTS_API=https://restaurants.stepperslife.com/api
NEXT_PUBLIC_CLASSES_API=https://classes.stepperslife.com/api
NEXT_PUBLIC_SERVICES_API=https://services.stepperslife.com/api
```

### 2. Using API Clients

#### Example: Fetching Magazine Articles

```typescript
import { magazineAPI } from "@/lib/api";

// Get articles
const { articles, pagination } = await magazineAPI.getArticles({
  featured: true,
  limit: 4,
});

// Get single article
const { article } = await magazineAPI.getArticle("chicago-steppin-history");
```

#### Example: Fetching Events

```typescript
import { eventsAPI } from "@/lib/api";

// Get upcoming events
const { events } = await eventsAPI.getEvents({
  upcoming: true,
  limit: 6,
});

// Get single event
const { event } = await eventsAPI.getEvent("steppin-saturday-oct-2025");

// Purchase tickets
const result = await eventsAPI.purchaseTickets({
  eventId: "event_001",
  customerId: "user_123",
  // ... other fields
});
```

#### Example: Fetching Shop Products

```typescript
import { shopAPI } from "@/lib/api";

// Get products
const { products } = await shopAPI.getProducts({
  category: "Clothing",
  inStock: true,
  limit: 6,
});

// Create order
const { order } = await shopAPI.createOrder({
  storeId: "store_123",
  customerId: "user_456",
  // ... other fields
});
```

## 🔄 Switching from Mock to Real APIs

### Step 1: Update Environment Variable

```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### Step 2: Ensure Subdomain APIs are Running

Make sure your subdomain services are running:
- Port 3007: magazine.stepperslife.com
- Port 3004: events.stepperslife.com
- Port 3008: shop.stepperslife.com
- Port 3010: restaurants.stepperslife.com
- Port 3009: classes.stepperslife.com

### Step 3: Restart Dev Server

```bash
npm run dev
```

That's it! The API clients will automatically use real endpoints.

## 📊 API Methods Reference

### Magazine API (`magazineAPI`)

- `getArticles(params?)` - Get all articles
- `getArticle(slug)` - Get single article

### Events API (`eventsAPI`)

- `getEvents(params?)` - Get all events
- `getEvent(slug)` - Get single event
- `purchaseTickets(data)` - Purchase event tickets

### Shop API (`shopAPI`)

- `getProducts(params?)` - Get all products
- `getProduct(id)` - Get single product
- `createOrder(data)` - Create shop order

### Restaurants API (`restaurantsAPI`)

- `getRestaurants(params?)` - Get all restaurants
- `getRestaurant(slug)` - Get single restaurant
- `createOrder(data)` - Create restaurant order
- `getOrderStatus(orderId)` - Check order status

### Classes API (`classesAPI`)

- `getCourses(params?)` - Get all courses
- `getCourse(slug)` - Get single course
- `enrollInCourse(data)` - Enroll in course

### Services API (`servicesAPI`)

- `getServices(params?)` - Get all service providers
- `getService(slug)` - Get single provider
- `submitInquiry(data)` - Submit inquiry

## 🛠️ Error Handling

All API clients use a custom `APIError` class:

```typescript
try {
  const { articles } = await magazineAPI.getArticles();
} catch (error) {
  if (error instanceof APIError) {
    console.error("API Error:", error.message);
    console.error("Status:", error.status);
    console.error("Code:", error.code);
  }
}
```

## 🔧 Updating Components

To use API clients in your components instead of mock data:

### Before (Mock Data)

```typescript
import { mockMagazineArticles } from "@/lib/mock-data/magazine";

export function MagazineArticlesFeed() {
  const articles = mockMagazineArticles.slice(0, 4);
  // ...
}
```

### After (API Client)

```typescript
import { magazineAPI } from "@/lib/api";

export async function MagazineArticlesFeed() {
  const { articles } = await magazineAPI.getArticles({ limit: 4 });
  // ...
}
```

## 📝 Notes

- Mock data is great for development and testing
- All API clients maintain the same interface whether using mock or real data
- Type definitions ensure you're using the correct data structures
- Real API calls require subdomain services to be running
