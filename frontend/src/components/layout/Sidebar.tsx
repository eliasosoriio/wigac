import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Columns,
  Clock,
  BookText,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { clsx } from 'clsx';

interface SidebarProps {
  onOpenProfile: () => void;
}

const Sidebar = ({ onOpenProfile }: SidebarProps) => {
  const { logout, user } = useAuthStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FolderKanban, label: 'Proyectos', path: '/projects' },
    { icon: CheckSquare, label: 'Tareas', path: '/tasks' },
    { icon: Columns, label: 'Kanban', path: '/kanban' },
    { icon: Clock, label: 'Time Tracking', path: '/timetracking' },
    { icon: BookText, label: 'Wiki', path: '/wiki' },
  ];

  return (
    <aside className="w-64 glass border-r border-apple-gray-200 flex flex-col">
      {/* Logo */}
      <NavLink
        to="/"
        className="p-6 border-b border-apple-gray-200 flex items-center justify-center hover:bg-apple-gray-50 transition-colors"
      >
        <img
          src="/logo.jpg"
          alt="Wigac"
          className="h-12 w-auto text-apple-gray-900"
        />
      </NavLink>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
          >
            <NavLink
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-apple transition-all duration-200',
                  isActive
                    ? 'bg-apple-blue-500 text-white shadow-apple'
                    : 'text-apple-gray-700 hover:bg-apple-gray-100'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-apple-gray-200">
        <button
          onClick={onOpenProfile}
          className="w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-apple hover:bg-apple-gray-100 transition-all duration-200 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-apple-blue-500 flex items-center justify-center text-white font-semibold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-apple-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-apple-gray-500 truncate">{user?.email}</p>
          </div>
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-apple text-apple-gray-700 hover:bg-apple-red-50 hover:text-apple-red-600 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
