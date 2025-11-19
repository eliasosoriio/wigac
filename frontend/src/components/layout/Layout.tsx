import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ProfileModal from '../profile/ProfileModal';

const Layout = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);

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
    </div>
  );
};

export default Layout;
