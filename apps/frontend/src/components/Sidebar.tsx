import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Project } from "@kanban/types";
import { useAuthStore } from "../store/authStore";
import { useProjectStore } from "../store/projectStore";
import { useSprintStore } from "../store/sprintStore";
import { useEpicStore } from "../store/epicStore";
import { cn } from "../lib/utils";
import { SPRINT_STATUS_LABELS, ROLE_LABELS } from "@kanban/types";
import type { MemberRole } from "@kanban/types";

interface SidebarProps {
  projects: Project[];
  currentProjectId?: string;
}

export function Sidebar({ projects, currentProjectId }: SidebarProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const sprints = useSprintStore((s) => s.sprints);
  const selectedSprintId = useSprintStore((s) => s.selectedSprintId);
  const selectSprint = useSprintStore((s) => s.selectSprint);
  const createSprint = useSprintStore((s) => s.createSprint);
  const epics = useEpicStore((s) => s.epics);
  const selectedEpicId = useEpicStore((s) => s.selectedEpicId);
  const selectEpic = useEpicStore((s) => s.selectEpic);
  const createEpic = useEpicStore((s) => s.createEpic);
  const currentProject = useProjectStore((s) => s.currentProject);
  const addMember = useProjectStore((s) => s.addMember);
  const removeMember = useProjectStore((s) => s.removeMember);

  const [showSprints, setShowSprints] = useState(true);
  const [showEpics, setShowEpics] = useState(true);
  const [showMembers, setShowMembers] = useState(true);

  const [creatingEpic, setCreatingEpic] = useState(false);
  const [epicTitle, setEpicTitle] = useState("");
  const [epicSaving, setEpicSaving] = useState(false);

  const [creatingSprint, setCreatingSprint] = useState(false);
  const [sprintName, setSprintName] = useState("");
  const [sprintStart, setSprintStart] = useState("");
  const [sprintEnd, setSprintEnd] = useState("");
  const [sprintSaving, setSprintSaving] = useState(false);

  const [addingMember, setAddingMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<MemberRole>("MEMBER");
  const [memberSaving, setMemberSaving] = useState(false);
  const [memberError, setMemberError] = useState("");

  const members = currentProject?.members ?? [];
  const currentUserRole = members.find((m) => m.userId === user?.id)?.role;
  const isAdmin = currentUserRole === "ADMIN";

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!memberEmail.trim() || !currentProjectId) return;
    setMemberSaving(true);
    setMemberError("");
    try {
      await addMember(currentProjectId, { email: memberEmail.trim(), role: memberRole });
      setMemberEmail("");
      setMemberRole("MEMBER");
      setAddingMember(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add member";
      setMemberError(msg);
    } finally {
      setMemberSaving(false);
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!currentProjectId) return;
    try {
      await removeMember(currentProjectId, userId);
    } catch {
      // silently fail — member may already be removed
    }
  }

  async function handleCreateEpic(e: React.FormEvent) {
    e.preventDefault();
    if (!epicTitle.trim() || !currentProjectId) return;
    setEpicSaving(true);
    try {
      await createEpic(currentProjectId, { title: epicTitle.trim() });
      setEpicTitle("");
      setCreatingEpic(false);
    } finally {
      setEpicSaving(false);
    }
  }

  async function handleCreateSprint(e: React.FormEvent) {
    e.preventDefault();
    if (!sprintName.trim() || !sprintStart || !sprintEnd || !currentProjectId) return;
    setSprintSaving(true);
    try {
      await createSprint(currentProjectId, {
        name: sprintName.trim(),
        startDate: new Date(sprintStart).toISOString(),
        endDate: new Date(sprintEnd).toISOString(),
      });
      setSprintName("");
      setSprintStart("");
      setSprintEnd("");
      setCreatingSprint(false);
    } finally {
      setSprintSaving(false);
    }
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-brand)]">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
          </svg>
        </div>
        <span className="text-sm font-bold text-gray-900">Kanban</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        {/* Projects */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Projects</h3>
            <button
              onClick={() => navigate("/projects/new")}
              className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="New project"
            >
              <PlusIcon size={14} />
            </button>
          </div>
          <nav className="space-y-0.5">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}/board`)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                  p.id === currentProjectId
                    ? "bg-blue-50 text-[var(--color-brand)] font-medium"
                    : "text-gray-700 hover:bg-gray-100",
                )}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-200 text-[10px] font-bold text-gray-600">
                  {p.key.slice(0, 2)}
                </span>
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sprints — always visible when inside a project */}
        {currentProjectId && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <button
                onClick={() => setShowSprints(!showSprints)}
                className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600"
              >
                <svg className={cn("h-3 w-3 transition-transform", showSprints && "rotate-90")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Sprints
              </button>
              <button
                onClick={() => { setCreatingSprint(true); setShowSprints(true); }}
                className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="New sprint"
              >
                <PlusIcon size={14} />
              </button>
            </div>
            {showSprints && (
              <nav className="space-y-0.5">
                <button
                  onClick={() => selectSprint(null)}
                  className={cn(
                    "flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                    !selectedSprintId ? "bg-blue-50 text-[var(--color-brand)] font-medium" : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  All sprints
                </button>
                {sprints.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => selectSprint(s.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                      s.id === selectedSprintId ? "bg-blue-50 text-[var(--color-brand)] font-medium" : "text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    <span className="truncate">{s.name}</span>
                    <span className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                      s.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                      s.status === "COMPLETED" ? "bg-gray-100 text-gray-500" :
                      "bg-blue-100 text-blue-700",
                    )}>
                      {SPRINT_STATUS_LABELS[s.status]}
                    </span>
                  </button>
                ))}
                {sprints.length === 0 && !creatingSprint && (
                  <p className="px-2 py-1.5 text-xs text-gray-400">No sprints yet</p>
                )}

                {/* Inline sprint creation form */}
                {creatingSprint && (
                  <form onSubmit={handleCreateSprint} className="mt-1 space-y-1.5 rounded-md border border-gray-200 bg-gray-50 p-2">
                    <input
                      type="text"
                      placeholder="Sprint name"
                      value={sprintName}
                      onChange={(e) => setSprintName(e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-[var(--color-brand)] focus:outline-none"
                      autoFocus
                      required
                    />
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="date"
                        value={sprintStart}
                        onChange={(e) => setSprintStart(e.target.value)}
                        className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs focus:border-[var(--color-brand)] focus:outline-none"
                        required
                      />
                      <input
                        type="date"
                        value={sprintEnd}
                        onChange={(e) => setSprintEnd(e.target.value)}
                        className="w-full rounded border border-gray-300 px-1.5 py-1 text-xs focus:border-[var(--color-brand)] focus:outline-none"
                        required
                      />
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="submit"
                        disabled={sprintSaving || !sprintName.trim() || !sprintStart || !sprintEnd}
                        className="flex-1 rounded bg-[var(--color-brand)] px-2 py-1 text-xs font-medium text-white hover:bg-[var(--color-brand-hover)] disabled:opacity-50"
                      >
                        {sprintSaving ? "..." : "Create"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCreatingSprint(false); setSprintName(""); setSprintStart(""); setSprintEnd(""); }}
                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </nav>
            )}
          </div>
        )}

        {/* Epics — always visible when inside a project */}
        {currentProjectId && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <button
                onClick={() => setShowEpics(!showEpics)}
                className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600"
              >
                <svg className={cn("h-3 w-3 transition-transform", showEpics && "rotate-90")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Epics
              </button>
              <button
                onClick={() => { setCreatingEpic(true); setShowEpics(true); }}
                className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="New epic"
              >
                <PlusIcon size={14} />
              </button>
            </div>
            {showEpics && (
              <nav className="space-y-0.5">
                <button
                  onClick={() => selectEpic(null)}
                  className={cn(
                    "flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                    !selectedEpicId ? "bg-blue-50 text-[var(--color-brand)] font-medium" : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  All epics
                </button>
                {epics.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => selectEpic(e.id)}
                    className={cn(
                      "flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                      e.id === selectedEpicId ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    <span className="mr-2 text-purple-400">&#9679;</span>
                    <span className="truncate">{e.title}</span>
                  </button>
                ))}
                {epics.length === 0 && !creatingEpic && (
                  <p className="px-2 py-1.5 text-xs text-gray-400">No epics yet</p>
                )}

                {/* Inline epic creation form */}
                {creatingEpic && (
                  <form onSubmit={handleCreateEpic} className="mt-1 space-y-1.5 rounded-md border border-gray-200 bg-gray-50 p-2">
                    <input
                      type="text"
                      placeholder="Epic title"
                      value={epicTitle}
                      onChange={(e) => setEpicTitle(e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-[var(--color-brand)] focus:outline-none"
                      autoFocus
                      required
                    />
                    <div className="flex gap-1">
                      <button
                        type="submit"
                        disabled={epicSaving || !epicTitle.trim()}
                        className="flex-1 rounded bg-[var(--color-brand)] px-2 py-1 text-xs font-medium text-white hover:bg-[var(--color-brand-hover)] disabled:opacity-50"
                      >
                        {epicSaving ? "..." : "Create"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCreatingEpic(false); setEpicTitle(""); }}
                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </nav>
            )}
          </div>
        )}

        {/* Members */}
        {currentProjectId && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <button
                onClick={() => setShowMembers(!showMembers)}
                className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600"
              >
                <svg className={cn("h-3 w-3 transition-transform", showMembers && "rotate-90")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Members
              </button>
              {isAdmin && (
                <button
                  onClick={() => { setAddingMember(true); setShowMembers(true); setMemberError(""); }}
                  className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  title="Add member"
                >
                  <PlusIcon size={14} />
                </button>
              )}
            </div>
            {showMembers && (
              <div className="space-y-1">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-md px-2 py-1.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-medium text-gray-600">
                        {m.user?.name?.charAt(0).toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-gray-700">{m.user?.name ?? "Unknown"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                        m.role === "ADMIN" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500",
                      )}>
                        {ROLE_LABELS[m.role]}
                      </span>
                      {isAdmin && m.userId !== user?.id && (
                        <button
                          onClick={() => handleRemoveMember(m.userId)}
                          className="rounded p-0.5 text-gray-300 hover:bg-red-50 hover:text-red-500"
                          title="Remove member"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {members.length === 0 && !addingMember && (
                  <p className="px-2 py-1.5 text-xs text-gray-400">No members</p>
                )}

                {addingMember && (
                  <form onSubmit={handleAddMember} className="mt-1 space-y-1.5 rounded-md border border-gray-200 bg-gray-50 p-2">
                    <input
                      type="email"
                      placeholder="User email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-[var(--color-brand)] focus:outline-none"
                      autoFocus
                      required
                    />
                    <select
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value as MemberRole)}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-[var(--color-brand)] focus:outline-none"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    {memberError && (
                      <p className="text-xs text-red-500">{memberError}</p>
                    )}
                    <div className="flex gap-1">
                      <button
                        type="submit"
                        disabled={memberSaving || !memberEmail.trim()}
                        className="flex-1 rounded bg-[var(--color-brand)] px-2 py-1 text-xs font-medium text-white hover:bg-[var(--color-brand-hover)] disabled:opacity-50"
                      >
                        {memberSaving ? "..." : "Add"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAddingMember(false); setMemberEmail(""); setMemberError(""); }}
                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation links */}
        {currentProjectId && (
          <div className="mb-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Views</h3>
            <nav className="space-y-0.5">
              <button
                onClick={() => navigate(`/projects/${currentProjectId}/board`)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                </svg>
                Board
              </button>
              <button
                onClick={() => navigate(`/projects/${currentProjectId}/backlog`)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Backlog
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* User footer */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="truncate text-sm text-gray-700">{user?.name}</span>
          </div>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="Sign out"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

function PlusIcon({ size = 14 }: { size?: number }) {
  return (
    <svg className={`h-[${size}px] w-[${size}px]`} style={{ width: size, height: size }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
