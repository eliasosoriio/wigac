import { BellDot, Search } from 'lucide-react';
import { Input } from '../ui';

const Header = () => {
  return (
    <header className="glass px-8 py-4">
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
            <BellDot className="w-5 h-5 text-apple-gray-700" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
