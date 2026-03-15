import { useMemo, useState } from "react";
import { TASK_STATUSES, STATUS_LABELS, PRIORITY_LABELS, type Task, type Epic, type Sprint, type User } from "@kanban/types";
import { useTaskStore } from "../store/taskStore";
import { PriorityBadge } from "./PriorityBadge";
import { Avatar } from "./Avatar";
import { Modal } from "./Modal";
import { TaskForm } from "./TaskForm";

interface BacklogViewProps {
  projectId: string;
  epics: Epic[];
  sprints: Sprint[];
  members: User[];
}

export function BacklogView({ projectId, epics, sprints, members }: BacklogViewProps) {
  const { tasks, addTask, editTask, removeTask } = useTaskStore();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const grouped = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const s of TASK_STATUSES) map[s] = [];
    for (const t of tasks) map[t.status].push(t);
    return map;
  }, [tasks]);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Backlog</h2>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      <div className="space-y-6">
        {TASK_STATUSES.map((status) => (
          <div key={status}>
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {STATUS_LABELS[status]}
              </h3>
              <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                {grouped[status].length}
              </span>
            </div>
            {grouped[status].length === 0 ? (
              <p className="py-3 text-sm text-gray-400">No tasks</p>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100">
                {grouped[status].map((task) => (
                  <button
                    key={task.id}
                    onClick={() => setEditingTask(task)}
                    className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                      {task.epic && (
                        <span className="text-[11px] text-purple-600">{task.epic.title}</span>
                      )}
                    </div>
                    <PriorityBadge priority={task.priority} />
                    {task.storyPoints && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded bg-gray-100 px-1 text-[11px] font-semibold text-gray-600">
                        {task.storyPoints}
                      </span>
                    )}
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {task.sprint?.name ?? "No sprint"}
                    </span>
                    <Avatar name={task.assignee?.name ?? null} />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Task">
        <TaskForm
          onSubmit={async (data) => { await addTask(projectId, data); setShowCreate(false); }}
          onCancel={() => setShowCreate(false)}
          submitLabel="Create"
          epics={epics}
          sprints={sprints}
          members={members}
        />
      </Modal>

      <Modal isOpen={editingTask !== null} onClose={() => setEditingTask(null)} title="Edit Task">
        {editingTask && (
          <TaskForm
            initial={editingTask}
            onSubmit={async (data) => { await editTask(projectId, editingTask.id, data); setEditingTask(null); }}
            onCancel={() => setEditingTask(null)}
            onDelete={async () => { await removeTask(projectId, editingTask.id); setEditingTask(null); }}
            submitLabel="Save"
            epics={epics}
            sprints={sprints}
            members={members}
          />
        )}
      </Modal>
    </div>
  );
}
