import { useNavigate } from "react-router-dom";
import { useProjectStore } from "../store/projectStore";

export function HomePage() {
  const navigate = useNavigate();
  const projects = useProjectStore((s) => s.projects);

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
          <svg className="h-8 w-8 text-[var(--color-brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
          </svg>
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">Welcome to Kanban</h1>
        <p className="mb-6 text-sm text-gray-500">
          {projects.length > 0
            ? "Select a project from the sidebar to get started."
            : "Create your first project to start managing tasks."}
        </p>
        {projects.length === 0 && (
          <button className="btn-primary" onClick={() => navigate("/projects/new")}>
            Create Project
          </button>
        )}
      </div>
    </div>
  );
}
