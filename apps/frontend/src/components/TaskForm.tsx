import { useState } from "react";
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  STORY_POINTS,
  STATUS_LABELS,
  PRIORITY_LABELS,
  type Task,
  type CreateTaskInput,
  type TaskStatus,
  type TaskPriority,
  type Epic,
  type Sprint,
  type User,
} from "@kanban/types";

interface TaskFormProps {
  initial?: Task;
  defaultStatus?: TaskStatus;
  onSubmit: (data: CreateTaskInput) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
  submitLabel: string;
  epics?: Epic[];
  sprints?: Sprint[];
  members?: User[];
}

export function TaskForm({
  initial,
  defaultStatus,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel,
  epics = [],
  sprints = [],
  members = [],
}: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? defaultStatus ?? "BACKLOG");
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? "MEDIUM");
  const [storyPoints, setStoryPoints] = useState<number | "">(initial?.storyPoints ?? "");
  const [assigneeId, setAssigneeId] = useState(initial?.assigneeId ?? "");
  const [epicId, setEpicId] = useState(initial?.epicId ?? "");
  const [sprintId, setSprintId] = useState(initial?.sprintId ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        storyPoints: storyPoints === "" ? null : storyPoints,
        assigneeId: assigneeId || null,
        epicId: epicId || null,
        sprintId: sprintId || null,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="label">Title <span className="text-red-500">*</span></label>
        <input id="title" type="text" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" required autoFocus />
      </div>

      <div>
        <label htmlFor="description" className="label">Description</label>
        <textarea id="description" className="input min-h-[80px] resize-y" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add more details..." rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="label">Status</label>
          <select id="status" className="input" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
            {TASK_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="priority" className="label">Priority</label>
          <select id="priority" className="input" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
            {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="storyPoints" className="label">Story Points</label>
          <select id="storyPoints" className="input" value={storyPoints} onChange={(e) => setStoryPoints(e.target.value === "" ? "" : Number(e.target.value))}>
            <option value="">None</option>
            {STORY_POINTS.map((sp) => <option key={sp} value={sp}>{sp}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="assignee" className="label">Assignee</label>
          <select id="assignee" className="input" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="">Unassigned</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {epics.length > 0 && (
          <div>
            <label htmlFor="epic" className="label">Epic</label>
            <select id="epic" className="input" value={epicId} onChange={(e) => setEpicId(e.target.value)}>
              <option value="">No epic</option>
              {epics.map((ep) => <option key={ep.id} value={ep.id}>{ep.title}</option>)}
            </select>
          </div>
        )}
        {sprints.length > 0 && (
          <div>
            <label htmlFor="sprint" className="label">Sprint</label>
            <select id="sprint" className="input" value={sprintId} onChange={(e) => setSprintId(e.target.value)}>
              <option value="">No sprint</option>
              {sprints.map((sp) => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <div>
          {onDelete && (
            <button type="button" className="btn-danger" onClick={onDelete} disabled={isSubmitting}>Delete</button>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting || !title.trim()}>
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
