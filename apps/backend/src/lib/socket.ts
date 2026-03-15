import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@kanban/types";

let io: Server<ClientToServerEvents, ServerToClientEvents>;

/** Maps userId -> Set of socket IDs, so we can exclude the sender from broadcasts */
const userSockets = new Map<string, Set<string>>();

export function initSocket(httpServer: HttpServer, corsOrigin: string) {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: corsOrigin },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) return next();
    try {
      const payload = jwt.verify(token, config.jwtSecret) as { userId: string };
      socket.data.userId = payload.userId;
    } catch {
      // Allow unauthenticated sockets — they just won't be tracked for dedup
    }
    next();
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string | undefined;
    if (userId) {
      if (!userSockets.has(userId)) userSockets.set(userId, new Set());
      userSockets.get(userId)!.add(socket.id);
    }

    socket.on("project:join", (projectId) => {
      socket.join(`project:${projectId}`);
    });

    socket.on("project:leave", (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on("disconnect", () => {
      if (userId) {
        const sockets = userSockets.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) userSockets.delete(userId);
        }
      }
    });
  });

  return io;
}

/**
 * Emit a task event to all users viewing a project, EXCEPT the user who
 * triggered the action (they already have the update from the API response).
 */
export function emitTaskEvent(
  projectId: string,
  event: "task:created" | "task:updated" | "task:deleted",
  payload: unknown,
  excludeUserId?: string,
) {
  if (!io) return;

  if (excludeUserId) {
    const sockets = userSockets.get(excludeUserId);
    if (sockets && sockets.size > 0) {
      let broadcast = io.to(`project:${projectId}`);
      for (const sid of sockets) {
        broadcast = broadcast.except(sid);
      }
      broadcast.emit(event, payload as never);
      return;
    }
  }

  io.to(`project:${projectId}`).emit(event, payload as never);
}
