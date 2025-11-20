import { useState, useEffect } from 'react';
import { X, Clock, FileText, Calendar, FolderKanban } from 'lucide-react';
import { Button } from '../ui';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

interface Project {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  projectId?: number;
  project?: {
    id: number;
    name: string;
  };
}

interface SubtaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate: string;
  token: string;
}

export const SubtaskModal = ({ isOpen, onClose, onSuccess, selectedDate, token }: SubtaskModalProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    taskId: '',
    description: '',
    workDate: selectedDate,
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      fetchTasks();
      setFormData(prev => ({ ...prev, workDate: selectedDate, projectId: '', taskId: '' }));
    }
  }, [isOpen, selectedDate]);

  useEffect(() => {
    if (formData.projectId) {
      const filtered = tasks.filter(task =>
        task.projectId?.toString() === formData.projectId
      );
      setFilteredTasks(filtered);
      // Reset taskId if the selected task is not in the filtered list
      if (formData.taskId && !filtered.find(t => t.id.toString() === formData.taskId)) {
        setFormData(prev => ({ ...prev, taskId: '' }));
      }
    } else {
      setFilteredTasks(tasks);
    }
  }, [formData.projectId, tasks]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Error al cargar proyectos');
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Error al cargar tareas');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.taskId || !formData.startTime || !formData.endTime) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    // Validar que la hora de fin sea posterior a la de inicio
    if (formData.startTime >= formData.endTime) {
      toast.error('La hora de fin debe ser posterior a la hora de inicio');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/subtasks`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Subtarea creada exitosamente');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error creating subtask:', error);
      toast.error(error.response?.data?.message || 'Error al crear subtarea');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      projectId: '',
      taskId: '',
      description: '',
      workDate: selectedDate,
      startTime: '',
      endTime: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        <div className="sticky top-0 bg-white dark:bg-dark-card border-b border-apple-gray-200 dark:border-dark-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-semibold text-apple-gray-900 dark:text-white">
            Crear Registro de Tiempo
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-apple-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-apple-gray-500 dark:text-apple-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Fecha */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
              <Calendar className="w-4 h-4" />
              Fecha
            </label>
            <input
              type="date"
              value={formData.workDate}
              onChange={(e) => setFormData({ ...formData, workDate: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-apple-gray-200 dark:border-dark-border bg-white dark:bg-dark-hover text-apple-gray-900 dark:text-apple-gray-100 focus:border-apple-blue-500 dark:focus:border-apple-blue-400 focus:ring-0 transition-all"
              required
            />
          </div>

          {/* Proyecto */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
              <FolderKanban className="w-4 h-4" />
              Proyecto
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value, taskId: '' })}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-apple-gray-200 dark:border-dark-border bg-white dark:bg-dark-hover text-apple-gray-900 dark:text-apple-gray-100 focus:border-apple-blue-500 dark:focus:border-apple-blue-400 focus:ring-0 transition-all"
            >
              <option value="">Todos los proyectos</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tarea */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
              <FileText className="w-4 h-4" />
              Tarea
            </label>
            <select
              value={formData.taskId}
              onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-apple-gray-200 dark:border-dark-border bg-white dark:bg-dark-hover text-apple-gray-900 dark:text-apple-gray-100 focus:border-apple-blue-500 dark:focus:border-apple-blue-400 focus:ring-0 transition-all"
              required
            >
              <option value="">Selecciona una tarea...</option>
              {filteredTasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>

          {/* Horario */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
                <Clock className="w-4 h-4" />
                Hora de Inicio
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-apple-gray-200 dark:border-dark-border bg-white dark:bg-dark-hover text-apple-gray-900 dark:text-apple-gray-100 focus:border-apple-blue-500 dark:focus:border-apple-blue-400 focus:ring-0 transition-all"
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
                <Clock className="w-4 h-4" />
                Hora de Fin
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-apple-gray-200 dark:border-dark-border bg-white dark:bg-dark-hover text-apple-gray-900 dark:text-apple-gray-100 focus:border-apple-blue-500 dark:focus:border-apple-blue-400 focus:ring-0 transition-all"
                required
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
              <FileText className="w-4 h-4" />
              Descripción (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-apple-gray-200 dark:border-dark-border bg-white dark:bg-dark-hover text-apple-gray-900 dark:text-apple-gray-100 focus:border-apple-blue-500 dark:focus:border-apple-blue-400 focus:ring-0 transition-all resize-none"
              placeholder="Describe en qué trabajaste..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creando...' : 'Crear Registro'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
