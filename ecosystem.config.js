module.exports = {
  apps: [{
    name: 'stepperslife',
    script: 'server.js',
    instances: 1,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '800M',
    min_uptime: '10s',              // Consider app stable after 10 seconds
    max_restarts: 10,                // Limit restart attempts to prevent infinite loops
    exp_backoff_restart_delay: 100, // Exponential backoff: 100ms, 200ms, 400ms, etc.
    env: {
      NODE_ENV: 'production',
      HOSTNAME: '0.0.0.0',
      PORT: 3000
    },
    error_file: '/dev/stdout',
    out_file: '/dev/stdout',
    log_file: '/dev/stdout',
    time: true,
    kill_timeout: 5000,
    listen_timeout: 5000,
    shutdown_with_message: true
  }]
};