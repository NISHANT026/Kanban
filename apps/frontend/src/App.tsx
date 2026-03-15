import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { HomePage } from "./pages/HomePage";
import { NewProjectPage } from "./pages/NewProjectPage";
import { ProjectBoardPage } from "./pages/ProjectBoardPage";
import { ProjectBacklogPage } from "./pages/ProjectBacklogPage";
import { AppLayout } from "./components/AppLayout";
import { AuthGuard } from "./components/AuthGuard";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="projects/new" element={<NewProjectPage />} />
          <Route path="projects/:projectId/board" element={<ProjectBoardPage />} />
          <Route path="projects/:projectId/backlog" element={<ProjectBacklogPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
