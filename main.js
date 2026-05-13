import startServer from './src/server.js';

/**
 * Application entry point.
 *
 * All server initialization and database setup are delegated to src/server.js.
 */
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
