module.exports = {
  apps: [
    {
      name: 'stepperslife-web',
      script: 'npm',
      args: 'start',
      cwd: '/root/websites/stepperslife',
      env: {
        NODE_ENV: 'production',
        PORT: '3001',
        NEXT_PUBLIC_USE_MOCK_DATA: 'true'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
