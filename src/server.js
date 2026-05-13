import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import typeDefs from './v1/schema.js';
import resolvers from './v1/resolvers.js';
import { pool, setupDatabase } from './db.js';

const IS_PROD = process.env.NODE_ENV === 'production';

function corsMiddleware(req, res, next) {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
}

async function startServer() {
  await setupDatabase();

  const app = express();
  app.use(corsMiddleware);

  // Health check — useful for load balancers and uptime monitors
  app.get('/health', async (req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({
        status: 'ok',
        version: 'v1',
        timestamp: new Date().toISOString(),
      });
    } catch {
      res.status(503).json({
        status: 'error',
        version: 'v1',
        timestamp: new Date().toISOString(),
      });
    }
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,

    // Disable introspection in production to avoid schema exposure
    introspection: !IS_PROD,

    // Inject pool into every resolver via context instead of importing directly
    context: () => ({ pool }),

    // Strip internal stack details from production error responses
    formatError: (err) => ({
      message: err.message,
      code: err.extensions?.code || 'INTERNAL_SERVER_ERROR',
      ...(IS_PROD ? {} : { locations: err.locations, path: err.path }),
    }),
  });

  await server.start();
  server.applyMiddleware({ app, path: '/api/v1/graphql' });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`GraphQL API v1  →  http://localhost:${port}/api/v1/graphql`);
    console.log(`Health check    →  http://localhost:${port}/health`);
  });
}

export default startServer;
