import { BellDot, Search, Moon, Sun, DownloadCloud, FolderKanban, CheckSquare, Clock, X, FileText } from 'lucide-react';
import { Input } from '../ui';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

interface SearchResult {
  id: number;
  title: string;
  type: 'project' | 'task' | 'subtask' | 'wiki';
  description?: string;
  projectId?: number;
  projectTitle?: string;
  content?: string;
}

const Header = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      await performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setSearching(true);
    try {
      const [projectsRes, tasksRes, subtasksRes, wikiRes] = await Promise.all([
        axios.get(`${API_URL}/projects`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/subtasks`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/wiki`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const queryLower = query.toLowerCase();
      const results: SearchResult[] = [];

      // Search in projects
      projectsRes.data.forEach((project: any) => {
        if (
          project.title?.toLowerCase().includes(queryLower) ||
          project.description?.toLowerCase().includes(queryLower)
        ) {
          results.push({
            id: project.id,
            title: project.title,
            type: 'project',
            description: project.description
          });
        }
      });

      // Search in tasks
      tasksRes.data.forEach((task: any) => {
        if (
          task.title?.toLowerCase().includes(queryLower) ||
          task.description?.toLowerCase().includes(queryLower)
        ) {
          const project = projectsRes.data.find((p: any) => p.id === task.projectId);
          results.push({
            id: task.id,
            title: task.title,
            type: 'task',
            description: task.description,
            projectId: task.projectId,
            projectTitle: project?.title
          });
        }
      });

      // Search in subtasks (time records)
      subtasksRes.data.forEach((subtask: any) => {
        if (
          subtask.title?.toLowerCase().includes(queryLower) ||
          subtask.description?.toLowerCase().includes(queryLower)
        ) {
          const task = tasksRes.data.find((t: any) => t.id === subtask.taskId);
          const project = projectsRes.data.find((p: any) => p.id === task?.projectId);
          results.push({
            id: subtask.id,
            title: subtask.title,
            type: 'subtask',
            description: subtask.description,
            projectId: task?.projectId,
            projectTitle: project?.title
          });
        }
      });

      // Search in wiki pages
      wikiRes.data.forEach((page: any) => {
        if (
          page.title?.toLowerCase().includes(queryLower) ||
          page.content?.toLowerCase().includes(queryLower)
        ) {
          const project = page.projectId ? projectsRes.data.find((p: any) => p.id === page.projectId) : null;
          results.push({
            id: page.id,
            title: page.title,
            type: 'wiki',
            content: page.content?.substring(0, 100),
            projectId: page.projectId,
            projectTitle: project?.title
          });
        }
      });

      setSearchResults(results.slice(0, 10)); // Limit to 10 results
      setShowResults(results.length > 0);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setSearchQuery('');

    if (result.type === 'project') {
      navigate(`/projects/${result.id}`);
    } else if (result.type === 'task') {
      if (result.projectId) {
        navigate(`/projects/${result.projectId}`);
      }
    } else if (result.type === 'subtask') {
      navigate('/diary');
    } else if (result.type === 'wiki') {
      navigate(`/wiki/${result.id}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <FolderKanban className="w-4 h-4" />;
      case 'task':
        return <CheckSquare className="w-4 h-4" />;
      case 'subtask':
        return <Clock className="w-4 h-4" />;
      case 'wiki':
        return <FileText className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getResultLabel = (type: string) => {
    switch (type) {
      case 'project':
        return 'Proyecto';
      case 'task':
        return 'Tarea';
      case 'subtask':
        return 'Registro';
      case 'wiki':
        return 'Wiki';
      default:
        return '';
    }
  };

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
        <div className="flex-1 max-w-xl relative" ref={searchRef}>
          <div className="relative">
            <Input
              type="search"
              placeholder="Buscar proyectos, tareas, documentos..."
              icon={<Search className="w-5 h-5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-apple-gray-200 dark:hover:bg-dark-hover rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-apple-gray-500 dark:text-apple-gray-400" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-card border border-apple-gray-200 dark:border-dark-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50 scrollbar-thin scrollbar-thumb-apple-gray-300 dark:scrollbar-thumb-dark-border scrollbar-track-transparent">
              {searching ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-apple-blue-500 mx-auto"></div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-apple-gray-500 dark:text-apple-gray-400">
                  No se encontraron resultados
                </div>
              ) : (
                <div className="py-2">
                  {searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-4 py-3 flex items-start gap-3 hover:bg-apple-gray-50 dark:hover:bg-dark-hover transition-colors text-left"
                    >
                      <div className="mt-0.5 text-apple-gray-500 dark:text-apple-gray-400">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-apple-gray-900 dark:text-apple-gray-100 truncate">
                            {result.title}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-apple-gray-100 dark:bg-dark-hover text-apple-gray-600 dark:text-apple-gray-400 flex-shrink-0">
                            {getResultLabel(result.type)}
                          </span>
                        </div>
                        {result.description && (
                          <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400 truncate mt-1">
                            {result.description}
                          </p>
                        )}
                        {result.content && !result.description && (
                          <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400 truncate mt-1">
                            {result.content}...
                          </p>
                        )}
                        {result.projectTitle && (
                          <p className="text-xs text-apple-gray-400 dark:text-apple-gray-500 truncate mt-1">
                            en {result.projectTitle}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
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
