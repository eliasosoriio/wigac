import { useState, useEffect, useRef } from 'react';
import PageTransition from '../../components/animations/PageTransition';
import { useAuthStore } from '../../store/authStore';
import { TaskModal } from '../../components/tasks/TaskModal';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AlertCircle, Zap, ArrowUp, Flame } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'TRANSVERSAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  mapPositionX?: number;
  mapPositionY?: number;
  project?: {
    id: number;
    name: string;
  };
}

const defaultColors = {
  LOW: { from: '#3b82f6', to: '#1d4ed8', gradient: 'from-blue-500 via-blue-600 to-blue-700' },
  MEDIUM: { from: '#10b981', to: '#047857', gradient: 'from-emerald-500 via-green-600 to-teal-700' },
  HIGH: { from: '#f59e0b', to: '#dc2626', gradient: 'from-amber-500 via-orange-600 to-red-600' },
  CRITICAL: { from: '#ef4444', to: '#7f1d1d', gradient: 'from-red-500 via-rose-600 to-red-900' },
};

const Map = () => {
  const { token } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [colors, setColors] = useState(() => {
    const saved = localStorage.getItem('map-colors');
    return saved ? JSON.parse(saved) : defaultColors;
  });

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

      // Filtrar solo tareas no completadas
      const incompleteTasks = response.data.filter(
        (task: Task) => task.status !== 'COMPLETED' && task.status !== 'TRANSVERSAL'
      );

      // Asignar posiciones aleatorias a tareas sin posición
      const tasksWithPositions = incompleteTasks.map((task: Task, index: number) => {
        if (task.mapPositionX === null || task.mapPositionX === undefined) {
          // Distribuir en un grid con algo de aleatoriedad
          const cols = Math.ceil(Math.sqrt(incompleteTasks.length));
          const row = Math.floor(index / cols);
          const col = index % cols;
          return {
            ...task,
            mapPositionX: 100 + col * 250 + Math.random() * 50,
            mapPositionY: 100 + row * 200 + Math.random() * 50
          };
        }
        return task;
      });

      setTasks(tasksWithPositions);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast.error('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskPosition = async (taskId: number, x: number, y: number) => {
    try {
      const authData = localStorage.getItem('auth-storage');
      const currentToken = token || (authData ? JSON.parse(authData).state?.token : null);

      await axios.patch(
        `${API_URL}/tasks/${taskId}/position`,
        { mapPositionX: x, mapPositionY: y },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
    } catch (error) {
      console.error('Error updating task position:', error);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setDragging(taskId);
    setOffset({
      x: e.clientX - (task.mapPositionX || 0),
      y: e.clientY - (task.mapPositionY || 0)
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging === null) return;

    const newX = e.clientX - offset.x;
    const newY = e.clientY - offset.y;

    setTasks(prev => prev.map(task =>
      task.id === dragging
        ? { ...task, mapPositionX: newX, mapPositionY: newY }
        : task
    ));
  };

  const handleMouseUp = () => {
    if (dragging !== null) {
      const task = tasks.find(t => t.id === dragging);
      if (task && task.mapPositionX !== undefined && task.mapPositionY !== undefined) {
        updateTaskPosition(dragging, task.mapPositionX, task.mapPositionY);
      }
      setDragging(null);
    }
  };

  const getPrioritySize = (priority: string) => {
    switch (priority) {
      case 'LOW': return 100;
      case 'MEDIUM': return 140;
      case 'HIGH': return 180;
      case 'CRITICAL': return 220;
      default: return 140;
    }
  };

  const updateColor = (priority: string, colorFrom: string, colorTo: string) => {
    const newColors = {
      ...colors,
      [priority]: {
        from: colorFrom,
        to: colorTo,
        gradient: colors[priority as keyof typeof colors].gradient
      }
    };
    setColors(newColors);
    localStorage.setItem('map-colors', JSON.stringify(newColors));
  };

  const resetColors = () => {
    setColors(defaultColors);
    localStorage.setItem('map-colors', JSON.stringify(defaultColors));
    toast.success('Colores restaurados');
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'LOW': return <AlertCircle className="w-5 h-5" />;
      case 'MEDIUM': return <Zap className="w-6 h-6" />;
      case 'HIGH': return <ArrowUp className="w-8 h-8" />;
      case 'CRITICAL': return <Flame className="w-10 h-10" />;
      default: return null;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'Baja';
      case 'MEDIUM': return 'Normal';
      case 'HIGH': return 'Alta';
      case 'CRITICAL': return 'Crítica';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-orange-500"></div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-apple-gray-900 dark:text-apple-gray-100">Mapa Mental</h1>
            <p className="text-apple-gray-600 dark:text-apple-gray-400 mt-2">
              Organiza visualmente tus tareas activas. Arrastra las burbujas para ordenarlas según tu criterio.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-sm">
              {/* Baja */}
              <div
                className="flex items-center gap-2 cursor-pointer group relative"
                onClick={() => setShowColorPicker(showColorPicker === 'LOW' ? null : 'LOW')}
              >
                <div
                  className="w-12 h-12 rounded-full shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${colors.LOW.from} 0%, ${colors.LOW.to} 100%)`
                  }}
                ></div>
                <span className="text-apple-gray-600 dark:text-apple-gray-400 group-hover:text-apple-gray-900 dark:group-hover:text-apple-gray-100 transition-colors">Baja</span>
                {showColorPicker === 'LOW' && (
                  <div className="absolute top-full mt-2 left-0 bg-dark-card border border-dark-border rounded-lg shadow-xl p-3 z-50">
                    <p className="text-xs text-apple-gray-400 mb-2">Color inicial:</p>
                    <input
                      type="color"
                      value={colors.LOW.from}
                      onChange={(e) => updateColor('LOW', e.target.value, colors.LOW.to)}
                      onInput={(e) => updateColor('LOW', e.currentTarget.value, colors.LOW.to)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-20 h-8 rounded cursor-pointer"
                    />
                    <p className="text-xs text-apple-gray-400 mb-2 mt-2">Color final:</p>
                    <input
                      type="color"
                      value={colors.LOW.to}
                      onChange={(e) => updateColor('LOW', colors.LOW.from, e.target.value)}
                      onInput={(e) => updateColor('LOW', colors.LOW.from, e.currentTarget.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-20 h-8 rounded cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Normal */}
              <div
                className="flex items-center gap-2 cursor-pointer group relative"
                onClick={() => setShowColorPicker(showColorPicker === 'MEDIUM' ? null : 'MEDIUM')}
              >
                <div
                  className="w-16 h-16 rounded-full shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${colors.MEDIUM.from} 0%, ${colors.MEDIUM.to} 100%)`
                  }}
                ></div>
                <span className="text-apple-gray-600 dark:text-apple-gray-400 group-hover:text-apple-gray-900 dark:group-hover:text-apple-gray-100 transition-colors">Normal</span>
                {showColorPicker === 'MEDIUM' && (
                  <div className="absolute top-full mt-2 left-0 bg-dark-card border border-dark-border rounded-lg shadow-xl p-3 z-50">
                    <p className="text-xs text-apple-gray-400 mb-2">Color inicial:</p>
                    <input
                      type="color"
                      value={colors.MEDIUM.from}
                      onChange={(e) => updateColor('MEDIUM', e.target.value, colors.MEDIUM.to)}
                      onInput={(e) => updateColor('MEDIUM', e.currentTarget.value, colors.MEDIUM.to)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-20 h-8 rounded cursor-pointer"
                    />
                    <p className="text-xs text-apple-gray-400 mb-2 mt-2">Color final:</p>
                    <input
                      type="color"
                      value={colors.MEDIUM.to}
                      onChange={(e) => updateColor('MEDIUM', colors.MEDIUM.from, e.target.value)}
                      onInput={(e) => updateColor('MEDIUM', colors.MEDIUM.from, e.currentTarget.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-20 h-8 rounded cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Alta */}
              <div
                className="flex items-center gap-2 cursor-pointer group relative"
                onClick={() => setShowColorPicker(showColorPicker === 'HIGH' ? null : 'HIGH')}
              >
                <div
                  className="w-20 h-20 rounded-full shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${colors.HIGH.from} 0%, ${colors.HIGH.to} 100%)`
                  }}
                ></div>
                <span className="text-apple-gray-600 dark:text-apple-gray-400 group-hover:text-apple-gray-900 dark:group-hover:text-apple-gray-100 transition-colors">Alta</span>
                {showColorPicker === 'HIGH' && (
                  <div className="absolute top-full mt-2 left-0 bg-dark-card border border-dark-border rounded-lg shadow-xl p-3 z-50">
                    <p className="text-xs text-apple-gray-400 mb-2">Color inicial:</p>
                    <input
                      type="color"
                      value={colors.HIGH.from}
                      onChange={(e) => updateColor('HIGH', e.target.value, colors.HIGH.to)}
                      onInput={(e) => updateColor('HIGH', e.currentTarget.value, colors.HIGH.to)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-20 h-8 rounded cursor-pointer"
                    />
                    <p className="text-xs text-apple-gray-400 mb-2 mt-2">Color final:</p>
                    <input
                      type="color"
                      value={colors.HIGH.to}
                      onChange={(e) => updateColor('HIGH', colors.HIGH.from, e.target.value)}
                      onInput={(e) => updateColor('HIGH', colors.HIGH.from, e.currentTarget.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-20 h-8 rounded cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Crítica */}
              <div
                className="flex items-center gap-2 cursor-pointer group relative"
                onClick={() => setShowColorPicker(showColorPicker === 'CRITICAL' ? null : 'CRITICAL')}
              >
                <div
                  className="w-24 h-24 rounded-full shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${colors.CRITICAL.from} 0%, ${colors.CRITICAL.to} 100%)`
                  }}
                ></div>
                <span className="text-apple-gray-600 dark:text-apple-gray-400 group-hover:text-apple-gray-900 dark:group-hover:text-apple-gray-100 transition-colors">Crítica</span>
                {showColorPicker === 'CRITICAL' && (
                  <div className="absolute top-full mt-2 left-0 bg-dark-card border border-dark-border rounded-lg shadow-xl p-3 z-50">
                    <p className="text-xs text-apple-gray-400 mb-2">Color inicial:</p>
                    <input
                      type="color"
                      value={colors.CRITICAL.from}
                      onChange={(e) => updateColor('CRITICAL', e.target.value, colors.CRITICAL.to)}
                      onInput={(e) => updateColor('CRITICAL', e.currentTarget.value, colors.CRITICAL.to)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-20 h-8 rounded cursor-pointer"
                    />
                    <p className="text-xs text-apple-gray-400 mb-2 mt-2">Color final:</p>
                    <input
                      type="color"
                      value={colors.CRITICAL.to}
                      onChange={(e) => updateColor('CRITICAL', colors.CRITICAL.from, e.target.value)}
                      onInput={(e) => updateColor('CRITICAL', colors.CRITICAL.from, e.currentTarget.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-20 h-8 rounded cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={resetColors}
              className="px-3 py-1.5 text-xs bg-dark-hover hover:bg-dark-border text-apple-gray-400 hover:text-apple-gray-100 rounded-lg transition-colors border border-dark-border"
            >
              Restaurar
            </button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-96 bg-dark-card rounded-2xl border-2 border-dashed border-dark-border">
            <div className="text-center">
              <p className="text-apple-gray-500 dark:text-apple-gray-400 text-lg mb-2">
                No hay tareas activas para mostrar
              </p>
              <p className="text-apple-gray-600 dark:text-apple-gray-500 text-sm">
                Las tareas completadas o transversales no se muestran en el mapa
              </p>
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="relative w-full bg-dark-card rounded-2xl border border-dark-border overflow-hidden"
            style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {tasks.map(task => {
              const size = getPrioritySize(task.priority);
              return (
                <div
                  key={task.id}
                  className={`absolute cursor-move select-none group ${
                    dragging === task.id ? 'z-50' : 'z-10'
                  }`}
                  style={{
                    left: `${task.mapPositionX}px`,
                    top: `${task.mapPositionY}px`,
                    width: `${size}px`,
                    height: `${size}px`,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, task.id)}
                >
                  <div
                    className={`w-full h-full rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center text-white font-medium text-center p-3 ${
                      dragging === task.id ? 'scale-110 ring-4 ring-white/50' : 'hover:scale-105'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${colors[task.priority as keyof typeof colors]?.from || '#6B7280'} 0%, ${colors[task.priority as keyof typeof colors]?.to || '#4B5563'} 100%)`
                    }}
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      {getPriorityIcon(task.priority)}
                      <span className="text-sm leading-tight line-clamp-3 px-2">{task.title}</span>
                    </div>
                  </div>

                  {/* Tooltip on hover - se muestra debajo si está arriba */}
                  <div className={`absolute left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none group-hover:pointer-events-auto ${
                    (task.mapPositionY || 0) < 180 ? 'top-full mt-2' : 'bottom-full mb-2'
                  }`}>
                    <div className="bg-dark-card border border-dark-border rounded-lg shadow-xl p-3 min-w-[200px]">
                      <h4 className="font-semibold text-apple-gray-100 mb-1">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-apple-gray-400 mb-2 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-apple-gray-500">Prioridad:</span>
                        <span className="text-apple-gray-300 font-medium">{getPriorityLabel(task.priority)}</span>
                      </div>
                      {task.project && (
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-apple-gray-500">Proyecto:</span>
                          <span className="text-apple-orange-400 font-medium">{task.project.name}</span>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task);
                          setShowTaskModal(true);
                        }}
                        className="mt-2 w-full py-1 px-2 bg-apple-orange-500 hover:bg-apple-orange-600 text-white text-xs rounded transition-colors cursor-pointer"
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de edición de tarea */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setSelectedTask(null);
        }}
        onSuccess={() => {
          fetchTasks();
        }}
        task={selectedTask as any}
      />
    </PageTransition>
  );
};

export default Map;
