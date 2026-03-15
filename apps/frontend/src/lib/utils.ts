import type { TaskPriority } from "@kanban/types";

export function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function priorityColor(priority: TaskPriority) {
  switch (priority) {
    case "HIGH":
      return "bg-red-100 text-red-700";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-700";
    case "LOW":
      return "bg-green-100 text-green-700";
  }
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
