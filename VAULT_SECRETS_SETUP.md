# Vault Secrets Setup for Coolify Deployment

## Prerequisites
1. Vault must be installed and running on your server
2. You need the Vault root token

## Step 1: Setup Vault on Server (if not already done)

SSH into your server:
```bash
ssh root@72.60.28.175
```

Install and start Vault:
```bash
# Install Vault
curl -fsSL https://apt.releases.hashicorp.com/gpg | apt-key add -
apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
apt-get update && apt-get install vault

# Start Vault
vault server -dev -dev-listen-address="0.0.0.0:8200" &

# Get the root token (save this!)
vault status
```

## Step 2: Store Secrets in Vault

Run these commands on the server:

```bash
# Set Vault address
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='your-vault-root-token'

# Store Google OAuth credentials
vault kv put secret/stepperslife/auth \
  nextauth_secret="PVHgwvFomWusbkQdfI/PyXHDM7gd+1O9M7fQZeNauGk=" \
  google_client_id="325543338490-brk0cmodprdeto2sg19prjjlsc9dikrv.apps.googleusercontent.com" \
  google_client_secret="YOUR_ACTUAL_GOOGLE_SECRET" \
  github_client_id="" \
  github_client_secret=""

# Store Convex credentials
vault kv put secret/stepperslife/convex \
  url="https://mild-newt-621.convex.cloud" \
  deployment="prod:mild-newt-621" \
  deploy_key="YOUR_CONVEX_DEPLOY_KEY"

# Store Square credentials (when you have them)
vault kv put secret/stepperslife/square \
  access_token="" \
  application_id="sandbox-sq0idb-lDOb01gEPAIRUDv1iGi2MA" \
  location_id="LM1QSA6YG6BYR" \
  webhook_signature_key=""
```

## Step 3: Update Coolify Environment Variables

In Coolify, add these environment variables:

```env
# Vault Configuration
VAULT_ADDR=http://127.0.0.1:8200
VAULT_TOKEN=your-vault-root-token

# Public URLs (safe to expose)
NEXTAUTH_URL=http://72.60.28.175:3004
AUTH_URL=http://72.60.28.175:3004
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
NEXT_PUBLIC_APP_URL=http://72.60.28.175:3004
NEXT_PUBLIC_APP_NAME=SteppersLife

# Square Public IDs
NEXT_PUBLIC_SQUARE_APP_ID=sandbox-sq0idb-lDOb01gEPAIRUDv1iGi2MA
NEXT_PUBLIC_SQUARE_LOCATION_ID=LM1QSA6YG6BYR
SQUARE_ENVIRONMENT=sandbox

# Node environment
NODE_ENV=production
```

## Step 4: Test Vault Connection

Create a test endpoint to verify Vault is working:
```bash
curl http://72.60.28.175:3004/api/health
```

Should return:
```json
{
  "status": "healthy",
  "app": "SteppersLife",
  "deployment": "CORRECT_REPO_DEPLOYED"
}
```

## Security Notes

1. **NEVER** commit real secrets to GitHub
2. **ALWAYS** use Vault for sensitive data
3. The Vault token should be treated as highly sensitive
4. Consider using Vault policies instead of root token in production
5. Enable Vault audit logs for security compliance

## Troubleshooting

### If Vault connection fails:
1. Check Vault is running: `systemctl status vault`
2. Check firewall allows port 8200
3. Verify VAULT_ADDR is correct
4. Check VAULT_TOKEN is valid

### If secrets aren't loading:
1. Verify secrets exist: `vault kv get secret/stepperslife/auth`
2. Check application logs for Vault errors
3. Ensure Vault is accessible from Docker container

## Important Files
- `/lib/vault.ts` - Vault integration code
- `coolify-env.txt` - Environment template (no secrets)
- This file - Vault setup instructions