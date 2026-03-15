import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@kanban/types";
import { PriorityBadge } from "./PriorityBadge";
import { Avatar } from "./Avatar";
import { formatDate, cn } from "../lib/utils";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isDragOverlay?: boolean;
}

export function TaskCard({ task, onClick, isDragOverlay }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "task", task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group cursor-grab rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing",
        isDragging && "opacity-40",
        isDragOverlay && "shadow-xl ring-2 ring-[var(--color-brand)] rotate-2",
      )}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          onClick();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}`}
    >
      {/* Epic label */}
      {task.epic && (
        <div className="mb-1.5 flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-purple-400" />
          <span className="text-[11px] font-medium text-purple-600 truncate">
            {task.epic.title}
          </span>
        </div>
      )}

      <h3 className="mb-2 text-sm font-medium text-gray-900 leading-snug line-clamp-2">
        {task.title}
      </h3>

      {task.description && (
        <p className="mb-2 text-xs text-gray-500 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={task.priority} />
          {task.storyPoints && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded bg-gray-100 px-1 text-[11px] font-semibold text-gray-600" title="Story points">
              {task.storyPoints}
            </span>
          )}
          <span className="text-[11px] text-gray-400">
            {formatDate(task.createdAt)}
          </span>
        </div>
        <Avatar name={task.assignee?.name ?? null} />
      </div>
    </div>
  );
}
