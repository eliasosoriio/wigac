import { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, Mail, Plus, Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Card, CardBody } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';
import { SubtaskModal } from '../../components/diary/SubtaskModal';
import { ExportMenu } from '../../components/tasks/ExportMenu';
import PageTransition from '../../components/animations/PageTransition';
import { useAuthStore } from '../../store/authStore';
import { useSubtaskModalStore } from '../../store/subtaskModalStore';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { generateDailyReport, generateProgressReport, downloadReport, copyToClipboard } from '../../utils/reportGenerator';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

interface Subtask {
  id: number;
  description?: string;
  workDate: string;
  startTime: string;
  endTime: string;
  task: {
    id: number;
    title: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'TRANSVERSAL';
    project?: {
      id: number;
      name: string;
    };
  };
}

interface GroupedSubtasks {
  [date: string]: Subtask[];
}

const Diary = () => {
  const { token, user } = useAuthStore();
  const { openModal, setRefreshCallback } = useSubtaskModalStore();
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [emailData, setEmailData] = useState({ to: '', subject: '', body: '' });
  const [regacLogs, setRegacLogs] = useState<{ [date: string]: boolean }>({});

  useEffect(() => {
    fetchSubtasks();
    // Registrar el callback de refresh para que se actualice cuando se edite desde el modal global
    setRefreshCallback(fetchSubtasks);
  }, []);

  const fetchSubtasks = async () => {
    try {
      const authData = localStorage.getItem('auth-storage');
      const currentToken = token || (authData ? JSON.parse(authData).state?.token : null);

      if (!currentToken) {
        toast.error('No estás autenticado');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/subtasks`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });

      setSubtasks(response.data);

      // Expandir automáticamente los últimos 3 días
      const uniqueDates = [...new Set(response.data.map((st: Subtask) => st.workDate))] as string[];
      const recentDates = uniqueDates.slice(0, 3);
      setExpandedDates(new Set(recentDates));

      // Cargar estados de regac para todas las fechas
      if (uniqueDates.length > 0) {
        fetchRegacLogs(uniqueDates, currentToken);
      }
    } catch (error: any) {
      console.error('Error fetching subtasks:', error);
      toast.error('Error al cargar el diario');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegacLogs = async (dates: string[], currentToken: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/regac/batch`,
        { dates },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      setRegacLogs(response.data);
    } catch (error) {
      console.error('Error fetching regac logs:', error);
    }
  };

  const toggleRegacLog = async (date: string) => {
    const currentStatus = regacLogs[date] || false;
    const newStatus = !currentStatus;

    // Optimistic update
    setRegacLogs(prev => ({ ...prev, [date]: newStatus }));

    try {
      const authData = localStorage.getItem('auth-storage');
      const currentToken = token || (authData ? JSON.parse(authData).state?.token : null);

      await axios.put(
        `${API_URL}/regac/${date}`,
        { registered: newStatus },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );

      toast.success(newStatus ? 'Marcado como registrado en Regac' : 'Desmarcado de Regac');
    } catch (error) {
      console.error('Error updating regac log:', error);
      toast.error('Error al actualizar el estado de Regac');
      // Revert on error
      setRegacLogs(prev => ({ ...prev, [date]: currentStatus }));
    }
  };

  const groupSubtasksByDate = (): GroupedSubtasks => {
    const grouped: GroupedSubtasks = {};

    subtasks.forEach(subtask => {
      if (!grouped[subtask.workDate]) {
        grouped[subtask.workDate] = [];
      }
      grouped[subtask.workDate].push(subtask);
    });

    // Ordenar subtareas dentro de cada día por hora de inicio
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        const timeA = a.startTime.split(':').map(Number);
        const timeB = b.startTime.split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
      });
    });

    return grouped;
  };

  const toggleDate = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const handleEditSubtask = (subtask: Subtask, e: React.MouseEvent) => {
    e.stopPropagation();
    // Calcular timeSpentMinutes
    const [startHours, startMinutes] = subtask.startTime.split(':').map(Number);
    const [endHours, endMinutes] = subtask.endTime.split(':').map(Number);
    const timeSpentMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);

    openModal(subtask.task.id, {
      id: subtask.id,
      description: subtask.description || '',
      workDate: subtask.workDate,
      startTime: subtask.startTime,
      endTime: subtask.endTime,
      taskId: subtask.task.id,
      timeSpentMinutes
    });
  };

  const handleDeleteSubtask = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar este registro?')) return;

    try {
      const authData = localStorage.getItem('auth-storage');
      const currentToken = token || (authData ? JSON.parse(authData).state?.token : null);

      await axios.delete(`${API_URL}/subtasks/${id}`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      toast.success('Registro eliminado');
      fetchSubtasks();
    } catch (error) {
      toast.error('Error al eliminar registro');
    }
  };

  const calculateDuration = (startTime: string, endTime: string): string => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const getTotalTimeForDate = (date: string): string => {
    const daySubtasks = groupedSubtasks[date] || [];
    const totalMinutes = daySubtasks.reduce((acc, subtask) => {
      const [startHours, startMinutes] = subtask.startTime.split(':').map(Number);
      const [endHours, endMinutes] = subtask.endTime.split(':').map(Number);
      return acc + ((endHours * 60 + endMinutes) - (startHours * 60 + startMinutes));
    }, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    TRANSVERSAL: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
  };

  const statusLabels = {
    PENDING: 'Pendiente',
    IN_PROGRESS: 'En Proceso',
    COMPLETED: 'Completada',
    TRANSVERSAL: 'Transversal'
  };

  const generateParteEmail = (date: string) => {
    const daySubtasks = groupedSubtasks[date];
    const parsedDate = parseISO(date);
    const formattedDate = format(parsedDate, 'dd/MM/yyyy');

    // Agrupar subtareas por tarea
    const taskGroups: { [key: number]: Subtask[] } = {};
    daySubtasks.forEach(subtask => {
      if (!taskGroups[subtask.task.id]) {
        taskGroups[subtask.task.id] = [];
      }
      taskGroups[subtask.task.id].push(subtask);
    });

    // Generar el cuerpo del correo
    let body = 'Hola,\n\n';
    body += '1.- ¿Qué he hecho hoy, y resultado (en desarrollo o finalizado)?\n\n';

    Object.values(taskGroups).forEach((taskSubtasks) => {
      const task = taskSubtasks[0].task;
      const projectName = (task.project?.name || 'SIN PROYECTO').toUpperCase();
      const taskTitle = task.title.toUpperCase();

      body += `    - ${projectName} - ${taskTitle}\n`;

      // Combinar descripciones de subtareas
      const descriptions = taskSubtasks
        .filter(st => st.description)
        .map(st => st.description)
        .join(' ');

      if (descriptions) {
        body += `    ${descriptions}\n`;
      }

      // Determinar resultado según el estado
      const resultado = task.status === 'COMPLETED' ? 'Finalizado' : 'En desarrollo';
      body += `      Resultado: ${resultado}\n\n`;
    });

    body += '2.- ¿Qué voy a hacer a partir de este momento?\n\n';
    body += '    - \n\n';
    body += '3.- Horas diarias imputadas\n';
    body += `    ${getTotalTimeForDate(date)}\n\n`;
    body += 'Un saludo,\n';

    // Formatear nombre con capitalización
    const fullName = user?.name || 'Usuario';
    const nameParts = fullName.split(' ');
    const formattedName = nameParts.map(part =>
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    ).join(' ');
    body += `${formattedName}.`;

    // Destinatarios
    const to = 'Antonio Carro Mariño | Sdweb <antonio.carro@sdweb.es>, Brais Martinez | Sdweb <brais.martinez@sdweb.es>';

    // Asunto
    const userName = user?.name || 'Usuario';
    const subject = `Sdweb - Interno - Parte trabajo - ${userName} - ${formattedDate}`;

    // Guardar datos del correo y mostrar modal
    setEmailData({ to, subject, body });
    setShowEmailPreview(true);
  };

  const handleSendEmail = () => {
    const mailtoLink = `mailto:${encodeURIComponent(emailData.to)}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
    window.location.href = mailtoLink;
    setShowEmailPreview(false);
    toast.success('Abriendo cliente de correo...');
  };

  const handleExportDailyReport = async (date: Date) => {
    // Agrupar subtasks por tarea
    const taskMap = new Map();
    subtasks.forEach(st => {
      if (!taskMap.has(st.task.id)) {
        taskMap.set(st.task.id, {
          id: st.task.id,
          title: st.task.title,
          status: st.task.status,
          project: st.task.project,
          subtasks: []
        });
      }
      taskMap.get(st.task.id).subtasks.push({
        id: st.id,
        description: st.description,
        workDate: st.workDate,
        startTime: st.startTime,
        endTime: st.endTime,
        status: st.task.status
      });
    });

    const tasksForReport = Array.from(taskMap.values());
    const report = generateDailyReport(tasksForReport, date);
    const filename = `${format(date, 'yyyyMMdd')}_tareas.txt`;
    downloadReport(report, filename);
    toast.success('Reporte descargado');
  };

  const handleCopyDailyReport = async (date: Date) => {
    const taskMap = new Map();
    subtasks.forEach(st => {
      if (!taskMap.has(st.task.id)) {
        taskMap.set(st.task.id, {
          id: st.task.id,
          title: st.task.title,
          status: st.task.status,
          project: st.task.project,
          subtasks: []
        });
      }
      taskMap.get(st.task.id).subtasks.push({
        id: st.id,
        description: st.description,
        workDate: st.workDate,
        startTime: st.startTime,
        endTime: st.endTime,
        status: st.task.status
      });
    });

    const tasksForReport = Array.from(taskMap.values());
    const report = generateDailyReport(tasksForReport, date);
    const success = await copyToClipboard(report);
    if (success) {
      toast.success('Reporte copiado al portapapeles');
    } else {
      toast.error('Error al copiar al portapapeles');
    }
  };

  const handleExportProgressReport = async (date: Date) => {
    const taskMap = new Map();
    subtasks.forEach(st => {
      if (!taskMap.has(st.task.id)) {
        taskMap.set(st.task.id, {
          id: st.task.id,
          title: st.task.title,
          status: st.task.status,
          project: st.task.project,
          subtasks: []
        });
      }
      taskMap.get(st.task.id).subtasks.push({
        id: st.id,
        description: st.description,
        workDate: st.workDate,
        startTime: st.startTime,
        endTime: st.endTime,
        status: st.task.status
      });
    });

    const tasksForReport = Array.from(taskMap.values());
    const report = generateProgressReport(tasksForReport, date);
    const filename = `${format(date, 'yyyyMMdd')}_informe.txt`;
    downloadReport(report, filename);
    toast.success('Informe descargado');
  };

  const handleCopyProgressReport = async (date: Date) => {
    const taskMap = new Map();
    subtasks.forEach(st => {
      if (!taskMap.has(st.task.id)) {
        taskMap.set(st.task.id, {
          id: st.task.id,
          title: st.task.title,
          status: st.task.status,
          project: st.task.project,
          subtasks: []
        });
      }
      taskMap.get(st.task.id).subtasks.push({
        id: st.id,
        description: st.description,
        workDate: st.workDate,
        startTime: st.startTime,
        endTime: st.endTime,
        status: st.task.status
      });
    });

    const tasksForReport = Array.from(taskMap.values());
    const report = generateProgressReport(tasksForReport, date);
    const success = await copyToClipboard(report);
    if (success) {
      toast.success('Informe copiado al portapapeles');
    } else {
      toast.error('Error al copiar al portapapeles');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-apple-gray-900 dark:text-white">Registros</h1>
          <p className="text-apple-gray-600 dark:text-apple-gray-400 mt-2">
            Registro cronológico de tus actividades
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
        </div>
      </div>
    );
  }

  const groupedSubtasks = groupSubtasksByDate();
  const sortedDates = Object.keys(groupedSubtasks).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <>
      <PageTransition>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-apple-gray-900 dark:text-white">Registros</h1>
          <p className="text-apple-gray-600 dark:text-apple-gray-400 mt-2">
            Registro cronológico de tus actividades
          </p>
        </div>
        <div className="flex gap-2">
          <ExportMenu
            onExportDailyReport={handleExportDailyReport}
            onCopyDailyReport={handleCopyDailyReport}
            onExportProgressReport={handleExportProgressReport}
            onCopyProgressReport={handleCopyProgressReport}
          />
          <button
            onClick={() => {
              setSelectedDate(new Date().toISOString().split('T')[0]);
              setIsModalOpen(true);
            }}
            className="p-3 rounded-apple bg-apple-orange-500 hover:bg-apple-orange-600 text-white transition-all shadow-apple"
            title="Nuevo Registro"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {sortedDates.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-apple-gray-400 dark:text-apple-gray-500 mb-4" />
                <p className="text-apple-gray-600 dark:text-apple-gray-400">
                  No hay registros en el diario
                </p>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedDates.map(date => {
              const isExpanded = expandedDates.has(date);
              const daySubtasks = groupedSubtasks[date];
              const parsedDate = parseISO(date);
              const dateLabel = format(parsedDate, "EEEE - d 'de' MMMM 'de' yyyy", { locale: es });

              return (
                <Card key={date} className="overflow-hidden">
                  <div className="w-full px-6 py-4 flex items-center justify-between bg-apple-gray-50 dark:bg-dark-hover">
                    <button
                      onClick={() => toggleDate(date)}
                      className="flex items-center gap-4 flex-1 hover:opacity-80 transition-opacity"
                    >
                      <Calendar className="w-5 h-5 text-apple-orange-500 dark:text-apple-orange-400" />
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-apple-gray-900 dark:text-white capitalize">
                          {dateLabel}
                        </h3>
                        <p className="text-sm text-apple-gray-500 dark:text-apple-gray-400">
                          {daySubtasks.length} registro{daySubtasks.length !== 1 ? 's' : ''} · {getTotalTimeForDate(date)}
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRegacLog(date);
                        }}
                        className={`p-2.5 rounded-apple transition-all ${
                          regacLogs[date]
                            ? 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400'
                            : 'bg-apple-gray-100 hover:bg-apple-gray-200 dark:bg-dark-hover dark:hover:bg-dark-card text-apple-gray-700 dark:text-apple-gray-300'
                        }`}
                        title={regacLogs[date] ? "Registrado en Regac" : "No registrado en Regac"}
                      >
                        {regacLogs[date] ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(date);
                          setIsModalOpen(true);
                        }}
                        className="p-2.5 rounded-apple bg-apple-orange-500 hover:bg-apple-orange-600 text-white transition-all"
                        title="Añadir registro"
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          generateParteEmail(date);
                        }}
                        className="p-2.5 rounded-apple bg-apple-gray-100 hover:bg-apple-gray-200 dark:bg-dark-hover dark:hover:bg-dark-card text-apple-gray-700 dark:text-apple-gray-300 transition-all"
                        title="Generar parte"
                      >
                        <Mail className="w-4 h-4" />
                      </button>

                      <button onClick={() => toggleDate(date)}>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-apple-gray-400 dark:text-apple-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-apple-gray-400 dark:text-apple-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <CardBody className="p-0">
                      <div className="divide-y divide-apple-gray-100 dark:divide-dark-border">
                        {daySubtasks.map(subtask => (
                          <div
                            key={subtask.id}
                            className="group relative flex hover:bg-apple-gray-50 dark:hover:bg-dark-hover transition-colors duration-150"
                          >
                            {/* Sección de tiempo - lado izquierdo */}
                            <div className="flex-shrink-0 w-32 px-6 py-4 border-r border-apple-gray-100 dark:border-dark-border bg-white dark:bg-dark-card">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-apple-gray-900 dark:text-white tabular-nums">
                                    {subtask.startTime.substring(0, 5)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-apple-gray-500 dark:text-apple-gray-400 tabular-nums">
                                    {subtask.endTime.substring(0, 5)}
                                  </span>
                                </div>
                                <div className="mt-1 pt-1 border-t border-apple-gray-200 dark:border-dark-border">
                                  <span className="text-xs font-bold text-apple-gray-600 dark:text-apple-gray-400 tabular-nums">
                                    {calculateDuration(subtask.startTime, subtask.endTime)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Contenido - lado derecho */}
                            <div className="flex-1 px-6 py-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-base font-medium text-apple-gray-900 dark:text-white mb-1">
                                    {subtask.task.title}
                                  </h4>

                                  {subtask.task.project && (
                                    <p className="text-sm text-apple-gray-500 dark:text-apple-gray-400 mb-2">
                                      {subtask.task.project.name}
                                    </p>
                                  )}

                                  {subtask.description && (
                                    <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400 leading-relaxed mt-2">
                                      {subtask.description}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[subtask.task.status]}`}>
                                    {statusLabels[subtask.task.status]}
                                  </span>

                                  <button
                                    onClick={(e) => handleEditSubtask(subtask, e)}
                                    className="p-1.5 hover:bg-apple-blue-100 dark:hover:bg-apple-blue-900/30 text-apple-blue-600 dark:text-apple-blue-400 rounded transition-colors"
                                    title="Editar registro"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={(e) => handleDeleteSubtask(subtask.id, e)}
                                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"
                                    title="Eliminar registro"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  )}
                </Card>
              );
            })}
          </div>
        )}
        </div>
      </PageTransition>

      {/* Modal para crear subtarea */}
      <SubtaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSubtasks}
        selectedDate={selectedDate}
        token={token || ''}
      />

      {/* Modal de Preview del Correo */}
      <Modal
        isOpen={showEmailPreview}
        onClose={() => setShowEmailPreview(false)}
        title="Preview del Correo"
        size="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
              Para:
            </label>
            <div className="px-4 py-3 bg-apple-gray-50 dark:bg-dark-hover rounded-lg text-sm text-apple-gray-900 dark:text-apple-gray-100">
              {emailData.to}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
              Asunto:
            </label>
            <div className="px-4 py-3 bg-apple-gray-50 dark:bg-dark-hover rounded-lg text-sm text-apple-gray-900 dark:text-apple-gray-100 font-medium">
              {emailData.subject}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
              Mensaje:
            </label>
            <div className="px-4 py-3 bg-apple-gray-50 dark:bg-dark-hover rounded-lg text-sm text-apple-gray-900 dark:text-apple-gray-100 whitespace-pre-wrap font-mono max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-apple-gray-300 dark:scrollbar-thumb-dark-border scrollbar-track-transparent">
              {emailData.body}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowEmailPreview(false)}
              className="flex-1 px-4 py-3 rounded-apple bg-apple-gray-200 hover:bg-apple-gray-300 dark:bg-dark-hover dark:hover:bg-dark-card text-apple-gray-700 dark:text-apple-gray-300 font-medium transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSendEmail}
              className="flex-1 px-4 py-3 rounded-apple bg-apple-orange-500 hover:bg-apple-orange-600 text-white font-medium transition-all shadow-apple inline-flex items-center justify-center"
            >
              <Mail className="w-4 h-4 mr-2" />
              Enviar Correo
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Diary;
