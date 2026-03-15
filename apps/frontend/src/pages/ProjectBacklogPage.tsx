import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useProjectStore } from "../store/projectStore";
import { useTaskStore } from "../store/taskStore";
import { useSprintStore } from "../store/sprintStore";
import { useEpicStore } from "../store/epicStore";
import { useSocket } from "../hooks/useSocket";
import { BacklogView } from "../components/BacklogView";

export function ProjectBacklogPage() {
  const { projectId } = useParams<{ projectId: string }>();
  useSocket(projectId);
  const currentProject = useProjectStore((s) => s.currentProject);
  const selectProject = useProjectStore((s) => s.selectProject);
  const fetchTasks = useTaskStore((s) => s.fetchTasks);
  const isLoading = useTaskStore((s) => s.isLoading);
  const sprints = useSprintStore((s) => s.sprints);
  const selectedSprintId = useSprintStore((s) => s.selectedSprintId);
  const fetchSprints = useSprintStore((s) => s.fetchSprints);
  const epics = useEpicStore((s) => s.epics);
  const selectedEpicId = useEpicStore((s) => s.selectedEpicId);
  const fetchEpics = useEpicStore((s) => s.fetchEpics);

  useEffect(() => {
    if (!projectId) return;
    selectProject(projectId);
    fetchSprints(projectId);
    fetchEpics(projectId);
  }, [projectId, selectProject, fetchSprints, fetchEpics]);

  useEffect(() => {
    if (!projectId) return;
    fetchTasks(projectId, {
      sprintId: selectedSprintId ?? undefined,
      epicId: selectedEpicId ?? undefined,
    });
  }, [projectId, selectedSprintId, selectedEpicId, fetchTasks]);

  const members = useMemo(
    () => currentProject?.members?.map((m) => m.user!).filter(Boolean) ?? [],
    [currentProject],
  );

  if (!projectId) return null;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-gray-200 px-6 py-3">
        <h1 className="text-lg font-semibold text-gray-900">
          {currentProject?.name ?? "Loading..."}
        </h1>
        <p className="text-xs text-gray-500">Backlog view</p>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--color-brand)]" />
        </div>
      ) : (
        <BacklogView
          projectId={projectId}
          epics={epics}
          sprints={sprints}
          members={members}
        />
      )}
    </div>
  );
}
