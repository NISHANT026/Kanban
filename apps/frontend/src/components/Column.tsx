import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Task, TaskStatus } from "@kanban/types";
import { STATUS_LABELS } from "@kanban/types";
import { TaskCard } from "./TaskCard";
import { cn } from "../lib/utils";

interface ColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddClick: () => void;
}

const columnAccent: Record<TaskStatus, string> = {
  BACKLOG: "border-t-gray-400",
  TODO: "border-t-blue-400",
  IN_PROGRESS: "border-t-yellow-400",
  REVIEW: "border-t-purple-400",
  DONE: "border-t-green-400",
};

export function Column({ status, tasks, onTaskClick, onAddClick }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border-t-4 bg-gray-100/80",
        columnAccent[status],
        isOver && "bg-blue-50/60 ring-2 ring-[var(--color-brand)]/20",
      )}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {STATUS_LABELS[status]}
          </h2>
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-200 px-1.5 text-xs font-medium text-gray-600">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddClick}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
          aria-label={`Add task to ${STATUS_LABELS[status]}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2"
        style={{ minHeight: 100 }}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-xs text-gray-400">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}
