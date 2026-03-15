import type { TaskPriority } from "@kanban/types";
import { PRIORITY_LABELS } from "@kanban/types";
import { priorityColor } from "../lib/utils";

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityColor(priority)}`}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
