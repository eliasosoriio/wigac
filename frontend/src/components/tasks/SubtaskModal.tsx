import { useState, useEffect } from 'react';
import { X, Clock, Calendar, FileText, Save } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

interface Subtask {
  id: number;
  description: string;
  workDate: string;
  startTime: string;
  endTime: string;
  timeSpentMinutes: number;
}

interface SubtaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskId: number;
  subtask?: Subtask | null;
}

export default function SubtaskModal({ isOpen, onClose, onSuccess, taskId, subtask }: SubtaskModalProps) {
  const [formData, setFormData] = useState({
    description: '',
    workDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subtask) {
      setFormData({
        description: subtask.description,
        workDate: subtask.workDate.split('T')[0],
        startTime: subtask.startTime,
        endTime: subtask.endTime,
      });
    } else {
      setFormData({
        description: '',
        workDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
      });
    }
    setError(null);
  }, [subtask, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage)?.state?.token : null;

      if (!token) {
        setError('No hay sesión activa');
        setLoading(false);
        return;
      }

      const url = subtask
        ? `${API_URL}/subtasks/${subtask.id}`
        : `${API_URL}/subtasks`;

      const method = subtask ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          taskId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al guardar subtarea');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return '';

    const [startHour, startMinute] = formData.startTime.split(':').map(Number);
    const [endHour, endMinute] = formData.endTime.split(':').map(Number);

    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    const duration = endTotalMinutes - startTotalMinutes;

    if (duration <= 0) return '⚠️ Hora inválida';

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    return `⏱️ ${hours}h ${minutes}m`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={subtask ? 'Editar Registro' : 'Nuevo Registro de Tiempo'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
            <FileText className="w-4 h-4" />
            Descripción del trabajo realizado
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-4 py-3 rounded-apple border border-apple-gray-300 dark:border-dark-border bg-white dark:bg-dark-hover text-apple-gray-900 dark:text-apple-gray-100 placeholder-apple-gray-400 dark:placeholder-apple-gray-500 focus:border-apple-blue-500 dark:focus:border-apple-blue-400 focus:ring-2 focus:ring-apple-blue-100 dark:focus:ring-apple-blue-900/30 transition-all resize-none"
            rows={4}
            required
            placeholder="Describe qué se hizo en este periodo de tiempo..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
              <Calendar className="w-4 h-4" />
              Fecha
            </label>
            <input
              type="date"
              value={formData.workDate}
              onChange={(e) =>
                setFormData({ ...formData, workDate: e.target.value })
              }
              className="w-full px-4 py-3 rounded-apple border border-apple-gray-300 dark:border-dark-border bg-white dark:bg-dark-hover text-apple-gray-900 dark:text-apple-gray-100 focus:border-apple-blue-500 dark:focus:border-apple-blue-400 focus:ring-2 focus:ring-apple-blue-100 dark:focus:ring-apple-blue-900/30 transition-all"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
              <Clock className="w-4 h-4" />
              Hora inicio
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              className="w-full px-4 py-3 rounded-apple border border-apple-gray-300 dark:border-dark-border bg-white dark:bg-dark-hover text-apple-gray-900 dark:text-apple-gray-100 focus:border-apple-blue-500 dark:focus:border-apple-blue-400 focus:ring-2 focus:ring-apple-blue-100 dark:focus:ring-apple-blue-900/30 transition-all"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
              <Clock className="w-4 h-4" />
              Hora fin
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              className="w-full px-4 py-3 rounded-apple border border-apple-gray-300 dark:border-dark-border bg-white dark:bg-dark-hover text-apple-gray-900 dark:text-apple-gray-100 focus:border-apple-blue-500 dark:focus:border-apple-blue-400 focus:ring-2 focus:ring-apple-blue-100 dark:focus:ring-apple-blue-900/30 transition-all"
              required
            />
          </div>
        </div>

        {formData.startTime && formData.endTime && (
          <div className="bg-apple-blue-50 dark:bg-apple-blue-900/30 border border-apple-blue-200 dark:border-apple-blue-800 rounded-lg px-4 py-3">
            <p className="text-sm text-apple-blue-700 dark:text-apple-blue-400 font-medium">
              {calculateDuration()}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="p-3 rounded-apple bg-apple-gray-900 hover:bg-apple-gray-800 dark:bg-apple-gray-800 dark:hover:bg-apple-gray-700 text-white transition-all"
            title="Cancelar"
          >
            <X className="w-4 h-4" />
          </button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            icon={<Save className="w-4 h-4" />}
            title={subtask ? 'Actualizar registro' : 'Crear registro'}
          />
        </div>
      </form>
    </Modal>
  );
}
