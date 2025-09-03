module.exports = {
  apps: [{
    name: 'stepperslife',
    script: 'server.js',
    instances: 1,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '800M',
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