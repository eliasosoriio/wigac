import { Outlet } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ChevronUp } from 'lucide-react';
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
  const [showBackToTop, setShowBackToTop] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const { isOpen: projectModalOpen, project, closeModal: closeProjectModal, refreshProjects } = useProjectModalStore();
  const { isOpen: taskModalOpen, task, closeModal: closeTaskModal, refreshTasks } = useTaskModalStore();
  const { isOpen: subtaskModalOpen, subtask, taskId, closeModal: closeSubtaskModal, refreshSubtasks } = useSubtaskModalStore();

  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    const handleScroll = () => {
      setShowBackToTop(mainElement.scrollTop > 400);
    };

    mainElement.addEventListener('scroll', handleScroll);
    return () => mainElement.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    mainRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="flex h-screen bg-apple-gray-50 dark:bg-dark-bg overflow-hidden transition-colors duration-200">
      <Sidebar onOpenProfile={() => setShowProfileModal(true)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main ref={mainRef} className="flex-1 overflow-y-auto scrollbar-thin p-8 relative">
          <Outlet />

          {/* Back to Top Button */}
          {showBackToTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 w-12 h-12 bg-apple-orange-500 hover:bg-apple-orange-600 dark:bg-apple-orange-600 dark:hover:bg-apple-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 animate-fade-in"
              title="Volver arriba"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          )}
        </main>
      </div>

      {/* All Modals - Rendered at root level with proper z-index */}
      {showProfileModal && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {projectModalOpen && (
        <ProjectModal
          isOpen={projectModalOpen}
          onClose={closeProjectModal}
          onSuccess={refreshProjects}
          project={project}
        />
      )}

      {taskModalOpen && (
        <TaskModal
          isOpen={taskModalOpen}
          onClose={closeTaskModal}
          onSuccess={refreshTasks}
          task={task}
        />
      )}

      {subtaskModalOpen && taskId && (
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
