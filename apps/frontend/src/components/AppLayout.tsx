import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useProjectStore } from "../store/projectStore";
import { Sidebar } from "./Sidebar";

/** Extract projectId from URL paths like /projects/:projectId/board */
function useCurrentProjectId(): string | undefined {
  const { pathname } = useLocation();
  const match = pathname.match(/^\/projects\/([^/]+)/);
  return match?.[1];
}

export function AppLayout() {
  const projectId = useCurrentProjectId();
  const projects = useProjectStore((s) => s.projects);
  const fetchProjects = useProjectStore((s) => s.fetchProjects);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar projects={projects} currentProjectId={projectId} />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
