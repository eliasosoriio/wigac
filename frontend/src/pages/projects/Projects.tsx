import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button, Card, CardBody, Tag } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { useProjectModalStore } from '../../store/projectModalStore';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  _count?: {
    tasks: number;
  };
}

const Projects = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { openModal, setRefreshCallback } = useProjectModalStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      // Obtener token desde localStorage directamente si no está disponible en el store
      const authData = localStorage.getItem('auth-storage');
      const currentToken = token || (authData ? JSON.parse(authData).state?.token : null);

      if (!currentToken) {
        console.error('No token available');
        toast.error('No estás autenticado. Por favor, inicia sesión.');
        setLoading(false);
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      setProjects(response.data);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      if (error.response?.status === 401) {
        toast.error('Sesión expirada. Por favor, inicia sesión de nuevo.');
        navigate('/login');
      } else {
        const message = error.response?.data?.message || error.message || 'Error al cargar proyectos';
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    setRefreshCallback(fetchProjects);
  }, []);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('¿Estás seguro de eliminar este proyecto?')) return;

    try {
      const authData = localStorage.getItem('auth-storage');
      const currentToken = token || (authData ? JSON.parse(authData).state?.token : null);

      await axios.delete(`${API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      toast.success('Proyecto eliminado');
      fetchProjects();
    } catch (error) {
      toast.error('Error al eliminar proyecto');
    }
  };

  const handleEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    openModal(project);
  };

  const handleCreate = () => {
    openModal(null);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'primary',
      ON_HOLD: 'warning',
      COMPLETED: 'success'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: 'Activo',
      ON_HOLD: 'En Espera',
      COMPLETED: 'Completado'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-apple-gray-900 dark:text-apple-gray-100">
            Proyectos
          </h1>
          <p className="text-apple-gray-600 dark:text-apple-gray-400 mt-2">
            Gestiona tus proyectos y su progreso
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={handleCreate}>
          Nuevo Proyecto
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-blue-500"></div>
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <p className="text-apple-gray-600 dark:text-apple-gray-400 mb-4">No tienes proyectos todavía</p>
              <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={handleCreate}>
                Crear tu primer proyecto
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              hover
              className="cursor-pointer group"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardBody className="space-y-4">
                <div className="flex items-start justify-between">
                  <Tag variant={getStatusColor(project.status) as any} size="sm">
                    {getStatusLabel(project.status)}
                  </Tag>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEdit(project, e)}
                      className="p-1.5 rounded-lg hover:bg-apple-blue-100 dark:hover:bg-apple-blue-900/30 text-apple-blue-600 dark:text-apple-blue-400 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(project.id, e)}
                      className="p-1.5 rounded-lg hover:bg-apple-red-100 dark:hover:bg-red-900/30 text-apple-red-600 dark:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-apple-gray-900 dark:text-apple-gray-100">
                    {project.name}
                  </h3>
                  <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400 mt-1 line-clamp-2">
                    {project.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-apple-gray-200 dark:border-dark-border">
                  <span className="text-sm text-apple-gray-600 dark:text-apple-gray-400">
                    {project._count?.tasks || 0} tareas
                  </span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;