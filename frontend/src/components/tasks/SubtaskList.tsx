import { useState, useEffect } from 'react';
import { Plus, Clock, Calendar, FileText, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useSubtaskModalStore } from '../../store/subtaskModalStore';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

interface Subtask {
  id: number;
  description: string;
  workDate: string;
  startTime: string;
  endTime: string;
  timeSpentMinutes: number;
  taskId?: number;
}

interface SubtaskListProps {
  taskId: number;
  initialSubtasks?: Subtask[];
  filterDate?: string;
  onUpdate: () => void;
}

export function SubtaskList({ taskId, initialSubtasks = [], filterDate, onUpdate }: SubtaskListProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { openModal, setRefreshCallback } = useSubtaskModalStore();

  // Update subtasks when initialSubtasks changes
  useEffect(() => {
    setSubtasks(initialSubtasks);
  }, [initialSubtasks]);

  const fetchSubtasks = async () => {
    setLoading(true);
    try {
      const authData = localStorage.getItem('auth-storage');
      const token = authData ? JSON.parse(authData).state?.token : null;

      if (!token) return;

      const response = await axios.get(`${API_URL}/subtasks?taskId=${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubtasks(response.data);
    } catch (error) {
      console.error('Error fetching subtasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if expanded and no filter date (otherwise use initialSubtasks)
    if (expanded && !filterDate) {
      fetchSubtasks();
    }
  }, [expanded, taskId, filterDate]);

  useEffect(() => {
    setRefreshCallback(() => {
      fetchSubtasks();
      onUpdate();
    });
  }, []);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar este registro?')) return;

    try {
      const authData = localStorage.getItem('auth-storage');
      const token = authData ? JSON.parse(authData).state?.token : null;

      await axios.delete(`${API_URL}/subtasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Registro eliminado');
      fetchSubtasks();
      onUpdate();
    } catch (error) {
      toast.error('Error al eliminar registro');
    }
  };

  const handleEdit = (subtask: Subtask, e: React.MouseEvent) => {
    e.stopPropagation();
    openModal(taskId, subtask);
  };

  const handleCreate = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal(taskId, null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const totalMinutes = subtasks.reduce((sum, st) => sum + st.timeSpentMinutes, 0);

  return (
    <div className="mt-4 border-t border-apple-gray-200 dark:border-dark-border pt-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 hover:text-apple-blue-600 dark:hover:text-apple-blue-400 transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>Registros de tiempo ({subtasks.length})</span>
          {totalMinutes > 0 && (
            <span className="text-apple-blue-600 dark:text-apple-blue-400">- {formatTime(totalMinutes)}</span>
          )}
        </button>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-apple-blue-600 dark:text-apple-blue-400 hover:bg-apple-blue-50 dark:hover:bg-apple-blue-900/30 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar
        </button>
      </div>

      {expanded && (
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-apple-blue-500"></div>
            </div>
          ) : subtasks.length === 0 ? (
            <div className="text-center py-4 text-sm text-apple-gray-500 dark:text-apple-gray-400">
              No hay registros todavía
            </div>
          ) : (
            subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="bg-apple-gray-50 dark:bg-dark-hover rounded-lg p-3 hover:bg-apple-gray-100 dark:hover:bg-dark-card transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-apple-gray-800 dark:text-apple-gray-200 mb-2 leading-relaxed">
                      <FileText className="w-3.5 h-3.5 inline mr-1.5 text-apple-gray-400 dark:text-apple-gray-500" />
                      {subtask.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center text-apple-gray-600 dark:text-apple-gray-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(subtask.workDate)}
                      </span>
                      <span className="inline-flex items-center text-apple-gray-600 dark:text-apple-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {subtask.startTime} - {subtask.endTime}
                      </span>
                      <span className="inline-flex items-center font-semibold text-apple-blue-600 dark:text-apple-blue-400">
                        {formatTime(subtask.timeSpentMinutes)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 transition-opacity">
                    <button
                      onClick={(e) => handleEdit(subtask, e)}
                      className="p-1.5 hover:bg-apple-blue-100 dark:hover:bg-apple-blue-900/30 text-apple-blue-600 dark:text-apple-blue-400 rounded transition-colors"
                      title="Editar registro"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(subtask.id, e)}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
