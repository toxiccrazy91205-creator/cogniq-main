import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";
import { sessionRoutes } from "./routes/sessions.js";
import { itemRoutes } from "./routes/items.js";
import { answerRoutes } from "./routes/answers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

// Register API routes
await app.register(sessionRoutes);
await app.register(itemRoutes);
await app.register(answerRoutes);

app.get("/api/health", async () => ({ status: "ok" }));

// Serve static frontend files if they exist
const clientPath = path.join(__dirname, "../../frontend/dist");
app.register(fastifyStatic, {
  root: clientPath,
  prefix: "/",
  wildcard: false, // Don't serve everything as static yet
});

// Handle client-side routing: serve index.html for any non-API route
app.setNotFoundHandler((request, reply) => {
  if (request.url.startsWith("/api")) {
    reply.status(404).send({ error: "Not Found" });
  } else {
    reply.sendFile("index.html");
  }
});

try {
  const port = Number(process.env.PORT) || 3001;
  await app.listen({ port, host: "0.0.0.0" });
  console.log(`Backend running on http://localhost:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

