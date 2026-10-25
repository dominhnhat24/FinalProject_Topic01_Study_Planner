
import "dotenv/config";
import app from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";

async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, "0.0.0.0", () => {
      console.log(`Backend running on port ${env.PORT}`);
      console.log(`Health check: http://localhost:${env.PORT}/api/health`);
    });

    server.on("error", (error) => {
      console.error("Server error:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start backend:", error);
    process.exit(1);
  }
}

void startServer();
