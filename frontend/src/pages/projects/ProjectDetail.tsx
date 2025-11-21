import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Timer, Circle, Loader2, Check, Clock, Pencil, ChevronDown, ChevronUp, FileText, Plus } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, Tag } from '../../components/ui';
import PageTransition from '../../components/animations/PageTransition';
import ProjectModal from '../../components/projects/ProjectModal';
import { useAuthStore } from '../../store/authStore';
import { useTaskModalStore } from '../../store/taskModalStore';
import { useSubtaskModalStore } from '../../store/subtaskModalStore';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'TRANSVERSAL';
  subtasks?: Array<{
    id: number;
    description?: string;
    workDate: string;
    startTime: string;
    endTime: string;
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
  const { openModal: openTaskModal, setRefreshCallback: setTaskRefreshCallback } = useTaskModalStore();
  const { openModal: openSubtaskModal, setRefreshCallback: setSubtaskRefreshCallback } = useSubtaskModalStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());

  const toggleTask = (taskId: number) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

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

  useEffect(() => {
    setTaskRefreshCallback(fetchProject);
    setSubtaskRefreshCallback(fetchProject);
  }, []);

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

  const handleStatusChange = async (taskId: number, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await axios.patch(
        `${API_URL}/tasks/${taskId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProject();
      toast.success('Estado actualizado');
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleEditTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    // Convertir Task a formato esperado por el modal
    const taskForModal = {
      ...task,
      workDate: new Date().toISOString().split('T')[0],
      startTime: '09:00:00',
      endTime: '17:00:00',
      timeSpentMinutes: 0,
      project: task.subtasks && task.subtasks.length > 0 ? undefined : undefined
    };
    openTaskModal(taskForModal as any);
  };

  const handleDeleteTask = async (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Tarea eliminada');
      fetchProject();
    } catch (error) {
      toast.error('Error al eliminar tarea');
    }
  };

  const getStatusButton = (task: Task, status: string) => {
    const isActive = task.status === status;
    const configs = {
      PENDING: {
        icon: Circle,
        label: 'Pendiente',
        activeClass: 'bg-gray-500 text-white',
        hoverClass: 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
      },
      IN_PROGRESS: {
        icon: Loader2,
        label: 'En proceso',
        activeClass: 'bg-orange-500 text-white',
        hoverClass: 'text-gray-500 hover:text-orange-400 hover:bg-orange-500/10',
        iconClass: 'animate-spin'
      },
      COMPLETED: {
        icon: Check,
        label: 'Completada',
        activeClass: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm',
        hoverClass: 'text-gray-500 hover:text-green-400 hover:bg-green-500/10'
      },
      TRANSVERSAL: {
        icon: Timer,
        label: 'Transversal',
        activeClass: 'bg-purple-500 text-white',
        hoverClass: 'text-gray-500 hover:text-purple-400 hover:bg-purple-500/10'
      }
    };

    const config = configs[status as keyof typeof configs];
    const Icon = config.icon;
    const iconClass = (config as any).iconClass || '';

    return (
      <button
        onClick={(e) => handleStatusChange(task.id, status, e)}
        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300 flex items-center gap-1.5 ${
          isActive ? config.activeClass : config.hoverClass
        }`}
        title={config.label}
      >
        <Icon className={`w-3 h-3 ${isActive && iconClass ? iconClass : ''}`} />
        <span className={isActive ? '' : 'hidden sm:inline'}>{config.label}</span>
      </button>
    );
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusClass = (status: string) => {
    if (status === 'COMPLETED') return 'text-gray-600 dark:text-gray-400 line-through';
    return 'text-apple-gray-900 dark:text-apple-gray-100';
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours}h ${minutes}m`;
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
              onClick={() => navigate('/tasks')}
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
              variant="primary"
              icon={<Plus className="w-5 h-5" />}
              onClick={() => openTaskModal({
                title: '',
                description: '',
                status: 'PENDING',
                workDate: new Date().toISOString().split('T')[0],
                startTime: '09:00',
                endTime: '17:00',
                projectId: project.id
              } as any)}
            >
              Nueva Tarea
            </Button>
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
              <div className="space-y-4">
                {project.tasks.map((task) => {
                  const timeInfo = getTaskTimeInfo(task);
                  const isExpanded = expandedTasks.has(task.id);

                  return (
                    <div
                      key={task.id}
                      className="group bg-white dark:bg-dark-card hover:bg-apple-gray-50 dark:hover:bg-dark-hover border border-apple-gray-200 dark:border-dark-border rounded-apple transition-all duration-300 hover:border-apple-gray-300 dark:hover:border-apple-gray-600 hover:shadow-lg"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-base font-medium tracking-tight mb-1.5 ${getStatusClass(task.status)}`}>
                              {task.title}
                            </h3>

                            {task.description && (
                              <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400 mb-4 leading-relaxed">
                                {task.description}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-2.5">
                              {/* Status buttons */}
                              <div className="inline-flex items-center bg-apple-gray-100 dark:bg-dark-hover rounded-full p-1 gap-1 border border-apple-gray-200 dark:border-dark-border">
                                {getStatusButton(task, 'PENDING')}
                                {getStatusButton(task, 'IN_PROGRESS')}
                                {getStatusButton(task, 'COMPLETED')}
                                {getStatusButton(task, 'TRANSVERSAL')}
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
                                  {/* Date range from subtasks */}
                                  {(() => {
                                    const dates = task.subtasks!.map(st => new Date(st.workDate)).sort((a, b) => a.getTime() - b.getTime());
                                    const firstDate = dates[0];
                                    const lastDate = dates[dates.length - 1];
                                    const isSameDate = firstDate.toDateString() === lastDate.toDateString();

                                    return (
                                      <div className="inline-flex items-center px-3 py-1.5 bg-apple-gray-100 dark:bg-dark-hover rounded-full">
                                        <Clock className="w-3.5 h-3.5 text-apple-gray-500 dark:text-apple-gray-400 mr-2" />
                                        <span className="text-xs font-medium text-apple-gray-700 dark:text-apple-gray-300">
                                          {isSameDate
                                            ? firstDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
                                            : `${firstDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - ${lastDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`
                                          }
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </>
                              ) : (
                                <div className="inline-flex items-center px-3 py-1.5 bg-apple-gray-200 dark:bg-dark-hover rounded-full">
                                  <span className="text-xs font-medium text-apple-gray-600 dark:text-apple-gray-400">
                                    Sin registros de tiempo
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-6">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openSubtaskModal(task.id);
                              }}
                              className="p-2.5 text-apple-gray-500 dark:text-apple-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-xl transition-all duration-200"
                              title="Añadir Registro"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleEditTask(task, e)}
                              className="p-2.5 text-apple-gray-500 dark:text-apple-gray-400 hover:text-apple-blue-600 dark:hover:text-apple-blue-400 hover:bg-apple-blue-50 dark:hover:bg-apple-blue-900/30 rounded-xl transition-all duration-200"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteTask(task.id, e)}
                              className="p-2.5 text-apple-gray-500 dark:text-apple-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Subtasks Section */}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="mt-4 border-t border-apple-gray-200 dark:border-dark-border pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <button
                                onClick={() => toggleTask(task.id)}
                                className="flex items-center gap-2 text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 hover:text-apple-blue-600 dark:hover:text-apple-blue-400 transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                                <span>Registros de tiempo ({task.subtasks.length})</span>
                                <span className="text-apple-blue-600 dark:text-apple-blue-400">
                                  - {formatTime(task.subtasks.reduce((sum, st) => sum + st.timeSpentMinutes, 0))}
                                </span>
                              </button>
                            </div>

                            {isExpanded && (
                              <div className="space-y-2">
                                {task.subtasks
                                  .sort((a, b) => {
                                    const dateCompare = new Date(b.workDate).getTime() - new Date(a.workDate).getTime();
                                    if (dateCompare !== 0) return dateCompare;
                                    const timeA = a.startTime.split(':').map(Number);
                                    const timeB = b.startTime.split(':').map(Number);
                                    return (timeB[0] * 60 + timeB[1]) - (timeA[0] * 60 + timeA[1]);
                                  })
                                  .map((subtask) => (
                                    <div
                                      key={subtask.id}
                                      className="bg-apple-gray-50 dark:bg-dark-hover rounded-lg p-3 hover:bg-apple-gray-100 dark:hover:bg-dark-card transition-colors group"
                                    >
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                          {subtask.description && (
                                            <p className="text-sm text-apple-gray-800 dark:text-apple-gray-200 mb-2 leading-relaxed">
                                              <FileText className="w-3.5 h-3.5 inline mr-1.5 text-apple-gray-400 dark:text-apple-gray-500" />
                                              {subtask.description}
                                            </p>
                                          )}
                                          <div className="flex flex-wrap items-center gap-2 text-xs">
                                            <span className="inline-flex items-center text-apple-gray-600 dark:text-apple-gray-400">
                                              <Clock className="w-3 h-3 mr-1" />
                                              {new Date(subtask.workDate).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                              })}
                                            </span>
                                            <span className="inline-flex items-center text-apple-gray-600 dark:text-apple-gray-400">
                                              <Timer className="w-3 h-3 mr-1" />
                                              {subtask.startTime} - {subtask.endTime}
                                            </span>
                                            <span className="inline-flex items-center font-semibold text-apple-blue-600 dark:text-apple-blue-400">
                                              {calculateDuration(subtask.startTime, subtask.endTime)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        )}
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