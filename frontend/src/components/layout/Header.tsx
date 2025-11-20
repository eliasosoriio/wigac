import { BellDot, Search, Moon, Sun, DownloadCloud } from 'lucide-react';
import { Input } from '../ui';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

const Header = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { token } = useAuthStore();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadBackup = async () => {
    if (downloading) return;

    setDownloading(true);
    toast.loading('Generando backup de la base de datos...');

    try {
      const authData = localStorage.getItem('auth-storage');
      const currentToken = token || (authData ? JSON.parse(authData).state?.token : null);

      if (!currentToken) {
        toast.error('No estás autenticado');
        setDownloading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/backup/download`, {
        headers: { Authorization: `Bearer ${currentToken}` },
        responseType: 'blob'
      });

      // Get filename from Content-Disposition header or generate default
      // Try both lowercase and camelCase versions of the header
      const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
      let filename = 'backup.sql';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/sql' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success('Backup descargado exitosamente');
    } catch (error: any) {
      console.error('Error downloading backup:', error);
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Error al descargar el backup');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <header className="px-8 py-4 bg-white dark:bg-dark-bg border-b-0">
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
            onClick={handleDownloadBackup}
            disabled={downloading}
            className="p-2 rounded-full hover:bg-apple-gray-100 dark:hover:bg-dark-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Descargar backup de la base de datos"
          >
            <DownloadCloud className={`w-5 h-5 text-apple-gray-700 dark:text-apple-gray-300 ${downloading ? 'animate-pulse' : ''}`} />
          </button>
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
