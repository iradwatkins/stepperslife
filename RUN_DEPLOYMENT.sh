#!/usr/bin/expect -f

# Automated deployment script using expect
set timeout 600

spawn ssh root@72.60.28.175

expect "password:"
send "Bobby321&Gloria321Watkins12\r"

expect "root@"
send "echo 'Starting deployment...'\r"

# Stop existing container
send "docker stop stepperslife-prod 2>/dev/null || true\r"
expect "root@"
send "docker rm stepperslife-prod 2>/dev/null || true\r"
expect "root@"

# Clear port 3000
send "docker stop \$(docker ps -q --filter 'publish=3000') 2>/dev/null || true\r"
expect "root@"

# Get latest code
send "cd /opt && rm -rf stepperslife\r"
expect "root@"
send "git clone https://github.com/iradwatkins/stepperslife.git\r"
expect "root@"
send "cd stepperslife\r"
expect "root@"

# Configure build
send "cat > next.config.js << 'EOF'\r"
send "const nextConfig = {\r"
send "  eslint: { ignoreDuringBuilds: true },\r"
send "  typescript: { ignoreBuildErrors: true },\r"
send "  output: 'standalone',\r"
send "  images: { remotePatterns: \[{ protocol: 'https', hostname: '**' }\] }\r"
send "}\r"
send "module.exports = nextConfig\r"
send "EOF\r"
expect "root@"

# Build Docker image
send "docker build -t stepperslife:latest .\r"
expect "Successfully built"

# Run container
send "docker run -d --name stepperslife-prod --restart unless-stopped --network coolify -p 3000:3000 -e NODE_ENV=production -e PLATFORM_FEE_PER_TICKET=1.50 -e NEXTAUTH_URL=https://stepperslife.com -e NEXTAUTH_SECRET=MNPqnyyK7CDiaLwgHQEj+cpt0miM03ff0ECPxl5VKdc= -e GOOGLE_CLIENT_ID=1009301533734-s9lbcqhrhehvtmd2bbrpkuvf4oo7ov3v.apps.googleusercontent.com -e GOOGLE_CLIENT_SECRET=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 -e NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud -e CONVEX_DEPLOYMENT=prod:mild-newt-621 -e NEXT_PUBLIC_APP_URL=https://stepperslife.com -e NEXT_PUBLIC_APP_NAME=SteppersLife -e NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE -e DATABASE_URL='file:./dev.db' --label 'traefik.enable=true' --label 'traefik.http.routers.stepperslife.rule=Host(\`stepperslife.com\`)' --label 'traefik.http.services.stepperslife.loadbalancer.server.port=3000' stepperslife:latest\r"
expect "root@"

# Verify
send "docker ps | grep stepperslife\r"
expect "root@"
send "exit\r"

expect eof