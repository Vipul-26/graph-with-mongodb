import express from "express";
import { ApolloServer } from "apollo-server-express";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import cors from "cors"; // Import CORS
import dotenv from "dotenv";
import typeDefs from "./schemas/typeDefs.js";
import resolvers from "./schemas/resolvers.js";
import connectDB from "./config/db.js";
import { authMiddleware } from "./middlewares/auth.js";

dotenv.config();

const app = express();
connectDB(); // Connect to MongoDB

// ✅ Enable CORS properly
const corsOptions = {
  origin: ["https://studio.apollographql.com", "http://localhost:4000"], // Adjust as needed
  credentials: true, // Important for handling authentication headers
};

app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON request
app.use(express.urlencoded({ extended: true })); // Support form data

const schema = makeExecutableSchema({ typeDefs, resolvers });

const server = new ApolloServer({
  schema,
  introspection: true, // Enable introspection
  playground: true, // Enable GraphQL Playground
  persistedQueries: false, // Disable persisted queries completely
  context: ({ req }) => {
    try {
      return authMiddleware(req); // Pass request through authMiddleware
    } catch (error) {
      console.error("Authentication Error:", error.message);
      return {}; // Return an empty object so public queries can still work
    }
  },
});

await server.start();
server.applyMiddleware({ app, cors: corsOptions }); // ✅ Ensure CORS is applied

// WebSocket for Subscriptions
const httpServer = app.listen(process.env.PORT || 4000, () => {
  console.log(
    `🚀 Server ready at http://localhost:${process.env.PORT || 4000}/graphql`
  );
});

const wsServer = new WebSocketServer({ server: httpServer });
useServer({ schema }, wsServer);
