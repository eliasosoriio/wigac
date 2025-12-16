import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/projects/ProjectDetail';
import TasksLayout from './pages/tasks/TasksLayout';
import Kanban from './pages/kanban/Kanban';
import Map from './pages/map/Map';
import Wiki from './pages/wiki/Wiki';
import WikiEditor from './pages/wiki/WikiEditor';

function AppRoutes() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

        <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="tasks" element={<TasksLayout />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="map" element={<Map />} />
          <Route path="wiki" element={<Wiki />} />
          <Route path="wiki/:id" element={<WikiEditor />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
