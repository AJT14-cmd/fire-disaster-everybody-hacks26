import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import fireRoutes from "./routes/fireRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import integrationRoutes from "./routes/integrationRoutes.js";
import assistantRoutes from "./routes/assistantRoutes.js";
import { apiRateLimit } from "./middleware/rateLimit.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(apiRateLimit);

app.get("/api/health", (req, res) =>
  res.json({ ok: true, service: "firepath-backend", timestamp: new Date().toISOString() })
);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/fire", fireRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/integrations", integrationRoutes);
app.use("/api/assistant", assistantRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
