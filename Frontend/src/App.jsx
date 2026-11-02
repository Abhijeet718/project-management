import { Navigate, Route, Routes } from 'react-router-dom'
import AuthLayout from './layouts/AuthLayout.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import ProjectDetailsPage from './pages/ProjectDetailsPage.jsx'
import ProjectTasksPage from './pages/ProjectTasksPage.jsx'
import TaskDetailsPage from './pages/TaskDetailsPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import { ProtectedRoute, PublicOnlyRoute } from './components/AuthRoutes.jsx'

function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
          <Route path="/projects/:projectId/tasks" element={<ProjectTasksPage />} />
          <Route path="/projects/:projectId/tasks/:taskId" element={<TaskDetailsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
