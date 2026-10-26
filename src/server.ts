import "dotenv/config";
import app from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

async function startServer(): Promise<void> {
  await connectDatabase();

  const server = app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`Study Planner API listening on port ${env.PORT}`);
    console.log(`Health check: http://localhost:${env.PORT}/api/health`);
  });

  server.on("error", (error) => {
    console.error("HTTP server error:", error);
    process.exitCode = 1;
  });

  const shutdown = (signal: string) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      void disconnectDatabase()
        .catch((error) => console.error("Database disconnect error:", error))
        .finally(() => process.exit(0));
    });
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

startServer().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exitCode = 1;
});
