import http from "http";
import { app } from "./app.js";
import { db, ensureDatabaseSchema } from "./config/db.js";
import { env } from "./config/env.js";
import { startFireUpdateJob } from "./jobs/fireUpdateJob.js";
import { initWebSocket } from "./services/websocketService.js";
import { logger } from "./utils/logger.js";

const server = http.createServer(app);

async function bootstrap() {
  await ensureDatabaseSchema();
  initWebSocket(server);
  startFireUpdateJob();

  server.listen(env.port, () => {
    logger.info(`FirePath backend listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  logger.error("Failed to bootstrap server:", error);
  db.end().catch(() => undefined);
  process.exit(1);
});
