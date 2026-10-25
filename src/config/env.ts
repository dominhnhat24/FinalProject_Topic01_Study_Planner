import "dotenv/config";

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3000),
  MONGODB_URI: process.env.MONGOOSE_CONNECTION_STRING ?? "",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? "*",
};

if (!env.MONGODB_URI) {
  throw new Error("Missing MONGOOSE_CONNECTION_STRING in .env");
}