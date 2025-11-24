import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '../../components/ui';
import PageTransition from '../../components/animations/PageTransition';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axios from 'axios';
import { Clock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'TRANSVERSAL';
  project?: {
    id: number;
    name: string;
  };
  subtasks?: Array<{
    id: number;
    workDate: string;
    startTime: string;
    endTime: string;
  }>;
}

interface KanbanCardProps {
  task: Task;
}

const KanbanCard = ({ task }: KanbanCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id.toString()
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const getTotalTime = () => {
    if (!task.subtasks?.length) return '0h 0m';

    const totalMinutes = task.subtasks.reduce((acc, subtask) => {
      const [startHours, startMinutes] = subtask.startTime.split(':').map(Number);
      const [endHours, endMinutes] = subtask.endTime.split(':').map(Number);
      const start = startHours * 60 + startMinutes;
      const end = endHours * 60 + endMinutes;
      return acc + (end - start);
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-dark-card border border-apple-gray-200 dark:border-dark-border rounded-xl p-4 cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow touch-none"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-apple-gray-900 dark:text-white line-clamp-2">
            {task.title}
          </h4>
          <span className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${statusColors[task.status]}`}>
            {statusLabels[task.status]}
          </span>
        </div>

        {task.description && (
          <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-apple-gray-500 dark:text-apple-gray-400 pt-2 border-t border-apple-gray-100 dark:border-dark-border">
          {task.project && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{task.project.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{getTotalTime()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para el overlay cuando se arrastra
const DragOverlayCard = ({ task }: { task: Task }) => {
  const getTotalTime = () => {
    if (!task.subtasks?.length) return '0h 0m';

    const totalMinutes = task.subtasks.reduce((acc, subtask) => {
      const [startHours, startMinutes] = subtask.startTime.split(':').map(Number);
      const [endHours, endMinutes] = subtask.endTime.split(':').map(Number);
      const start = startHours * 60 + startMinutes;
      const end = endHours * 60 + endMinutes;
      return acc + (end - start);
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

  return (
    <div className="bg-white dark:bg-dark-card border border-apple-gray-200 dark:border-dark-border rounded-xl p-4 shadow-2xl rotate-3 cursor-grabbing w-80">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-apple-gray-900 dark:text-white line-clamp-2">
            {task.title}
          </h4>
          <span className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${statusColors[task.status]}`}>
            {statusLabels[task.status]}
          </span>
        </div>

        {task.description && (
          <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-apple-gray-500 dark:text-apple-gray-400 pt-2 border-t border-apple-gray-100 dark:border-dark-border">
          {task.project && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{task.project.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{getTotalTime()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface KanbanColumnProps {
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  tasks: Task[];
  count: number;
}

const KanbanColumn = ({ title, status, tasks, count }: KanbanColumnProps) => {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  const columnColors = {
    PENDING: 'border-yellow-200 dark:border-yellow-900/50',
    IN_PROGRESS: 'border-blue-200 dark:border-blue-900/50',
    COMPLETED: 'border-green-200 dark:border-green-900/50'
  };

  const headerColors = {
    PENDING: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-400',
    IN_PROGRESS: 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-400',
    COMPLETED: 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-400'
  };

  return (
    <div ref={setNodeRef} className="flex flex-col h-[calc(100vh-280px)]">
      <Card className={`flex flex-col h-full border-t-4 ${columnColors[status]} dark:bg-dark-card`}>
        <CardHeader className={`${headerColors[status]} rounded-t-xl flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{title}</h3>
            <span className="px-2 py-1 rounded-full bg-white/50 dark:bg-black/20 text-xs font-medium">
              {count}
            </span>
          </div>
        </CardHeader>
        <CardBody className="space-y-3 p-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-apple-gray-300 dark:scrollbar-thumb-dark-border scrollbar-track-transparent hover:scrollbar-thumb-apple-gray-400 dark:hover:scrollbar-thumb-apple-gray-600">
          <SortableContext items={tasks.map(t => t.id.toString())} strategy={verticalListSortingStrategy}>
            {tasks.length === 0 ? (
              <div className="text-sm text-apple-gray-400 dark:text-apple-gray-500 text-center py-8">
                Arrastra tareas aquí...
              </div>
            ) : (
              tasks.map(task => <KanbanCard key={task.id} task={task} />)
            )}
          </SortableContext>
        </CardBody>
      </Card>
    </div>
  );
};

const Kanban = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const { token } = useAuthStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const authData = localStorage.getItem('auth-storage');
      const currentToken = token || (authData ? JSON.parse(authData).state?.token : null);

      const response = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });

      setTasks(response.data);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast.error('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id.toString() === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = parseInt(active.id.toString());

    // Check if dropping over a column or another task
    let newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'TRANSVERSAL';

    // If over.id is a status string, use it directly
    if (over.id === 'PENDING' || over.id === 'IN_PROGRESS' || over.id === 'COMPLETED') {
      newStatus = over.id;
    } else {
      // If over another task, find that task's status
      const targetTask = tasks.find(t => t.id.toString() === over.id.toString());
      if (!targetTask) return;
      newStatus = targetTask.status;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    const previousTasks = [...tasks];
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    ));

    try {
      const authData = localStorage.getItem('auth-storage');
      const currentToken = token || (authData ? JSON.parse(authData).state?.token : null);

      await axios.patch(
        `${API_URL}/tasks/${taskId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );

      toast.success('Tarea actualizada');
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error('Error al actualizar la tarea');
      // Revert on error
      setTasks(previousTasks);
    }
  };

  const columns = [
    { title: 'Por Hacer', status: 'PENDING' as const },
    { title: 'En Progreso', status: 'IN_PROGRESS' as const },
    { title: 'Completado', status: 'COMPLETED' as const }
  ];

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-apple-gray-900 dark:text-white">Kanban</h1>
            <p className="text-apple-gray-600 dark:text-apple-gray-400 mt-2">
              Vista de tablero de todas tus tareas
            </p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-apple-gray-900 dark:text-white">Kanban</h1>
          <p className="text-apple-gray-600 dark:text-apple-gray-400 mt-2">
            Vista de tablero de todas tus tareas
          </p>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((column) => (
              <KanbanColumn
                key={column.status}
                title={column.title}
                status={column.status}
                tasks={tasks.filter(t => t.status === column.status)}
                count={tasks.filter(t => t.status === column.status).length}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null} style={{ transformOrigin: '0 0' }}>
            {activeTask ? (
              <div style={{ transform: 'translate(-80%, -80%)' }}>
                <DragOverlayCard task={activeTask} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </PageTransition>
  );
};

export default Kanban;