import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ProfileModal from '../profile/ProfileModal';
import ProjectModal from '../projects/ProjectModal';
import TaskModal from '../tasks/TaskModal';
import SubtaskModal from '../tasks/SubtaskModal';
import { useProjectModalStore } from '../../store/projectModalStore';
import { useTaskModalStore } from '../../store/taskModalStore';
import { useSubtaskModalStore } from '../../store/subtaskModalStore';

const Layout = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { isOpen: projectModalOpen, project, closeModal: closeProjectModal, refreshProjects } = useProjectModalStore();
  const { isOpen: taskModalOpen, task, closeModal: closeTaskModal, refreshTasks } = useTaskModalStore();
  const { isOpen: subtaskModalOpen, subtask, taskId, closeModal: closeSubtaskModal, refreshSubtasks } = useSubtaskModalStore();

  return (
    <div className="flex h-screen bg-apple-gray-50 dark:bg-dark-bg overflow-hidden transition-colors duration-200">
      <Sidebar onOpenProfile={() => setShowProfileModal(true)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-8">
          <Outlet />
        </main>
      </div>

      {/* Profile Modal - Rendered at app level */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Project Modal - Rendered at app level */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={closeProjectModal}
        onSuccess={refreshProjects}
        project={project}
      />

      {/* Task Modal - Rendered at app level */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={closeTaskModal}
        onSuccess={refreshTasks}
        task={task}
      />

      {/* Subtask Modal - Rendered at app level */}
      {taskId && (
        <SubtaskModal
          isOpen={subtaskModalOpen}
          onClose={closeSubtaskModal}
          onSuccess={refreshSubtasks}
          taskId={taskId}
          subtask={subtask}
        />
      )}
    </div>
  );
};

export default Layout;
