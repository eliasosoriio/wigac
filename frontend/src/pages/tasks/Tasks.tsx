import { useState, useEffect } from 'react';
import { Plus, Clock, Timer, Pencil, Trash2, Circle, Loader2, Check } from 'lucide-react';
import { Button, Card, CardBody } from '../../components/ui';
import PageTransition from '../../components/animations/PageTransition';
import { SubtaskList } from '../../components/tasks/SubtaskList';
import { useAuthStore } from '../../store/authStore';
import { useTaskModalStore } from '../../store/taskModalStore';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  workDate: string;
  startTime: string;
  endTime: string;
  timeSpentMinutes: number;
  project?: {
    id: number;
    name: string;
  };
  subtasks?: Array<{
    id: number;
    description: string;
    workDate: string;
    startTime: string;
    endTime: string;
    timeSpentMinutes: number;
  }>;
}

const Tasks = () => {
  const { token } = useAuthStore();
  const { openModal, setRefreshCallback } = useTaskModalStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const fetchTasks = async () => {
    try {
      const authData = localStorage.getItem('auth-storage');
      const currentToken = token || (authData ? JSON.parse(authData).state?.token : null);

      if (!currentToken) {
        toast.error('No estás autenticado');
        setLoading(false);
        return;
      }

      let url = `${API_URL}/tasks`;
      const params = new URLSearchParams();
      if (filterDate) params.append('date', filterDate);
      if (filterStatus) params.append('status', filterStatus);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      setTasks(response.data);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast.error('Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    setRefreshCallback(fetchTasks);
  }, [filterDate, filterStatus]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

    try {
      const authData = localStorage.getItem('auth-storage');
      const currentToken = token || (authData ? JSON.parse(authData).state?.token : null);

      await axios.delete(`${API_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      toast.success('Tarea eliminada');
      fetchTasks();
    } catch (error) {
      toast.error('Error al eliminar tarea');
    }
  };

  const handleEdit = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    openModal(task);
  };

  const handleCreate = () => {
    openModal(null);
  };

  const handleStatusChange = async (taskId: number, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const authData = localStorage.getItem('auth-storage');
      const currentToken = token || (authData ? JSON.parse(authData).state?.token : null);

      await axios.patch(
        `${API_URL}/tasks/${taskId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      fetchTasks();
    } catch (error) {
      toast.error('Error al actualizar estado');
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

  const formatTime = (minutes: number | null | undefined) => {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusClass = (status: string) => {
    if (status === 'COMPLETED') return 'text-gray-600 line-through';
    return 'text-apple-gray-900';
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-apple-gray-900">Tareas</h1>
            <p className="text-apple-gray-600 mt-2">Gestiona tus tareas diarias y su progreso</p>
          </div>
          <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={handleCreate}>
            Nueva Tarea
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardBody>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-apple border border-apple-gray-300 focus:border-apple-blue-500 focus:ring-2 focus:ring-apple-blue-100 transition-all"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-apple border border-apple-gray-300 focus:border-apple-blue-500 focus:ring-2 focus:ring-apple-blue-100 transition-all"
                >
                  <option value="">Todos</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="IN_PROGRESS">En Proceso</option>
                  <option value="COMPLETED">Completada</option>
                </select>
              </div>
              {(filterDate || filterStatus) && (
                <div className="flex items-end">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setFilterDate('');
                      setFilterStatus('');
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-blue-500"></div>
          </div>
        ) : tasks.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <p className="text-apple-gray-600 mb-4">No tienes tareas todavía</p>
                <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={handleCreate}>
                  Crear tu primera tarea
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="group bg-white hover:bg-apple-gray-50 border border-apple-gray-200 rounded-apple transition-all duration-300 hover:border-apple-gray-300 hover:shadow-lg"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base font-medium tracking-tight mb-1.5 ${getStatusClass(task.status)}`}>
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-sm text-apple-gray-600 mb-4 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Status buttons */}
                        <div className="inline-flex items-center bg-apple-gray-100 rounded-full p-1 gap-1 border border-apple-gray-200">
                          {getStatusButton(task, 'PENDING')}
                          {getStatusButton(task, 'IN_PROGRESS')}
                          {getStatusButton(task, 'COMPLETED')}
                        </div>

                        {/* Time spent - Show subtasks total if available */}
                        {task.subtasks && task.subtasks.length > 0 ? (
                          <>
                            <div className="inline-flex items-center px-3 py-1.5 bg-apple-blue-50 rounded-full">
                              <Timer className="w-3.5 h-3.5 text-apple-blue-600 mr-2" />
                              <span className="text-xs font-semibold text-apple-blue-600">
                                {task.subtasks.length} {task.subtasks.length === 1 ? 'registro' : 'registros'} - {formatTime(
                                  task.subtasks.reduce((sum, st) => sum + st.timeSpentMinutes, 0)
                                )}
                              </span>
                            </div>
                            {/* Date range from subtasks */}
                            {(() => {
                              const dates = task.subtasks.map(st => new Date(st.workDate)).sort((a, b) => a.getTime() - b.getTime());
                              const firstDate = dates[0];
                              const lastDate = dates[dates.length - 1];
                              const isSameDate = firstDate.toDateString() === lastDate.toDateString();

                              return (
                                <div className="inline-flex items-center px-3 py-1.5 bg-apple-gray-100 rounded-full">
                                  <Clock className="w-3.5 h-3.5 text-apple-gray-500 mr-2" />
                                  <span className="text-xs font-medium text-apple-gray-700">
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
                          <div className="inline-flex items-center px-3 py-1.5 bg-apple-gray-200 rounded-full">
                            <span className="text-xs font-medium text-apple-gray-600">
                              Sin registros de tiempo
                            </span>
                          </div>
                        )}

                        {/* Project */}
                        {task.project && (
                          <div className="inline-flex items-center px-3 py-1.5 bg-purple-50 rounded-full">
                            <span className="text-xs font-medium text-purple-600">
                              {task.project.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-6">
                      <button
                        onClick={(e) => handleEdit(task, e)}
                        className="p-2.5 text-apple-gray-500 hover:text-apple-blue-600 hover:bg-apple-blue-50 rounded-xl transition-all duration-200"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => handleDelete(task.id, e)}
                        className="p-2.5 text-apple-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subtask List */}
                  <SubtaskList taskId={task.id} onUpdate={fetchTasks} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Tasks;