# 🎯 Manual Event Creation Test Guide with Image Upload

## ✅ System Status
- **MinIO**: ✅ Running on port 9000
- **Dev Server**: ✅ Running on port 3006  
- **Upload Endpoint**: ✅ Available at `/api/upload/minio`
- **Authentication**: ✅ Clerk configured and working

## 📋 Step-by-Step Manual Testing

### 1️⃣ Open Browser
```bash
open http://localhost:3006/organizer/new-event
```

### 2️⃣ Sign In or Create Account
- If redirected to sign-in page:
  - **Sign Up**: Click "Sign up" and create a test account
  - **Sign In**: Use existing credentials
- After authentication, you'll be redirected back to event creation

### 3️⃣ Select Event Type
- Click **"Single-Day Event"** option

### 4️⃣ Fill Basic Information
- **Event Name**: "Miami Beach Dance Festival 2025"
- **Description**: "Join us for an amazing night of dance and live music!"
- **Categories**: Select "Social Dance" and "Lounge/Bar"

### 5️⃣ Upload Event Image (CRITICAL TEST)
- Look for **"Event Images (Optional)"** section
- Click **"Main Event Image (Optional)"** upload area
- Select any image from your computer (JPG/PNG)
- **WATCH FOR**:
  - Loading spinner appears
  - Image preview shows after upload
  - No error messages appear
  - Console (F12) shows successful upload

### 6️⃣ Complete Location Details
- **Venue**: "Grand Ballroom Miami"
- **Address**: "123 Ocean Drive"
- **City**: "Miami Beach"
- **State**: "FL"
- **ZIP**: "33139"

### 7️⃣ Set Date and Time
- **Date**: Select any future date
- **Start Time**: 7:00 PM
- **End Time**: 11:00 PM (optional)

### 8️⃣ Configure Ticketing
- Click **"Next: Ticketing"**
- Select **"Yes - Selling Tickets"**
- Click **"Next"**

### 9️⃣ Set Capacity & Tickets
- **Total Capacity**: 200
- **Add Ticket Type**:
  - Name: "General Admission"
  - Quantity: 150
  - Price: $25
- Click **"Next"**

### 🔟 Skip Tables (Optional)
- Click **"Skip"** if tables section appears

### 1️⃣1️⃣ Review and Publish
- Review all information
- ✅ Check "I agree to terms and conditions"
- Click **"Publish Event"**

## 🔍 Verification Points

### Image Upload Success Indicators:
1. **During Upload**:
   - Loading spinner visible
   - "Uploading..." text appears

2. **After Upload**:
   - Image preview displayed
   - Remove (X) button visible
   - No error alerts

3. **In Browser Console** (F12):
   ```
   MinIO Configuration: {endpoint: 'localhost', port: '9000', ...}
   ```

4. **After Publishing**:
   - Event page shows uploaded image
   - Image URL contains `/api/storage/uploads/`

## 🐛 Troubleshooting

### If Image Upload Fails:
1. **Check MinIO Status**:
   ```bash
   docker ps | grep minio
   curl http://localhost:9000/minio/health/live
   ```

2. **Check Console Errors** (F12):
   - Network tab → Look for `/api/upload/minio` request
   - Console tab → Check for error messages

3. **Verify Authentication**:
   - Ensure you're signed in
   - Check for auth token in cookies

### Common Issues:
- **"Failed to upload image"**: MinIO not running → Run `docker-compose up -d minio`
- **404 on upload**: Not authenticated → Sign in first
- **Network error**: Check if dev server is running on port 3006

## ✅ Success Criteria

The test is successful when:
1. ✅ Event is created with all information
2. ✅ Image uploads without errors
3. ✅ Event page displays the uploaded image
4. ✅ Image is stored in MinIO (not just a placeholder)

## 📸 Evidence Collection

Take screenshots of:
1. Image upload in progress
2. Image preview after upload
3. Published event page with image
4. Browser console showing successful upload

## 🎉 Test Complete!

Once you've successfully created an event with an uploaded image, the system is working correctly!