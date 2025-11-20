import { BellDot, Search, Moon, Sun } from 'lucide-react';
import { Input } from '../ui';
import { useThemeStore } from '../../store/themeStore';

const Header = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <header className="glass px-8 py-4 dark:bg-dark-card dark:border-dark-border">
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
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-apple-gray-100 dark:hover:bg-dark-hover transition-colors"
            title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-apple-gray-700" />
            )}
          </button>
          <button className="p-2 rounded-full hover:bg-apple-gray-100 dark:hover:bg-dark-hover transition-colors relative">
            <BellDot className="w-5 h-5 text-apple-gray-700 dark:text-apple-gray-300" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
