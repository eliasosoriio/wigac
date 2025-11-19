import { Bell, Search } from 'lucide-react';
import { Input } from '../ui';

const Header = () => {
  return (
    <header className="glass border-b border-apple-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <Input
            type="search"
            placeholder="Buscar proyectos, tareas..."
            icon={<Search className="w-5 h-5" />}
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-apple-gray-100 transition-colors relative">
            <Bell className="w-5 h-5 text-apple-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-apple-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
