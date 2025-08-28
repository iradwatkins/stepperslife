# Test Credentials for Local Development

## Available Test Users

You can use these credentials to sign in on localhost:

### 1. Test User
- **Email**: `test@example.com`
- **Password**: `test123`
- **Role**: User

### 2. Admin User
- **Email**: `admin@stepperslife.com`
- **Password**: `admin123`
- **Role**: Admin

### 3. Ira Watkins (Admin)
- **Email**: `irawatkins@gmail.com`  
- **Password**: `demo123`
- **Role**: Admin

## How to Use

1. Go to http://localhost:3001/auth/signin
2. You'll see a blue box with "Test Credentials (Local Only)"
3. Click any of the test accounts to auto-fill and sign in
4. Or manually enter the credentials in the form

## Note
- These credentials only work in development (localhost)
- They are NOT available in production for security
- The test credentials box is only visible when NODE_ENV !== 'production'

## Manual Sign In
You can also:
1. Click "Manual sign in" dropdown
2. Enter email and password manually
3. Click "Sign In"