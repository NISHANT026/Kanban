import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { TASK_STATUSES, type Task, type TaskStatus, type Epic, type Sprint, type User } from "@kanban/types";
import { useTaskStore } from "../store/taskStore";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";
import { Modal } from "./Modal";
import { TaskForm } from "./TaskForm";

interface BoardProps {
  projectId: string;
  epics: Epic[];
  sprints: Sprint[];
  members: User[];
}

export function Board({ projectId, epics, sprints, members }: BoardProps) {
  const { tasks, moveTask, addTask, editTask, removeTask } = useTaskStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [creatingInStatus, setCreatingInStatus] = useState<TaskStatus | null>(null);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      BACKLOG: [], TODO: [], IN_PROGRESS: [], REVIEW: [], DONE: [],
    };
    for (const task of tasks) {
      grouped[task.status].push(task);
    }
    return grouped;
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined;
    if (task) setActiveTask(task);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const taskId = active.id as string;
      let targetStatus: TaskStatus | undefined;

      if (TASK_STATUSES.includes(over.id as TaskStatus)) {
        targetStatus = over.id as TaskStatus;
      } else {
        // Dropped on a task card — resolve to that task's column
        const overTask = tasks.find((t) => t.id === over.id);
        if (overTask) targetStatus = overTask.status;
      }

      if (targetStatus) {
        const task = tasks.find((t) => t.id === taskId);
        if (task && task.status !== targetStatus) {
          moveTask(projectId, taskId, targetStatus);
        }
      }
    },
    [tasks, moveTask, projectId],
  );

  const handleCreate = useCallback(
    async (data: Parameters<typeof addTask>[1]) => {
      await addTask(projectId, data);
      setCreatingInStatus(null);
    },
    [addTask, projectId],
  );

  const handleEdit = useCallback(
    async (data: Parameters<typeof editTask>[2]) => {
      if (!editingTask) return;
      await editTask(projectId, editingTask.id, data);
      setEditingTask(null);
    },
    [editingTask, editTask, projectId],
  );

  const handleDelete = useCallback(async () => {
    if (!editingTask) return;
    await removeTask(projectId, editingTask.id);
    setEditingTask(null);
  }, [editingTask, removeTask, projectId]);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto p-6 pb-8">
          {TASK_STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onTaskClick={setEditingTask}
              onAddClick={() => setCreatingInStatus(status)}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask && (
            <TaskCard task={activeTask} onClick={() => {}} isDragOverlay />
          )}
        </DragOverlay>
      </DndContext>

      <Modal isOpen={creatingInStatus !== null} onClose={() => setCreatingInStatus(null)} title="Create Task">
        {creatingInStatus && (
          <TaskForm
            defaultStatus={creatingInStatus}
            onSubmit={handleCreate}
            onCancel={() => setCreatingInStatus(null)}
            submitLabel="Create"
            epics={epics}
            sprints={sprints}
            members={members}
          />
        )}
      </Modal>

      <Modal isOpen={editingTask !== null} onClose={() => setEditingTask(null)} title="Edit Task">
        {editingTask && (
          <TaskForm
            initial={editingTask}
            onSubmit={handleEdit}
            onCancel={() => setEditingTask(null)}
            onDelete={handleDelete}
            submitLabel="Save"
            epics={epics}
            sprints={sprints}
            members={members}
          />
        )}
      </Modal>
    </>
  );
}
