import { useState, useEffect } from 'react';
import { Plus, Clock, Timer, Pencil, Trash2, Circle, Loader2, Check, Calendar } from 'lucide-react';
import { Button, Card, CardBody } from '../../components/ui';
import { SubtaskList } from '../../components/tasks/SubtaskList';
import { ExportMenu } from '../../components/tasks/ExportMenu';
import { useAuthStore } from '../../store/authStore';
import { useTaskModalStore } from '../../store/taskModalStore';
import axios from 'axios';
import toast from 'react-hot-toast';
import { generateDailyReport, generateProgressReport, downloadReport, copyToClipboard } from '../../utils/reportGenerator';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'TRANSVERSAL';
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

  const handleExportDailyReport = async (date: Date) => {
    const report = generateDailyReport(tasks, date);
    const filename = `${format(date, 'yyyyMMdd')}_tareas.txt`;
    downloadReport(report, filename);
    toast.success('Reporte descargado');
  };

  const handleCopyDailyReport = async (date: Date) => {
    const report = generateDailyReport(tasks, date);
    const success = await copyToClipboard(report);
    if (success) {
      toast.success('Reporte copiado al portapapeles');
    } else {
      toast.error('Error al copiar al portapapeles');
    }
  };

  const handleExportProgressReport = async (date: Date) => {
    const report = generateProgressReport(tasks, date);
    const filename = `${format(date, 'yyyyMMdd')}_informe.txt`;
    downloadReport(report, filename);
    toast.success('Informe descargado');
  };

  const handleCopyProgressReport = async (date: Date) => {
    const report = generateProgressReport(tasks, date);
    const success = await copyToClipboard(report);
    if (success) {
      toast.success('Informe copiado al portapapeles');
    } else {
      toast.error('Error al copiar al portapapeles');
    }
  };

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

      // Si el nuevo estado es TRANSVERSAL, automáticamente marcamos como COMPLETED
      const finalStatus = newStatus === 'TRANSVERSAL' ? 'COMPLETED' : newStatus;

      await axios.patch(
        `${API_URL}/tasks/${taskId}/status`,
        { status: finalStatus },
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

  const formatTime = (minutes: number | null | undefined) => {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusClass = (status: string) => {
    if (status === 'COMPLETED') return 'text-gray-600 dark:text-gray-400 line-through';
    return 'text-apple-gray-900 dark:text-apple-gray-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-apple-gray-900 dark:text-apple-gray-100">Tareas</h1>
          <p className="text-apple-gray-600 dark:text-apple-gray-400 mt-2">Gestiona tus tareas diarias y su progreso</p>
        </div>
        <div className="flex gap-2">
          <ExportMenu
            onExportDailyReport={handleExportDailyReport}
            onCopyDailyReport={handleCopyDailyReport}
            onExportProgressReport={handleExportProgressReport}
            onCopyProgressReport={handleCopyProgressReport}
          />
          <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={handleCreate}>
            Nueva Tarea
          </Button>
        </div>
      </div>        {/* Filters */}
        <Card>
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-apple-gray-400 dark:text-apple-gray-500" />
                <span className="text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300">Filtrar por:</span>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                {/* Date Filter */}
                <div className="relative">
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border-2 border-apple-gray-200 dark:border-dark-border bg-white dark:bg-dark-hover text-apple-gray-900 dark:text-apple-gray-100 focus:border-apple-blue-500 dark:focus:border-apple-blue-400 focus:ring-0 transition-all text-sm font-medium min-w-[180px] hover:border-apple-gray-300 dark:hover:border-apple-gray-600"
                  />
                </div>

                {/* Status Filter - Badge Style */}
                <div className="flex items-center gap-2 bg-apple-gray-100 dark:bg-dark-hover rounded-full p-1 border border-apple-gray-200 dark:border-dark-border">
                  <button
                    onClick={() => setFilterStatus('')}
                    className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${
                      filterStatus === ''
                        ? 'bg-apple-blue-500 text-white shadow-sm'
                        : 'text-apple-gray-600 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-apple-gray-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFilterStatus('PENDING')}
                    className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 flex items-center gap-1.5 ${
                      filterStatus === 'PENDING'
                        ? 'bg-gray-500 text-white shadow-sm'
                        : 'text-apple-gray-600 dark:text-apple-gray-400 hover:text-gray-500'
                    }`}
                  >
                    <Circle className="w-3 h-3" />
                    Pendiente
                  </button>
                  <button
                    onClick={() => setFilterStatus('IN_PROGRESS')}
                    className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 flex items-center gap-1.5 ${
                      filterStatus === 'IN_PROGRESS'
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-apple-gray-600 dark:text-apple-gray-400 hover:text-orange-500'
                    }`}
                  >
                    <Loader2 className={`w-3 h-3 ${filterStatus === 'IN_PROGRESS' ? 'animate-spin' : ''}`} />
                    En proceso
                  </button>
                  <button
                    onClick={() => setFilterStatus('COMPLETED')}
                    className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 flex items-center gap-1.5 ${
                      filterStatus === 'COMPLETED'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm'
                        : 'text-apple-gray-600 dark:text-apple-gray-400 hover:text-green-500'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    Completada
                  </button>
                  <button
                    onClick={() => setFilterStatus('TRANSVERSAL')}
                    className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 flex items-center gap-1.5 ${
                      filterStatus === 'TRANSVERSAL'
                        ? 'bg-purple-500 text-white shadow-sm'
                        : 'text-apple-gray-600 dark:text-apple-gray-400 hover:text-purple-500'
                    }`}
                  >
                    <Timer className="w-3 h-3" />
                    Transversal
                  </button>
                </div>

                {/* Clear Button */}
                {(filterDate || filterStatus) && (
                  <button
                    onClick={() => {
                      setFilterDate('');
                      setFilterStatus('');
                    }}
                    className="px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all border border-red-200 dark:border-red-800"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
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

                        {/* Time spent - Show subtasks total if available */}
                        {task.subtasks && task.subtasks.length > 0 ? (
                          <>
                            <div className="inline-flex items-center px-3 py-1.5 bg-apple-blue-50 dark:bg-apple-blue-900/30 rounded-full">
                              <Timer className="w-3.5 h-3.5 text-apple-blue-600 dark:text-apple-blue-400 mr-2" />
                              <span className="text-xs font-semibold text-apple-blue-600 dark:text-apple-blue-400">
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

                        {/* Project */}
                        {task.project && (
                          <div className="inline-flex items-center px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-full">
                            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
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
                        className="p-2.5 text-apple-gray-500 dark:text-apple-gray-400 hover:text-apple-blue-600 dark:hover:text-apple-blue-400 hover:bg-apple-blue-50 dark:hover:bg-apple-blue-900/30 rounded-xl transition-all duration-200"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => handleDelete(task.id, e)}
                        className="p-2.5 text-apple-gray-500 dark:text-apple-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subtask List */}
                  <SubtaskList taskId={task.id} initialSubtasks={task.subtasks} filterDate={filterDate} onUpdate={fetchTasks} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
};

export default Tasks;
