import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ProfileModal from '../profile/ProfileModal';
import ProjectModal from '../projects/ProjectModal';
import { useProjectModalStore } from '../../store/projectModalStore';

const Layout = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { isOpen, project, closeModal, refreshProjects } = useProjectModalStore();

  return (
    <div className="flex h-screen bg-apple-gray-50 overflow-hidden">
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
        isOpen={isOpen}
        onClose={closeModal}
        onSuccess={refreshProjects}
        project={project}
      />
    </div>
  );
};

export default Layout;
