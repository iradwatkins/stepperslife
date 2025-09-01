# How to Clear All Events from SteppersLife

## 🧹 Complete Event Reset Guide

This guide explains how to remove all events, test data, and mock data from the SteppersLife platform.

## Option 1: Admin Clear Events Page (Recommended)

### Steps:
1. **Sign in as Admin**
   - Go to https://stepperslife.com/sign-in
   - Sign in with your admin account (e.g., iradwatkins@gmail.com)

2. **Navigate to Clear Events**
   - Once signed in, go to `/admin/clear-events`
   - Or use the admin sidebar: Click "Clear Events" in the admin menu

3. **Follow the 3-Step Process**:
   - **Step 1**: Review the warning about what will be deleted
   - **Step 2**: Check current data counts (shows how many events, tickets, etc.)
   - **Step 3**: Confirm deletion

### What Gets Deleted:
- ✅ All events (test, mock, and real)
- ✅ All tickets and ticket purchases
- ✅ All table configurations
- ✅ All waiting lists
- ✅ All affiliate programs
- ✅ All scan logs
- ✅ All purchase records
- ✅ All event-related transactions

### What Is Preserved:
- ✅ User accounts remain intact
- ✅ System settings unchanged
- ✅ Platform configuration preserved

## Option 2: Admin Reset Data Page

For more granular control:

1. Go to `/admin/reset-data`
2. Use the "Clear Events" button
3. Type "RESET_ALL_DATA" to confirm

## Option 3: Direct API Call (Advanced)

If you have Convex access, you can run:

```javascript
// In Convex dashboard console
await ctx.runMutation(api.adminReset.clearAllEvents, {
  confirmReset: "RESET_ALL_DATA"
});
```

## Current Event Count

As of deployment, the system contains:
- 46 test events from initial setup
- Various mock tickets and purchases
- Sample affiliate programs

## After Clearing Events

Once events are cleared:
1. Homepage will show "0 events found"
2. All event pages will be empty
3. Ready for fresh, real event data

## Safety Features

- **3-step confirmation** prevents accidental deletion
- **Data preview** shows what will be deleted
- **No undo** - make sure you're ready before confirming
- **Admin only** - requires admin authentication

## Support

If you need assistance:
- Check the deployment logs
- Verify admin access permissions
- Contact technical support if issues persist

---

*Last Updated: 2025-09-01*
*Clear Events Feature Added: v3.2.0*