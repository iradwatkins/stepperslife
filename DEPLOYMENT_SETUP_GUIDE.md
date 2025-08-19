# Deployment & Setup Guide - SteppersLife Payment System

## Complete Setup Instructions
**Version**: 1.0.0
**Last Updated**: 2025-08-19

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Payment Provider Setup](#payment-provider-setup)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Coolify Deployment](#coolify-deployment)
7. [Production Checklist](#production-checklist)
8. [Testing & Verification](#testing--verification)
9. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Services
- [ ] Node.js 18+ installed
- [ ] Git configured
- [ ] Convex account created
- [ ] Coolify server access
- [ ] Domain configured (stepperslife.com)

### Payment Provider Accounts
- [ ] Square Developer Account
- [ ] Stripe Account
- [ ] PayPal Developer Account
- [ ] Email service (SendGrid/SES)

### Development Tools
```bash
# Check versions
node --version  # Should be 18+
npm --version   # Should be 9+
git --version   # Should be 2.30+
```

---

## Local Development Setup

### 1. Clone Repository
```bash
# Clone the repository
git clone https://github.com/yourusername/stepperslife.git
cd stepperslife

# Install dependencies
npm install

# Install Convex CLI
npm install -g convex
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit with your credentials
nano .env.local
```

### 3. Convex Setup
```bash
# Login to Convex
npx convex login

# Initialize Convex
npx convex init

# Deploy schema
npx convex deploy

# Get deployment URL
npx convex dashboard
```

### 4. Run Development Server
```bash
# Start all services
npm run dev

# In separate terminals:
npx convex dev  # Convex functions
npm run dev     # Next.js app

# Access at http://localhost:3000
```

---

## Payment Provider Setup

### Square Setup

#### 1. Create Square Account
1. Go to https://developer.squareup.com
2. Sign up for developer account
3. Create new application

#### 2. Get Sandbox Credentials
```
Dashboard → Applications → Sandbox
- Application ID: sandbox-sq0idb-...
- Access Token: EAAAE...
- Location ID: LM...
```

#### 3. Configure Webhooks
```
Dashboard → Webhooks → Add Endpoint
URL: https://stepperslife.com/api/webhooks/square
Events:
- payment.created
- payment.updated
- refund.created
```

#### 4. Production Credentials
```
Dashboard → Applications → Production
- Complete identity verification
- Add bank account
- Get production credentials
```

### Stripe Setup

#### 1. Create Stripe Account
1. Go to https://dashboard.stripe.com
2. Complete account setup
3. Verify business information

#### 2. Get API Keys
```
Dashboard → Developers → API Keys
- Publishable Key: pk_test_...
- Secret Key: sk_test_...
```

#### 3. Configure Webhooks
```
Dashboard → Webhooks → Add Endpoint
URL: https://stepperslife.com/api/webhooks/stripe
Events:
- checkout.session.completed
- payment_intent.succeeded
- charge.refunded
```

#### 4. Enable Payment Methods
```
Dashboard → Settings → Payment Methods
Enable:
- Cards
- Apple Pay
- Google Pay
```

### PayPal Setup

#### 1. Create PayPal Developer Account
1. Go to https://developer.paypal.com
2. Create business account
3. Access dashboard

#### 2. Create App
```
Dashboard → My Apps → Create App
- App Name: SteppersLife
- Type: Merchant
- Sandbox/Live toggle
```

#### 3. Get Credentials
```
App Details:
- Client ID: ATest...
- Secret: ETest...
```

#### 4. Configure Webhooks
```
App → Webhooks → Add Webhook
URL: https://stepperslife.com/api/webhooks/paypal
Events:
- CHECKOUT.ORDER.APPROVED
- PAYMENT.CAPTURE.COMPLETED
```

---

## Environment Configuration

### 1. Create Environment File
```bash
# Production environment
nano .env.production
```

### 2. Required Variables
```env
# Application
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife
NODE_ENV=production

# Convex
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
CONVEX_DEPLOYMENT=prod:mild-newt-621
CONVEX_DEPLOY_KEY=[Get from Convex Dashboard]

# Authentication
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=[Generate with: openssl rand -base64 32]
GOOGLE_CLIENT_ID=[From Google Console]
GOOGLE_CLIENT_SECRET=[From Google Console]

# Square
NEXT_PUBLIC_SQUARE_APP_ID=[Your App ID]
NEXT_PUBLIC_SQUARE_LOCATION_ID=[Your Location ID]
SQUARE_ENVIRONMENT=production
SQUARE_ACCESS_TOKEN=[Your Access Token]
SQUARE_WEBHOOK_SIGNATURE_KEY=[Your Webhook Key]

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=[Your Client ID]
PAYPAL_CLIENT_SECRET=[Your Secret]
PAYPAL_WEBHOOK_ID=[Your Webhook ID]
PAYPAL_ENVIRONMENT=production

# Email
EMAIL_FROM=noreply@stepperslife.com
EMAIL_ADMIN=admin@stepperslife.com
SENDGRID_API_KEY=[Your SendGrid Key]

# Payment Configuration
PAYMENT_PROCESSING_FEE_PERCENTAGE=2.9
PAYMENT_PROCESSING_FEE_FIXED=0.30
ZELLE_PROCESSING_DAYS=3
BANK_TRANSFER_PROCESSING_DAYS=5

# Vault (for secrets)
VAULT_ADDR=http://127.0.0.1:8200
VAULT_TOKEN=[Your Vault Token]
```

### 3. Generate Secrets
```bash
# Generate NextAuth secret
openssl rand -base64 32

# Generate webhook signing keys
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Setup

### 1. Deploy Convex Schema
```bash
# Deploy to production
npx convex deploy --prod

# Run migrations
npx convex run migrations:initial
```

### 2. Create Indexes
```typescript
// Already defined in schema.ts
// Verify in Convex Dashboard
- paymentRequests.by_reference
- paymentRequests.by_status
- paymentRequests.by_user
- paymentRequests.by_seller
```

### 3. Seed Initial Data (Optional)
```bash
# Create admin user
npx convex run seeds:createAdmin

# Add test data
npx convex run seeds:testData
```

---

## Coolify Deployment

### 1. Prepare Coolify Environment

#### Access Coolify Dashboard
```
URL: http://72.60.28.175:3000
Login with your credentials
```

#### Create New Application
1. Click "New Resource"
2. Select "Application"
3. Choose "Docker Compose" or "Node.js"
4. Configure repository

### 2. Configure Application

#### Repository Settings
```yaml
Repository: https://github.com/yourusername/stepperslife
Branch: main
Build Command: npm run build
Start Command: npm start
```

#### Environment Variables
```bash
# Copy from coolify-env.txt
cat coolify-env.txt

# Paste in Coolify:
# Application → Environment Variables → Bulk Edit
```

### 3. Configure Domains
```yaml
Domains:
  - stepperslife.com
  - www.stepperslife.com
  
SSL: Let's Encrypt (automatic)
Force HTTPS: Yes
```

### 4. Build Configuration
```yaml
# Dockerfile (if using Docker)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 5. Deploy Application
```bash
# Push to repository
git add .
git commit -m "Deploy payment system"
git push origin main

# Coolify auto-deploys on push
# Or manually trigger:
# Coolify Dashboard → Deploy
```

### 6. Configure Webhooks in Coolify
```yaml
# Auto-deploy on push
Webhook URL: https://coolify.../webhook
Secret: [Generate secret]
Events: push
```

---

## Production Checklist

### Pre-Deployment

#### Code Review
- [ ] All console.logs removed
- [ ] Error handling implemented
- [ ] Input validation complete
- [ ] SQL injection prevention
- [ ] XSS protection enabled

#### Security
- [ ] API keys in environment variables
- [ ] Secrets in Vault
- [ ] HTTPS enforced
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Admin access restricted

#### Testing
- [ ] Unit tests passing
- [ ] Integration tests complete
- [ ] End-to-end tests verified
- [ ] Load testing performed
- [ ] Security scan completed

### Deployment Steps

#### 1. Database Migration
```bash
# Backup existing data
npx convex export --path backup-$(date +%Y%m%d)

# Deploy schema
npx convex deploy --prod

# Verify migration
npx convex dashboard
```

#### 2. Update DNS
```
A Record: @ → Server IP
A Record: www → Server IP
CNAME: api → Server hostname
```

#### 3. SSL Certificate
```bash
# Coolify handles automatically with Let's Encrypt
# Verify: https://stepperslife.com
```

#### 4. Deploy Application
```bash
# Final checks
npm run lint
npm run type-check
npm test

# Deploy
git push origin main
```

### Post-Deployment

#### Verification
- [ ] Site accessible via HTTPS
- [ ] All payment methods working
- [ ] Webhooks receiving events
- [ ] Email notifications sending
- [ ] Admin dashboard accessible
- [ ] Database queries optimized

#### Monitoring Setup
```bash
# Install monitoring
npm install @sentry/nextjs
npm install @opentelemetry/api

# Configure Sentry
npx @sentry/wizard@latest -i nextjs

# Add monitoring endpoints
/api/health
/api/metrics
```

---

## Testing & Verification

### 1. Payment Flow Testing

#### Square Test
```javascript
// Test card
Card: 4111 1111 1111 1111
CVV: 111
Expiry: 12/25
ZIP: 12345

// Create test purchase
// Verify webhook received
// Check ticket status
```

#### Stripe Test
```javascript
// Test cards
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 9995
3D Secure: 4000 0025 0000 3155
```

#### PayPal Test
```javascript
// Sandbox credentials
Email: sb-buyer@example.com
Password: sandbox123
```

### 2. Manual Payment Testing

#### Zelle Test Flow
1. Select Zelle payment
2. Note reference: ZL-TEST-123
3. Upload test proof image
4. Admin approves in dashboard
5. Verify ticket purchased
6. Check verification code

#### Bank Transfer Test
1. Select bank transfer
2. Note reference: BT-TEST-456
3. Submit proof document
4. Admin processes
5. Verify completion

### 3. Load Testing
```bash
# Install k6
brew install k6

# Run load test
k6 run tests/load-test.js

# Expected results
- Response time < 500ms
- Success rate > 99%
- No memory leaks
```

### 4. Security Testing
```bash
# OWASP ZAP scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://stepperslife.com

# Check headers
curl -I https://stepperslife.com

# Expected headers
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
```

---

## Monitoring & Maintenance

### 1. Health Monitoring

#### Uptime Monitoring
```bash
# Setup monitoring services
- UptimeRobot
- Pingdom
- StatusCake

# Endpoints to monitor
https://stepperslife.com
https://stepperslife.com/api/health
https://stepperslife.com/api/payments/provider-status
```

#### Application Monitoring
```javascript
// Sentry configuration
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: "production",
  tracesSampleRate: 0.1,
});

// Custom alerts
Alert on:
- Payment failure rate > 5%
- Response time > 1s
- Error rate > 1%
```

### 2. Log Management

#### Centralized Logging
```bash
# Coolify logs
coolify logs app-name

# Application logs
pm2 logs

# Convex logs
npx convex logs --prod
```

#### Log Aggregation
```yaml
# Use LogDNA, Papertrail, or ELK stack
Sources:
  - Application logs
  - Webhook logs
  - Payment provider logs
  - Error logs
```

### 3. Backup Strategy

#### Database Backups
```bash
# Daily automated backup
0 2 * * * npx convex export --path /backups/convex-$(date +\%Y\%m\%d)

# Weekly offsite backup
0 3 * * 0 aws s3 sync /backups s3://stepperslife-backups/
```

#### Code Backups
```bash
# Git repository (GitHub)
# Mirror to secondary repository
git remote add backup https://backup-repo.git
git push backup main
```

### 4. Maintenance Tasks

#### Daily
- [ ] Check pending payments queue
- [ ] Review error logs
- [ ] Monitor payment success rate
- [ ] Process manual verifications

#### Weekly
- [ ] Review performance metrics
- [ ] Check disk usage
- [ ] Update dependencies (security)
- [ ] Backup verification

#### Monthly
- [ ] Security updates
- [ ] Performance optimization
- [ ] Cost analysis
- [ ] User feedback review

### 5. Incident Response

#### Escalation Path
```
Level 1: Automatic alerts → On-call engineer
Level 2: Payment failures → Payment team lead
Level 3: System down → CTO/Technical lead
Level 4: Data breach → Security team + Legal
```

#### Recovery Procedures
```bash
# Payment provider down
1. Switch to backup provider
2. Queue failed payments
3. Notify affected users
4. Process queued payments when restored

# Database issues
1. Switch to read replica
2. Restore from backup
3. Replay transaction log
4. Verify data integrity
```

---

## Troubleshooting Guide

### Common Deployment Issues

#### Build Failures
```bash
# Clear cache and rebuild
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Environment Variable Issues
```bash
# Verify all variables set
npm run env:check

# Common missing variables
- CONVEX_DEPLOY_KEY
- Payment provider secrets
- Email service keys
```

#### Database Connection Issues
```bash
# Check Convex status
npx convex dashboard

# Verify deployment
npx convex deploy --prod

# Check functions
npx convex logs --prod
```

#### Payment Provider Issues
```bash
# Verify webhook delivery
Check provider dashboard → Webhooks → Recent deliveries

# Test API connection
curl https://api.squareup.com/v2/locations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Performance Issues

#### Slow Page Load
```bash
# Analyze bundle size
npm run analyze

# Optimize images
npm run optimize:images

# Enable CDN
Configure Cloudflare/Fastly
```

#### Database Queries
```bash
# Check slow queries
npx convex dashboard → Functions → Performance

# Add indexes if needed
Update schema.ts with new indexes
```

---

## Support & Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Convex Docs](https://docs.convex.dev)
- [Square API](https://developer.squareup.com/docs)
- [Stripe API](https://stripe.com/docs/api)
- [PayPal API](https://developer.paypal.com/docs)

### Support Channels
- **Technical Issues**: dev@stepperslife.com
- **Payment Support**: payments@stepperslife.com
- **Emergency**: +1-xxx-xxx-xxxx

### Community
- Discord: https://discord.gg/stepperslife
- GitHub Issues: https://github.com/yourusername/stepperslife/issues
- Stack Overflow: Tag with `stepperslife`

---

End of Deployment & Setup Guide