# Convex Database Migration Guide

## Migration from mild-newt-621 to youthful-porcupine-760

### Prerequisites
1. Access to both Convex deployments
2. Convex CLI installed (`npm install -g convex`)

### Step 1: Export Data from Old Deployment (mild-newt-621)

```bash
# Set environment to old deployment
export CONVEX_DEPLOYMENT=prod:mild-newt-621

# Export all tables
npx convex export --path ./convex-backup
```

### Step 2: Import Data to New Deployment (youthful-porcupine-760)

```bash
# Set environment to new deployment
export CONVEX_DEPLOYMENT=prod:youthful-porcupine-760

# Import all data
npx convex import --path ./convex-backup
```

### Alternative Method: Manual Table Export/Import

If the above doesn't work, you can export/import individual tables:

#### Export from mild-newt-621:
```javascript
// Run in Convex Dashboard Console for mild-newt-621
// https://dashboard.convex.dev/t/irawatkins/stepperslife/prod:mild-newt-621

// Export events
const events = await db.query("events").collect();
console.log(JSON.stringify(events, null, 2));

// Export users
const users = await db.query("users").collect();
console.log(JSON.stringify(users, null, 2));

// Export tickets
const tickets = await db.query("tickets").collect();
console.log(JSON.stringify(tickets, null, 2));

// Export purchases
const purchases = await db.query("purchases").collect();
console.log(JSON.stringify(purchases, null, 2));

// Export other tables as needed...
```

#### Import to youthful-porcupine-760:
```javascript
// Run in Convex Dashboard Console for youthful-porcupine-760
// https://dashboard.convex.dev/t/irawatkins/stepperslife/prod:youthful-porcupine-760

// Import events (paste the exported data)
const eventsData = [...]; // Paste exported events here
for (const event of eventsData) {
  const { _id, _creationTime, ...eventData } = event;
  await db.insert("events", eventData);
}

// Repeat for other tables...
```

### Step 3: Update Production Environment

Update the production server's environment variables:

```bash
ssh root@72.60.28.175

# Update .env.production
cd /opt/stepperslife
sed -i 's/mild-newt-621/youthful-porcupine-760/g' .env.production

# Restart the container
docker restart stepperslife-prod
```

### Step 4: Verify Migration

1. Check that all events are present in new deployment
2. Test user authentication
3. Verify ticket purchases work
4. Check that all data relationships are intact

### Important Tables to Migrate:
- events
- users
- tickets
- purchases
- ticketTypes
- tableConfigurations
- simpleTickets
- scanLogs
- platformTransactions
- sellers
- waitingList

### Notes:
- The `_id` and `_creationTime` fields are system-generated and will be different in the new deployment
- Relationships between tables should be preserved through the foreign key references
- Test thoroughly in a development environment first if possible