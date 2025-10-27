# SteppersLife Microservices Architecture

**Core Concept:** Each subdomain is a completely isolated microservice. The main site (stepperslife.com) is an aggregator that feeds off them via APIs.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    stepperslife.com                         │
│                   (Main Portal / Aggregator)                │
│  - Displays aggregated content from all subdomains         │
│  - Handles user authentication (NextAuth SSO)               │
│  - Routes transactions to appropriate subdomain             │
│  - NO business data storage (except user/auth)              │
└─────────────────────────────────────────────────────────────┘
                              ↓ API Calls
        ┌──────────────────────┴──────────────────────┐
        ↓                      ↓                       ↓
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Restaurants    │  │     Events       │  │      Store       │
│   Port: 3010     │  │   Port: 3004     │  │    Port: 3008    │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ Own Database:    │  │ Own Database:    │  │ Own Database:    │
│ stepperslife_    │  │ stepperslife_    │  │ stepperslife_    │
│ restaurants      │  │ events           │  │ store            │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ Own MinIO:       │  │ Own MinIO:       │  │ Own MinIO:       │
│ Bucket:          │  │ Bucket:          │  │ Bucket:          │
│ restaurants      │  │ events           │  │ store            │
│ Port: 9001       │  │ Port: 9002       │  │ Port: 9003       │
└──────────────────┘  └──────────────────┘  └──────────────────┘

        ↓                      ↓                       ↓
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│    Classes       │  │    Magazine      │  │    Services      │
│   Port: 3009     │  │   Port: 3007     │  │    Port: 3011    │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ Own Database:    │  │ Own Database:    │  │ Own Database:    │
│ stepperslife_    │  │ stepperslife_    │  │ stepperslife_    │
│ classes          │  │ magazine         │  │ services         │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ Own MinIO:       │  │ Own MinIO:       │  │ Own MinIO:       │
│ Bucket:          │  │ Bucket:          │  │ Bucket:          │
│ classes          │  │ magazine         │  │ services         │
│ Port: 9004       │  │ Port: 9005       │  │ Port: 9006       │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 🔐 What's Shared: NextAuth SSO

**ONLY authentication is shared** across all subdomains:

```
NextAuth Configuration:
├─ Cookie Domain: .stepperslife.com
├─ Session Strategy: JWT
├─ All subdomains read same session cookie
└─ User logs in ONCE, authenticated everywhere
```

**How it works:**
1. User logs into stepperslife.com
2. NextAuth sets cookie with domain `.stepperslife.com`
3. User clicks "Manage Restaurant" → goes to restaurants.stepperslife.com
4. restaurants.stepperslife.com reads the SAME cookie
5. User is already authenticated (no re-login needed)

---

## 🚫 What's NOT Shared: Everything Else

Each subdomain has **completely isolated resources**:

### 1. Database (PostgreSQL)
Each subdomain has its own isolated database (same PostgreSQL server, different database):

```bash
restaurants: stepperslife_restaurants (PostgreSQL port 5432)
events:      stepperslife_events      (PostgreSQL port 5432)
store:       stepperslife_store       (PostgreSQL port 5432)
classes:     stepperslife_classes     (PostgreSQL port 5432)
magazine:    stepperslife_magazine    (PostgreSQL port 5432)
services:    stepperslife_services    (PostgreSQL port 5432)
```

**Note:** All databases run on the same PostgreSQL instance (port 5432) but are completely isolated by database name.

### 2. MinIO (File Storage)
```bash
restaurants: bucket=restaurants, port=9001
events:      bucket=events,      port=9002
store:       bucket=store,       port=9003
classes:     bucket=classes,     port=9004
magazine:    bucket=magazine,    port=9005
services:    bucket=services,    port=9006
```

### 3. Application Server (Next.js)
```bash
restaurants: port 3010
events:      port 3004
store:       port 3008
classes:     port 3009
magazine:    port 3007
services:    port 3011
```

---

## 📊 Data Flow Example: Restaurant Order

```
1. Customer on stepperslife.com browses restaurants
   └─ stepperslife.com → API GET restaurants.stepperslife.com/api/restaurants

2. Customer places order
   └─ stepperslife.com → API POST restaurants.stepperslife.com/api/orders

3. Order stored in restaurants database
   └─ Database: stepperslife_restaurants

4. Restaurant owner uploads menu image
   └─ Stored in: MinIO bucket "restaurants" (port 9001)

5. Restaurant owner manages order
   └─ restaurants.stepperslife.com dashboard
   └─ Reads from: stepperslife_restaurants database
   └─ Images from: MinIO "restaurants" bucket
```

**Key Point:** stepperslife.com NEVER stores restaurant data. It only aggregates via API.

