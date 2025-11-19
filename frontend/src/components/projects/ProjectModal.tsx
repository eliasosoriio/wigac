import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Button } from '../ui';
import { X, Save } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

interface Project {
  id?: number;
  name: string;
  description: string;
  status: string;
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project?: Project | null;
}

export const ProjectModal = ({ isOpen, onClose, onSuccess, project }: ProjectModalProps) => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'ACTIVE'
      });
    }
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (project?.id) {
        // Actualizar proyecto existente
        await axios.put(`${API_URL}/projects/${project.id}`, formData, config);
        toast.success('Proyecto actualizado exitosamente');
      } else {
        // Crear nuevo proyecto
        await axios.post(`${API_URL}/projects`, formData, config);
        toast.success('Proyecto creado exitosamente');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al guardar el proyecto';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? 'Editar Proyecto' : 'Nuevo Proyecto'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del proyecto"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ej: Desarrollo Web App"
          required
          disabled={loading}
        />

        <div>
          <label className="block text-sm font-medium text-apple-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe el proyecto..."
            className="w-full px-4 py-3 rounded-apple border border-apple-gray-300 focus:border-apple-blue-500 focus:ring-2 focus:ring-apple-blue-100 transition-all resize-none"
            rows={4}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-apple-gray-700 mb-2">
            Estado
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-3 rounded-apple border border-apple-gray-300 focus:border-apple-blue-500 focus:ring-2 focus:ring-apple-blue-100 transition-all"
            disabled={loading}
          >
            <option value="ACTIVE">Activo</option>
            <option value="ON_HOLD">En Espera</option>
            <option value="COMPLETED">Completado</option>
          </select>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            icon={<X className="w-4 h-4" />}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            icon={<Save className="w-4 h-4" />}
          >
            {project ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectModal;
