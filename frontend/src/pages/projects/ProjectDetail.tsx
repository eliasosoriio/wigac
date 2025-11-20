import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Timer, Circle, Loader2, Check } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, Tag } from '../../components/ui';
import PageTransition from '../../components/animations/PageTransition';
import ProjectModal from '../../components/projects/ProjectModal';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  subtasks?: Array<{
    id: number;
    workDate: string;
    timeSpentMinutes: number;
  }>;
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  tasks?: Task[];
  _count?: {
    tasks: number;
  };
}

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(response.data);
    } catch (error) {
      toast.error('Error al cargar el proyecto');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este proyecto?')) return;

    try {
      await axios.delete(`${API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Proyecto eliminado');
      navigate('/projects');
    } catch (error) {
      toast.error('Error al eliminar proyecto');
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: 'Activo',
      ON_HOLD: 'En Espera',
      COMPLETED: 'Completado'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'primary',
      ON_HOLD: 'warning',
      COMPLETED: 'success'
    };
    return colors[status] || 'default';
  };

  const getTaskStatusBadge = (status: string) => {
    const configs: Record<string, {
      icon: any;
      label: string;
      className: string;
      iconClass?: string;
    }> = {
      PENDING: {
        icon: Circle,
        label: 'Pendiente',
        className: 'bg-gray-500 text-white'
      },
      IN_PROGRESS: {
        icon: Loader2,
        label: 'En proceso',
        className: 'bg-orange-500 text-white',
        iconClass: 'animate-spin'
      },
      COMPLETED: {
        icon: Check,
        label: 'Completada',
        className: 'bg-gradient-to-r from-green-500 to-green-600 text-white'
      }
    };
    return configs[status as keyof typeof configs];
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getTaskTimeInfo = (task: Task) => {
    if (!task.subtasks || task.subtasks.length === 0) {
      return null;
    }
    const totalMinutes = task.subtasks.reduce((sum, st) => sum + st.timeSpentMinutes, 0);
    return {
      count: task.subtasks.length,
      totalMinutes
    };
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-blue-500"></div>
        </div>
      </PageTransition>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              icon={<ArrowLeft className="w-5 h-5" />}
              onClick={() => navigate('/projects')}
            >
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-semibold text-apple-gray-900 dark:text-apple-gray-100">
                {project.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Tag variant={getStatusColor(project.status) as any} size="sm">
                  {getStatusLabel(project.status)}
                </Tag>
                <span className="text-sm text-apple-gray-600 dark:text-apple-gray-400">
                  {project._count?.tasks || 0} tareas
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              icon={<Edit2 className="w-5 h-5" />}
              onClick={() => setShowModal(true)}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 className="w-5 h-5" />}
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-apple-gray-900 dark:text-apple-gray-100">
              Descripción
            </h2>
          </CardHeader>
          <CardBody>
            <p className="text-apple-gray-600 dark:text-apple-gray-400">{project.description}</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-apple-gray-900 dark:text-apple-gray-100">Tareas</h2>
          </CardHeader>
          <CardBody>
            {!project.tasks || project.tasks.length === 0 ? (
              <p className="text-apple-gray-600 dark:text-apple-gray-400">
                No hay tareas en este proyecto todavía.
              </p>
            ) : (
              <div className="space-y-3">
                {project.tasks.map((task) => {
                  const statusConfig = getTaskStatusBadge(task.status);
                  const StatusIcon = statusConfig.icon;
                  const timeInfo = getTaskTimeInfo(task);

                  return (
                    <div
                      key={task.id}
                      onClick={() => navigate('/tasks')}
                      className="bg-apple-gray-50 dark:bg-dark-hover hover:bg-apple-gray-100 dark:hover:bg-dark-card border border-apple-gray-200 dark:border-dark-border rounded-xl p-4 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-apple-gray-900 dark:text-apple-gray-100 mb-2">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400 mb-3 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Status Badge */}
                            <div className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full ${statusConfig.className}`}>
                              <StatusIcon className={`w-3 h-3 mr-1.5 ${statusConfig.iconClass || ''}`} />
                              {statusConfig.label}
                            </div>

                            {/* Time Info */}
                            {timeInfo ? (
                              <>
                                <div className="inline-flex items-center px-3 py-1.5 bg-apple-blue-50 dark:bg-apple-blue-900/30 rounded-full">
                                  <Timer className="w-3.5 h-3.5 text-apple-blue-600 dark:text-apple-blue-400 mr-2" />
                                  <span className="text-xs font-semibold text-apple-blue-600 dark:text-apple-blue-400">
                                    {timeInfo.count} {timeInfo.count === 1 ? 'registro' : 'registros'} - {formatTime(timeInfo.totalMinutes)}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="inline-flex items-center px-3 py-1.5 bg-apple-gray-200 dark:bg-dark-hover rounded-full">
                                <span className="text-xs font-medium text-apple-gray-600 dark:text-apple-gray-400">
                                  Sin registros
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>

        <ProjectModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchProject();
            setShowModal(false);
          }}
          project={project}
        />
      </div>
    </PageTransition>
  );
};

export default ProjectDetail;