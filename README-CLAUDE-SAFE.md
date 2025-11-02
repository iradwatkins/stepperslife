# Claude Code Safe Mode - SteppersLife Project

## Project Structure

This is the **SteppersLife** codebase which powers multiple domains:

- **stepperslife.com** (Port 3001) - Main platform
- **events.stepperslife.com** (Port 3004) - Events subdomain

## Important Notes

### Single Codebase, Multiple Services

Both websites run from this single Next.js application:
- The main stepperslife service runs on port 3001
- The events service runs on port 3004 using the same code

### Using Claude Code Safely

To work on this project with isolation protection:

```bash
cd ~/websites/stepperslife
claude-safe
```

This ensures Claude Code only modifies files within this project.

## Services

### Main Service (Port 3001)
```bash
systemctl status stepperslife
systemctl restart stepperslife
journalctl -u stepperslife -n 50 -f
```

### Events Service (Port 3004)
```bash
systemctl status events-stepperslife
systemctl restart events-stepperslife
journalctl -u events-stepperslife -n 50 -f
```

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server (port specified in package.json)
npm start

# Development mode
npm run dev
```

## Project Components

- `/app/events` - Events subdomain pages
- `/app/magazine` - Magazine section
- `/app/restaurants` - Restaurants directory
- `/app/classes` - Classes listings
- `/app/stores` - Store directory
- `/app/services` - Services directory

## Environment Files

- `.env` - Main environment configuration
- `.env.local` - Local overrides
- `.env.production` - Production-specific config

---

**Last Updated**: 2025-11-01
