import { createServer } from "http";
import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { initSocket } from "./lib/socket.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import epicRoutes from "./routes/epic.routes.js";
import sprintRoutes from "./routes/sprint.routes.js";

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/projects/:projectId/tasks", taskRoutes);
app.use("/projects/:projectId/epics", epicRoutes);
app.use("/projects/:projectId/sprints", sprintRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

// ─── Socket.io ───────────────────────────────────────────────────────
initSocket(httpServer, config.corsOrigin);

httpServer.listen(config.port, () => {
  console.log(`Backend running on http://localhost:${config.port}`);
});
