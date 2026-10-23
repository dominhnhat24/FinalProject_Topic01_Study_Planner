import app from "./app";
import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./config/db";

async function start() {
  await connectDatabase();
  const server = app.listen(env.PORT, () => {
    console.info(`Study Planner API listening on port ${env.PORT}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((error: unknown) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
