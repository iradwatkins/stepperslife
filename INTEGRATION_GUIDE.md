# SteppersLife.com - API Integration Guide

## 🎉 What's Been Built

Your **SteppersLife.com** homepage now has a complete API integration layer that can seamlessly switch between **mock data** (for development) and **real subdomain APIs** (for production).

## 📋 Project Structure

```
/root/websites/stepperslife/
├── lib/
│   ├── api/                           # 🆕 API Clients
│   │   ├── config.ts                  # Base configuration
│   │   ├── magazine-client.ts         # Magazine API
│   │   ├── events-client.ts           # Events API
│   │   ├── shop-client.ts             # Shop API
│   │   ├── restaurants-client.ts      # Restaurants API
│   │   ├── classes-client.ts          # Classes API
│   │   ├── services-client.ts         # Services API
│   │   ├── index.ts                   # Export all clients
│   │   └── README.md                  # API documentation
│   ├── mock-data/                     # Mock data for development
│   └── types/                         # TypeScript types
├── app/
│   ├── components/home/               # Homepage sections
│   └── page.tsx                       # Main homepage
├── .env.local                         # 🆕 Environment variables
└── .env.example                       # 🆕 Example env file
```

## 🚀 Current Status

### ✅ Completed

1. **Homepage with 7 sections** displaying aggregated content
2. **Complete API client layer** for all 6 subdomains
3. **Mock/Real API switching** via environment variable
4. **Type-safe API methods** with full TypeScript support
5. **Error handling** with custom APIError class
6. **Documentation** for API usage

### 📊 Homepage Sections (In Order)

1. Hero Section
2. Magazine Articles (from magazine.stepperslife.com)
3. Events Grid (from events.stepperslife.com)
4. Shop Showcase (from shop.stepperslife.com)
5. Restaurants (from restaurants.stepperslife.com)
6. Classes (from classes.stepperslife.com)
7. Services (from services directory)

## 🔧 How to Switch from Mock to Real APIs

### Current Setup (Mock Data)

Your site is currently using **mock data** which is perfect for:
- Development without subdomain dependencies
- Testing UI/UX
- Demonstrating the design

### When Subdomains Are Ready

#### Step 1: Verify Subdomain APIs

Make sure these are running and accessible:

```bash
✅ Port 3007: magazine.stepperslife.com
✅ Port 3004: events.stepperslife.com
✅ Port 3008: shop.stepperslife.com
✅ Port 3010: restaurants.stepperslife.com
✅ Port 3009: classes.stepperslife.com
```

#### Step 2: Update Environment Variable

Edit `.env.local`:

```bash
# Change this line:
NEXT_PUBLIC_USE_MOCK_DATA=true

# To:
NEXT_PUBLIC_USE_MOCK_DATA=false
```

#### Step 3: Restart the Server

```bash
pm2 restart stepperslife-web
```

**That's it!** Your homepage will now pull live data from subdomains.

## 📖 Using API Clients

### Example: Magazine Articles

```typescript
import { magazineAPI } from "@/lib/api";

// Fetches from mock data OR real API automatically
const { articles } = await magazineAPI.getArticles({
  featured: true,
  limit: 4
});
```

### Example: Events

```typescript
import { eventsAPI } from "@/lib/api";

const { events } = await eventsAPI.getEvents({
  upcoming: true,
  limit: 6
});
```

### Example: Shop Products

```typescript
import { shopAPI } from "@/lib/api";

const { products } = await shopAPI.getProducts({
  category: "Clothing",
  inStock: true,
  limit: 6
});
```

## 🎯 Next Steps

### For Development

1. ✅ Homepage is ready with mock data
2. ✅ API clients are built and tested
3. Continue building subdomain services
4. When ready, flip the switch to real APIs

### For Production

1. Update `.env.local` or `.env.production`:
   ```bash
   NEXT_PUBLIC_USE_MOCK_DATA=false
   NEXT_PUBLIC_MAGAZINE_API=https://magazine.stepperslife.com/api
   NEXT_PUBLIC_EVENTS_API=https://events.stepperslife.com/api
   # ... etc
   ```

2. Build and deploy:
   ```bash
   npm run build
   pm2 restart stepperslife-web
   ```

## 🔍 Testing APIs

### Test Mock Data (Current)

Visit: `http://stepperslife.com` or `http://localhost:3001`

You should see:
- 4 magazine articles
- 6 upcoming events
- 6 shop products
- 5 restaurants
- 3 classes
- 4 services

### Test Real APIs (When Ready)

1. Start subdomain services on their ports
2. Set `NEXT_PUBLIC_USE_MOCK_DATA=false`
3. Restart server
4. Verify data loads from real APIs

## 📞 API Methods Available

### Magazine API
- `getArticles(params?)` - List articles
- `getArticle(slug)` - Single article

### Events API
- `getEvents(params?)` - List events
- `getEvent(slug)` - Single event
- `purchaseTickets(data)` - Buy tickets

### Shop API
- `getProducts(params?)` - List products
- `getProduct(id)` - Single product
- `createOrder(data)` - Create order

### Restaurants API
- `getRestaurants(params?)` - List restaurants
- `getRestaurant(slug)` - Single restaurant
- `createOrder(data)` - Place order
- `getOrderStatus(id)` - Check order

### Classes API
- `getCourses(params?)` - List courses
- `getCourse(slug)` - Single course
- `enrollInCourse(data)` - Enroll

### Services API
- `getServices(params?)` - List providers
- `getService(slug)` - Single provider
- `submitInquiry(data)` - Contact provider

## 💡 Tips

1. **Keep mock data updated** - When subdomain APIs change, update mock data to match
2. **Test both modes** - Verify functionality works in both mock and real API modes
3. **Error handling** - All API clients have built-in error handling
4. **Type safety** - TypeScript ensures you're using correct data structures

## 🆘 Troubleshooting

### Homepage shows mock data when it should show real data

Check:
1. `.env.local` has `NEXT_PUBLIC_USE_MOCK_DATA=false`
2. Server was restarted after changing env variable
3. Subdomain services are running and accessible

### API errors

Check:
1. Subdomain APIs are running on correct ports
2. API endpoints match what's in `.env.local`
3. Browser console for detailed error messages

---

**Your homepage is ready! 🎉**

All API infrastructure is in place. You can continue developing with mock data and seamlessly switch to real APIs when subdomains are ready.
