import http from "http";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { startFireUpdateJob } from "./jobs/fireUpdateJob.js";
import { initWebSocket } from "./services/websocketService.js";
import { logger } from "./utils/logger.js";

const server = http.createServer(app);
initWebSocket(server);
startFireUpdateJob();

server.listen(env.port, () => {
  logger.info(`FirePath backend listening on port ${env.port}`);
});
