#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 Setting up HashiCorp Vault for SteppersLife${NC}"

# Check if Vault is running
if ! curl -s http://localhost:8200/v1/sys/health > /dev/null; then
    echo -e "${YELLOW}Starting Vault server...${NC}"
    docker-compose up -d vault
    sleep 5
fi

# Set Vault address and token
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='myroot'

echo -e "${GREEN}✅ Vault is running${NC}"

# Enable KV v2 secrets engine
echo -e "${YELLOW}Enabling KV v2 secrets engine...${NC}"
vault secrets enable -version=2 -path=secret kv 2>/dev/null || echo "KV v2 already enabled"

# Function to store secrets
store_secret() {
    local path=$1
    local key=$2
    local value=$3
    
    vault kv put secret/$path $key="$value"
}

echo -e "${YELLOW}Please enter your credentials:${NC}"

# Square credentials
echo -e "${GREEN}Square Configuration:${NC}"
read -p "Square Access Token: " SQUARE_ACCESS_TOKEN
read -p "Square Application ID: " SQUARE_APPLICATION_ID
read -p "Square Location ID: " SQUARE_LOCATION_ID
read -p "Square Webhook Signature Key: " SQUARE_WEBHOOK_KEY

vault kv put secret/stepperslife/square \
    access_token="$SQUARE_ACCESS_TOKEN" \
    application_id="$SQUARE_APPLICATION_ID" \
    location_id="$SQUARE_LOCATION_ID" \
    webhook_signature_key="$SQUARE_WEBHOOK_KEY"

# Auth.js credentials
echo -e "${GREEN}Auth.js Configuration:${NC}"
read -p "NextAuth Secret (or press enter to generate): " NEXTAUTH_SECRET
if [ -z "$NEXTAUTH_SECRET" ]; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo "Generated NextAuth Secret: $NEXTAUTH_SECRET"
fi

read -p "Google Client ID: " GOOGLE_CLIENT_ID
read -p "Google Client Secret: " GOOGLE_CLIENT_SECRET
read -p "GitHub Client ID: " GITHUB_CLIENT_ID
read -p "GitHub Client Secret: " GITHUB_CLIENT_SECRET

vault kv put secret/stepperslife/auth \
    nextauth_secret="$NEXTAUTH_SECRET" \
    google_client_id="$GOOGLE_CLIENT_ID" \
    google_client_secret="$GOOGLE_CLIENT_SECRET" \
    github_client_id="$GITHUB_CLIENT_ID" \
    github_client_secret="$GITHUB_CLIENT_SECRET"

# Convex credentials
echo -e "${GREEN}Convex Configuration:${NC}"
read -p "Convex URL: " CONVEX_URL
read -p "Convex Deployment: " CONVEX_DEPLOYMENT
read -p "Convex Deploy Key: " CONVEX_DEPLOY_KEY

vault kv put secret/stepperslife/convex \
    url="$CONVEX_URL" \
    deployment="$CONVEX_DEPLOYMENT" \
    deploy_key="$CONVEX_DEPLOY_KEY"

echo -e "${GREEN}✅ All secrets have been stored in Vault!${NC}"

# Create a policy for the app
echo -e "${YELLOW}Creating app policy...${NC}"
vault policy write stepperslife-app - <<EOF
path "secret/data/stepperslife/*" {
  capabilities = ["read", "list"]
}

path "secret/metadata/stepperslife/*" {
  capabilities = ["list", "read"]
}
EOF

# Create an app token with the policy
APP_TOKEN=$(vault token create -policy=stepperslife-app -format=json | jq -r '.auth.client_token')

echo -e "${GREEN}✅ Vault setup complete!${NC}"
echo -e "${YELLOW}App token for production: ${NC}$APP_TOKEN"
echo -e "${YELLOW}Save this token securely - you'll need it for production deployment${NC}"

# Generate .env.vault file for local development
cat > .env.vault <<EOF
# Vault Configuration
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=$APP_TOKEN

# These will be fetched from Vault at runtime
# No need to store actual secrets in .env files anymore!
EOF

echo -e "${GREEN}✅ Created .env.vault file for local development${NC}"