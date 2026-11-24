import "dotenv/config";

import app from "./app.js";

const port = Number(process.env.PORT ?? 3001);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("Invalid server port configuration.");
}

const server = app.listen(port, "0.0.0.0", () => {
  console.log(
    `VendorLens API running at http://localhost:${port}`
  );
});

// Graceful shutdown.
function shutdown(signal: string) {
  console.log(`${signal} received. Closing server...`);

  server.close(() => {
    console.log("Server closed successfully.");
    process.exit(0);
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));