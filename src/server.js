import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import typeDefs from './schema.js';
import resolvers from './resolvers.js';
import { setupDatabase } from './db.js';

/**
 * Initialize and start the GraphQL application server.
 *
 * This function performs database schema setup before exposing the GraphQL
 * endpoint and supporting GET query execution for convenience.
 */
async function startServer() {
  await setupDatabase();

  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  /**
   * Allow simple GET-based GraphQL queries via query string parameters.
   *
   * Note: POST remains the recommended method for GraphQL operations,
   * especially for mutations and larger payloads.
   */
  app.get('/graphql', async (req, res) => {
    const query = String(req.query.query || '');
    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }

    let variables;
    if (req.query.variables) {
      try {
        variables = JSON.parse(String(req.query.variables));
      } catch (error) {
        return res.status(400).json({ error: 'variables must be valid JSON' });
      }
    }

    const result = await server.executeOperation({ query, variables });
    return res.json(result);
  });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`GraphQL server ready at http://localhost:${port}${server.graphqlPath}`);
  });
}

export default startServer;
