import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents, Task } from "@kanban/types";
import { useTaskStore } from "../store/taskStore";

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/**
 * Connects to the Socket.io server and joins the project room.
 * Passes the JWT token so the server can exclude the sender from broadcasts,
 * preventing double-application of the user's own actions.
 */
export function useSocket(projectId: string | undefined) {
  const socketRef = useRef<TypedSocket | null>(null);
  const upsertTask = useTaskStore((s) => s.upsertTask);
  const removeTaskLocal = useTaskStore((s) => s.removeTaskLocal);

  useEffect(() => {
    if (!projectId) return;

    const token = localStorage.getItem("token");
    const socketUrl = import.meta.env.VITE_SOCKET_URL || undefined;
    const socket: TypedSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("project:join", projectId);
    });

    socket.on("task:created", (task: Task) => upsertTask(task));
    socket.on("task:updated", (task: Task) => upsertTask(task));
    socket.on("task:deleted", (taskId: string) => removeTaskLocal(taskId));

    return () => {
      socket.emit("project:leave", projectId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [projectId, upsertTask, removeTaskLocal]);
}