---

## 🔧 Environment Variables Per Subdomain

### restaurants.stepperslife.com (.env)
```env
# App
PORT=3010

# NextAuth (SHARED - same across all)
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=your-shared-secret
GOOGLE_CLIENT_ID=... # shared
GOOGLE_CLIENT_SECRET=... # shared

# Database (ISOLATED)
DATABASE_URL=postgresql://user:pass@localhost:5432/stepperslife_restaurants

# MinIO (ISOLATED)
MINIO_ENDPOINT=localhost
MINIO_PORT=9001
MINIO_ACCESS_KEY=restaurants_minio_key
MINIO_SECRET_KEY=restaurants_minio_secret
MINIO_BUCKET_NAME=restaurants
MINIO_USE_SSL=false

# Stripe (ISOLATED - each subdomain has own connected account)
STRIPE_SECRET_KEY=sk_live_restaurants_...
STRIPE_WEBHOOK_SECRET=whsec_restaurants_...
```

### events.stepperslife.com (.env)
```env
# App
PORT=3004

# NextAuth (SHARED - same as above)
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=your-shared-secret

# Database (ISOLATED)
DATABASE_URL=postgresql://user:pass@localhost:5433/stepperslife_events

# MinIO (ISOLATED)
MINIO_ENDPOINT=localhost
MINIO_PORT=9002
MINIO_ACCESS_KEY=events_minio_key
MINIO_SECRET_KEY=events_minio_secret
MINIO_BUCKET_NAME=events
MINIO_USE_SSL=false

# Stripe (ISOLATED)
STRIPE_SECRET_KEY=sk_live_events_...
```

### store.stepperslife.com (.env)
```env
# App
PORT=3008

# NextAuth (SHARED)
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=your-shared-secret

# Database (ISOLATED)
DATABASE_URL=postgresql://user:pass@localhost:5434/stepperslife_store

# MinIO (ISOLATED)
MINIO_ENDPOINT=localhost
MINIO_PORT=9003
MINIO_ACCESS_KEY=store_minio_key
MINIO_SECRET_KEY=store_minio_secret
MINIO_BUCKET_NAME=store
MINIO_USE_SSL=false
```

**Pattern continues for classes, magazine, services...**

---

## 🎯 Benefits of This Architecture

### 1. **True Microservices**
- Each subdomain can be deployed independently
- Failure in one doesn't affect others
- Can scale individual services based on demand

### 2. **Data Isolation**
- Restaurant data never mixes with event data
- Each service owns its domain
- Clean separation of concerns

### 3. **Security**
- Compromise of one service doesn't expose all data
- MinIO credentials are service-specific
- Database credentials are service-specific

### 4. **Flexibility**
- Can swap out storage for one service without affecting others
- Can use different database schemas per service
- Can spin off a subdomain as standalone SaaS

### 5. **Unified User Experience**
- User logs in once via NextAuth
- Seamless navigation between services
- Single identity across all platforms

---

## 🚀 Deployment Strategy

### Development (Local)
```bash
# Start all services
pm2 start ecosystem.config.js

# Each service runs on its own port
pm2 list
├─ stepperslife-main (port 3001)
├─ stepperslife-restaurants (port 3010)
├─ stepperslife-events (port 3004)
├─ stepperslife-store (port 3008)
├─ stepperslife-classes (port 3009)
├─ stepperslife-magazine (port 3007)
└─ stepperslife-services (port 3011)

# Each MinIO instance
├─ minio-restaurants (port 9001)
├─ minio-events (port 9002)
├─ minio-store (port 9003)
├─ minio-classes (port 9004)
├─ minio-magazine (port 9005)
└─ minio-services (port 9006)
```

### Production
Each subdomain can be deployed to:
- Separate VPS instances
- Docker containers
- Kubernetes pods
- Serverless functions

---

## 📝 Summary

| Component | Shared? | Details |
|-----------|---------|---------|
| **NextAuth Config** | ✅ Yes | Same secret, same cookie domain |
| **Session Cookie** | ✅ Yes | `.stepperslife.com` domain |
| **User Roles** | ✅ Yes | Stored in main user database |
| **Database** | ❌ No | Each subdomain has own DB |
| **MinIO** | ❌ No | Each subdomain has own instance/bucket |
| **API** | ❌ No | Each subdomain exposes own API |
| **Business Data** | ❌ No | Completely isolated per service |
| **File Uploads** | ❌ No | Stored in service-specific MinIO |
| **Stripe Account** | ❌ No | Each service has connected account |

---

**Key Principle:**
> stepperslife.com is a **thin aggregation layer**. All business logic, data, and files live in the individual microservices. The main site just displays and routes.

