import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Subtask {
  id: number;
  title?: string;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  workDate: string;
  startTime: string;
  endTime: string;
  timeSpentMinutes?: number;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  project?: {
    id: number;
    name: string;
  };
  subtasks?: Subtask[];
}

const statusLabels = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completada'
};

const calculateDuration = (startTime: string, endTime: string): string => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

export const generateDailyReport = (tasks: Task[], date: Date): string => {
  const dateStr = format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const generatedAt = format(new Date(), 'dd/MM/yyyy HH:mm');

  let report = `═══════════════════════════════════════════════════════════════════\n`;
  report += `                      REPORTE DE TAREAS\n`;
  report += `═══════════════════════════════════════════════════════════════════\n\n`;
  report += `Fecha: ${dateStr}\n`;
  report += `Generado: ${generatedAt}\n`;
  report += `Expedido por: Wigac Manager\n\n`;
  report += `───────────────────────────────────────────────────────────────────\n\n`;

  let totalMinutes = 0;
  let taskNumber = 1;

  // Filtrar y ordenar subtareas por fecha y hora
  const dateString = format(date, 'yyyy-MM-dd');

  tasks.forEach(task => {
    const subtasksForDate = task.subtasks?.filter(
      subtask => subtask.workDate === dateString
    ) || [];

    subtasksForDate.forEach(subtask => {
      const projectName = task.project?.name || 'Sin proyecto';

      report += `${taskNumber}. ${projectName.toUpperCase()} - ${task.title.toUpperCase()}\n`;
      report += `───────────────────────────────────────────────────────────────────\n`;

      if (subtask.description) {
        report += `   Descripción: ${subtask.description}\n`;
      }

      report += `   Estado: ${statusLabels[subtask.status || task.status]}\n`;
      report += `   Horario: ${subtask.startTime} - ${subtask.endTime}\n`;

      const duration = calculateDuration(subtask.startTime, subtask.endTime);
      report += `   Duración: ${duration}\n\n`;

      // Calcular minutos totales
      const [startHours, startMinutes] = subtask.startTime.split(':').map(Number);
      const [endHours, endMinutes] = subtask.endTime.split(':').map(Number);
      totalMinutes += (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);

      taskNumber++;
    });
  });

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  report += `═══════════════════════════════════════════════════════════════════\n`;
  report += `TOTAL DEL DÍA: ${totalHours}h ${remainingMinutes}m\n`;
  report += `═══════════════════════════════════════════════════════════════════\n`;

  return report;
};

export const generateProgressReport = (tasks: Task[], date: Date): string => {
  const dateStr = format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const generatedAt = format(new Date(), 'dd/MM/yyyy HH:mm');

  let report = `═══════════════════════════════════════════════════════════════════\n`;
  report += `                   INFORME DE ACTUALIDAD\n`;
  report += `═══════════════════════════════════════════════════════════════════\n\n`;
  report += `Fecha: ${dateStr}\n`;
  report += `Generado: ${generatedAt}\n`;
  report += `Expedido por: Wigac Manager\n\n`;
  report += `───────────────────────────────────────────────────────────────────\n\n`;

  const dateString = format(date, 'yyyy-MM-dd');

  // Agrupar por proyecto
  const projectGroups: { [key: string]: Task[] } = {};

  tasks.forEach(task => {
    const hasSubtasksForDate = task.subtasks?.some(
      subtask => subtask.workDate === dateString
    );

    if (hasSubtasksForDate) {
      const projectName = task.project?.name || 'Sin proyecto';
      if (!projectGroups[projectName]) {
        projectGroups[projectName] = [];
      }
      projectGroups[projectName].push(task);
    }
  });

  // Estadísticas generales
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const pendingTasks = tasks.filter(t => t.status === 'PENDING').length;

  report += `RESUMEN GENERAL\n`;
  report += `───────────────────────────────────────────────────────────────────\n`;
  report += `Total de tareas: ${totalTasks}\n`;
  report += `├─ Completadas: ${completedTasks} (${Math.round(completedTasks/totalTasks*100)}%)\n`;
  report += `├─ En progreso: ${inProgressTasks} (${Math.round(inProgressTasks/totalTasks*100)}%)\n`;
  report += `└─ Pendientes: ${pendingTasks} (${Math.round(pendingTasks/totalTasks*100)}%)\n\n`;

  // Detalles por proyecto
  Object.entries(projectGroups).forEach(([projectName, projectTasks]) => {
    report += `PROYECTO: ${projectName.toUpperCase()}\n`;
    report += `═══════════════════════════════════════════════════════════════════\n\n`;

    projectTasks.forEach(task => {
      const subtasksForDate = task.subtasks?.filter(
        subtask => subtask.workDate === dateString
      ) || [];

      if (subtasksForDate.length > 0) {
        report += `▸ ${task.title}\n`;
        report += `  Estado: ${statusLabels[task.status]}\n`;

        if (task.description) {
          report += `  Descripción: ${task.description}\n`;
        }

        report += `  Registros de tiempo:\n`;

        let totalMinutes = 0;
        subtasksForDate.forEach(subtask => {
          const duration = calculateDuration(subtask.startTime, subtask.endTime);
          report += `  ├─ ${subtask.startTime} - ${subtask.endTime} (${duration})\n`;

          const [startHours, startMinutes] = subtask.startTime.split(':').map(Number);
          const [endHours, endMinutes] = subtask.endTime.split(':').map(Number);
          totalMinutes += (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
        });

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        report += `  └─ Total: ${hours}h ${minutes}m\n\n`;
      }
    });
  });

  report += `═══════════════════════════════════════════════════════════════════\n`;

  return report;
};

export const downloadReport = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const copyToClipboard = async (content: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (err) {
    console.error('Error copying to clipboard:', err);
    return false;
  }
};
