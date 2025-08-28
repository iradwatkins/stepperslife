#!/bin/bash
# STEPPERSLIFE PRODUCTION DEPLOYMENT SCRIPT
# Execute these commands on server 72.60.28.175

echo "🚀 Starting SteppersLife Production Deployment..."

# 1. Navigate and clone
echo "📦 Cloning latest code from GitHub..."
cd /opt && rm -rf stepperslife
git clone https://github.com/iradwatkins/stepperslife.git
cd stepperslife

# 2. Configure Next.js for production
echo "⚙️ Configuring Next.js..."
cat > next.config.js << 'EOF'
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',
  images: { 
    remotePatterns: [{ 
      protocol: "https", 
      hostname: "**" 
    }] 
  }
}
module.exports = nextConfig
EOF

# 3. Set production environment
echo "🔐 Setting environment variables..."
cat > .env.production << 'EOF'
NODE_ENV=production
PLATFORM_FEE_PER_TICKET=1.50
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=MNPqnyyK7CDiaLwgHQEj+cpt0miM03ff0ECPxl5VKdc=
GOOGLE_CLIENT_ID=1009301533734-s9lbcqhrhehvtmd2bbrpkuvf4oo7ov3v.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
CONVEX_DEPLOYMENT=prod:mild-newt-621
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE
DATABASE_URL="file:./dev.db"
EOF

# 4. Build Docker image
echo "🏗️ Building Docker image..."
docker build --no-cache -t stepperslife:latest .

# 5. Stop old container
echo "🛑 Stopping old container..."
docker stop stepperslife-prod 2>/dev/null || true
docker rm stepperslife-prod 2>/dev/null || true

# 6. Start new container
echo "✨ Starting new container..."
docker run -d \
  --name stepperslife-prod \
  --restart unless-stopped \
  --network coolify \
  -p 3000:3000 \
  --env-file .env.production \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.stepperslife.rule=Host(\`stepperslife.com\`)" \
  --label "traefik.http.services.stepperslife.loadbalancer.server.port=3000" \
  stepperslife:latest

# 7. Verify deployment
echo "✅ Verifying deployment..."
sleep 5
docker ps | grep stepperslife-prod
curl -s http://localhost:3000/version | jq .

echo "🎉 Deployment complete!"
echo ""
echo "📋 New features deployed:"
echo "  ✅ Event image upload (main + gallery images)"
echo "  ✅ Google address autocomplete integration"
echo "  ✅ Enhanced bundle UI with visual ticket grouping"
echo ""
echo "🌐 Visit https://stepperslife.com to see the changes"