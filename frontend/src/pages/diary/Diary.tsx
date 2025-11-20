import { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { Card, CardBody, Button } from '../../components/ui';
import PageTransition from '../../components/animations/PageTransition';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

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
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSubtasks();
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
    } catch (error: any) {
      console.error('Error fetching subtasks:', error);
      toast.error('Error al cargar el diario');
    } finally {
      setLoading(false);
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
    body += '1.- ¿Que he hecho hoy, y resultado (en desarrollo o finalizado)?\n\n\n';

    Object.values(taskGroups).forEach((taskSubtasks, index) => {
      const task = taskSubtasks[0].task;
      const projectName = task.project?.name || 'SIN PROYECTO';
      const taskTitle = task.title.toUpperCase();

      body += `${index + 1}. ${projectName} - ${taskTitle}\n`;
      body += '───────────────────────────────────────────────────────────────────\n';

      // Combinar descripciones de subtareas
      const descriptions = taskSubtasks
        .filter(st => st.description)
        .map(st => st.description)
        .join(' ');

      if (descriptions) {
        body += `   Descripción: ${descriptions}\n\n`;
      }

      // Determinar resultado según el estado
      const resultado = task.status === 'COMPLETED' ? 'Finalizado' : 'En desarrollo';
      body += `   Resultado: ${resultado}\n\n\n`;
    });

    body += '2.- ¿Que voy a hacer a partir de este momento?\n';
    body += '    -\n\n';
    body += '3.- Horas diarias imputadas\n'; //Horas totales del día
    body += `    ${getTotalTimeForDate(date)}\n\n`;
    body += 'Un saludo,\n';
    body += user?.name || 'Usuario';

    // Destinatarios
    const to = 'Antonio Carro Mariño | Sdweb <antonio.carro@sdweb.es>, Brais Martinez | Sdweb <brais.martinez@sdweb.es>';

    // Asunto
    const userName = user?.name || 'Usuario';
    const subject = `Sdweb - Interno - Parte trabajo - ${userName} - ${formattedDate}`;

    // Crear el mailto link para Thunderbird
    const mailtoLink = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Abrir Thunderbird
    window.location.href = mailtoLink;
    toast.success('Abriendo cliente de correo...');
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-apple-gray-900 dark:text-white">Diario</h1>
            <p className="text-apple-gray-600 dark:text-apple-gray-400 mt-2">
              Registro cronológico de tus actividades
            </p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
          </div>
        </div>
      </PageTransition>
    );
  }

  const groupedSubtasks = groupSubtasksByDate();
  const sortedDates = Object.keys(groupedSubtasks).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-apple-gray-900 dark:text-white">Diario</h1>
          <p className="text-apple-gray-600 dark:text-apple-gray-400 mt-2">
            Registro cronológico de tus actividades
          </p>
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
                      <Calendar className="w-5 h-5 text-apple-blue dark:text-blue-400" />
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
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          generateParteEmail(date);
                        }}
                        variant="secondary"
                        className="flex items-center gap-2 px-4 py-2"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Parte</span>
                      </Button>

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
                    <CardBody className="space-y-3 p-4">
                      {daySubtasks.map(subtask => (
                        <div
                          key={subtask.id}
                          className="flex items-start gap-4 p-4 bg-white dark:bg-dark-bg rounded-lg border border-apple-gray-200 dark:border-dark-border hover:shadow-md transition-shadow"
                        >
                          <div className="flex-shrink-0 flex flex-col items-center gap-1">
                            <Clock className="w-5 h-5 text-apple-blue dark:text-blue-400" />
                            <span className="text-xs font-medium text-apple-gray-600 dark:text-apple-gray-400">
                              {subtask.startTime}
                            </span>
                            <div className="w-px h-4 bg-apple-gray-300 dark:bg-dark-border"></div>
                            <span className="text-xs font-medium text-apple-gray-600 dark:text-apple-gray-400">
                              {subtask.endTime}
                            </span>
                            <span className="text-xs text-apple-gray-500 dark:text-apple-gray-500 mt-1">
                              {calculateDuration(subtask.startTime, subtask.endTime)}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-apple-gray-900 dark:text-white">
                                  {subtask.task.title}
                                </h4>
                                {subtask.task.project && (
                                  <p className="text-sm text-apple-gray-500 dark:text-apple-gray-400 mt-1">
                                    {subtask.task.project.name}
                                  </p>
                                )}
                              </div>
                              <span className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${statusColors[subtask.task.status]}`}>
                                {statusLabels[subtask.task.status]}
                              </span>
                            </div>

                            {subtask.description && (
                              <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400 mt-2">
                                {subtask.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardBody>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Diary;
