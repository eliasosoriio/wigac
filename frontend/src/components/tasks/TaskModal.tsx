import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Button } from '../ui';
import { X, Save } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

interface Task {
  id?: number;
  title: string;
  description: string;
  status: string;
  projectId?: number;
}

interface Project {
  id: number;
  name: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task?: Task | null;
}

export const TaskModal = ({ isOpen, onClose, onSuccess, task }: TaskModalProps) => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'PENDING',
    projectId: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        projectId: task.projectId ? String(task.projectId) : ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'PENDING',
        projectId: ''
      });
    }
  }, [task, isOpen]);

  const fetchProjects = async () => {
    try {
      const authData = localStorage.getItem('auth-storage');
      const currentToken = token || (authData ? JSON.parse(authData).state?.token : null);

      const response = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authData = localStorage.getItem('auth-storage');
      const currentToken = token || (authData ? JSON.parse(authData).state?.token : null);

      const config = {
        headers: { Authorization: `Bearer ${currentToken}` }
      };

      // Si el estado es TRANSVERSAL, guardamos como COMPLETED
      const finalStatus = formData.status === 'TRANSVERSAL' ? 'COMPLETED' : formData.status;

      const payload = {
        ...formData,
        status: finalStatus,
        projectId: formData.projectId ? parseInt(formData.projectId) : null
      };

      if (task?.id) {
        // Update
        await axios.put(`${API_URL}/tasks/${task.id}`, payload, config);
        toast.success('Tarea actualizada exitosamente');
      } else {
        // Create
        await axios.post(`${API_URL}/tasks`, payload, config);
        toast.success('Tarea creada exitosamente');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al guardar la tarea';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task?.id ? 'Editar Tarea' : 'Nueva Tarea'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Título de la tarea"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ej: Desarrollar login de usuarios"
          required
          disabled={loading}
        />

        <div>
          <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe la tarea..."
            className="w-full px-4 py-3 rounded-apple border border-apple-gray-300 dark:border-dark-border bg-white dark:bg-dark-hover text-apple-gray-900 dark:text-apple-gray-100 placeholder-apple-gray-400 dark:placeholder-apple-gray-500 focus:border-apple-blue-500 dark:focus:border-apple-blue-400 focus:ring-2 focus:ring-apple-blue-100 dark:focus:ring-apple-blue-900/30 transition-all resize-none"
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
              Proyecto
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-4 py-3 rounded-apple border border-apple-gray-300 dark:border-dark-border bg-white dark:bg-dark-hover text-apple-gray-900 dark:text-apple-gray-100 focus:border-apple-blue-500 dark:focus:border-apple-blue-400 focus:ring-2 focus:ring-apple-blue-100 dark:focus:ring-apple-blue-900/30 transition-all"
              disabled={loading}
            >
              <option value="">Sin proyecto</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 rounded-apple border border-apple-gray-300 dark:border-dark-border bg-white dark:bg-dark-hover text-apple-gray-900 dark:text-apple-gray-100 focus:border-apple-blue-500 dark:focus:border-apple-blue-400 focus:ring-2 focus:ring-apple-blue-100 dark:focus:ring-apple-blue-900/30 transition-all"
              disabled={loading}
            >
              <option value="PENDING">Pendiente</option>
              <option value="IN_PROGRESS">En Proceso</option>
              <option value="COMPLETED">Completada</option>
              <option value="TRANSVERSAL">Transversal</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-3 rounded-apple bg-apple-gray-900 hover:bg-apple-gray-800 dark:bg-apple-gray-800 dark:hover:bg-apple-gray-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Cancelar"
          >
            <X className="w-4 h-4" />
          </button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            icon={<Save className="w-4 h-4" />}
            title={task ? 'Actualizar tarea' : 'Crear tarea'}
          />
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
