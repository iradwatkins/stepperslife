export async function register() {
  // Only run in Node.js runtime
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🚀 Initializing error handlers and monitoring...');
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('🔥 Unhandled Promise Rejection:', reason);
      // Log but don't exit - let PM2 handle process management
      // In production, you might want to send this to a logging service
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('🔥 Uncaught Exception:', error);
      // Log the error but let PM2 restart if needed
      // Give time to flush logs
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    });
    
    // Monitor memory usage
    const checkMemory = () => {
      const used = process.memoryUsage();
      const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
      const rssMB = Math.round(used.rss / 1024 / 1024);
      
      console.log(`📊 Memory: Heap ${heapUsedMB}/${heapTotalMB} MB, RSS: ${rssMB} MB`);
      
      // Warn if memory usage is high
      if (heapUsedMB > 700) {
        console.warn(`⚠️ High memory usage: ${heapUsedMB} MB`);
        // Force garbage collection if available
        if (global.gc) {
          console.log('🧹 Running garbage collection...');
          global.gc();
        }
      }
    };
    
    // Check memory every 5 minutes
    setInterval(checkMemory, 5 * 60 * 1000);
    
    // Log startup information
    console.log(`✅ Process monitoring initialized`);
    console.log(`   PID: ${process.pid}`);
    console.log(`   Node: ${process.version}`);
    console.log(`   Environment: ${process.env.NODE_ENV}`);
  }
}