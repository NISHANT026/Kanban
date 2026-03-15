import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectStore } from "../store/projectStore";

export function NewProjectPage() {
  const navigate = useNavigate();
  const createProject = useProjectStore((s) => s.createProject);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const project = await createProject({
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description.trim() || undefined,
      });
      navigate(`/projects/${project.id}/board`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-xl font-bold text-gray-900">Create Project</h1>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div>
            <label htmlFor="name" className="label">Project Name</label>
            <input id="name" type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Engineering" required autoFocus />
          </div>
          <div>
            <label htmlFor="key" className="label">Project Key</label>
            <input
              id="key"
              type="text"
              className="input uppercase"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              placeholder="ENG"
              maxLength={10}
              required
            />
            <p className="mt-1 text-xs text-gray-400">2-10 uppercase characters, used as task prefix</p>
          </div>
          <div>
            <label htmlFor="desc" className="label">Description</label>
            <textarea id="desc" className="input" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What is this project about?" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading || !name.trim() || key.length < 2}>
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
