import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '../components/ui';
import { FolderKanban, CheckSquare, Clock, TrendingUp, Calendar, Save } from 'lucide-react';
import PageTransition from '../components/animations/PageTransition';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

interface DashboardStats {
  activeProjects: number;
  pendingTasks: number;
  weekHours: number;
  completionRate: number;
  recentActivity: Array<{
    id: number;
    type: 'task' | 'project';
    title: string;
    date: string;
    status: string;
  }>;
}

const Dashboard = () => {
  const { token, user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    fetchDashboardData();
    loadNotes();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveNotes();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notes]);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, tasksRes, subtasksRes] = await Promise.all([
        axios.get(`${API_URL}/projects`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/subtasks`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const projects = projectsRes.data;
      const tasks = tasksRes.data;
      const subtasks = subtasksRes.data;

      // Calcular proyectos activos
      const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE').length;

      // Calcular tareas pendientes
      const pendingTasks = tasks.filter((t: any) =>
        t.status === 'PENDING' || t.status === 'IN_PROGRESS'
      ).length;

      // Calcular horas de esta semana
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

      const weekSubtasks = subtasks.filter((st: any) => {
        const workDate = new Date(st.workDate);
        return workDate >= weekStart && workDate <= weekEnd;
      });

      const weekMinutes = weekSubtasks.reduce((sum: number, st: any) => sum + st.timeSpentMinutes, 0);
      const weekHours = Math.round((weekMinutes / 60) * 10) / 10;

      // Calcular tasa de completitud
      const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED').length;
      const completionRate = tasks.length > 0
        ? Math.round((completedTasks / tasks.length) * 100)
        : 0;

      // Actividad reciente (últimas tareas completadas o en progreso)
      const recentActivity = tasks
        .filter((t: any) => t.status === 'COMPLETED' || t.status === 'IN_PROGRESS')
        .slice(0, 5)
        .map((t: any) => ({
          id: t.id,
          type: 'task' as const,
          title: t.title,
          date: t.updatedAt || t.createdAt,
          status: t.status
        }));

      setStats({
        activeProjects,
        pendingTasks,
        weekHours,
        completionRate,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = () => {
    const savedNotes = localStorage.getItem('dashboard-notes');
    if (savedNotes) {
      setNotes(savedNotes);
      const savedDate = localStorage.getItem('dashboard-notes-date');
      if (savedDate) {
        setLastSaved(new Date(savedDate));
      }
    }
  };

  const saveNotes = () => {
    setSaving(true);
    try {
      localStorage.setItem('dashboard-notes', notes);
      const now = new Date();
      localStorage.setItem('dashboard-notes-date', now.toISOString());
      setLastSaved(now);
      toast.success('Notas guardadas');
    } catch (error) {
      toast.error('Error al guardar notas');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'text-gray-600 dark:text-gray-400',
      IN_PROGRESS: 'text-orange-600 dark:text-orange-400',
      COMPLETED: 'text-green-600 dark:text-green-400',
      TRANSVERSAL: 'text-purple-600 dark:text-purple-400'
    };
    return colors[status] || 'text-gray-600 dark:text-gray-400';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      IN_PROGRESS: 'En Proceso',
      COMPLETED: 'Completada',
      TRANSVERSAL: 'Transversal'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-blue-500"></div>
        </div>
      </PageTransition>
    );
  }

  const statCards = [
    {
      icon: FolderKanban,
      label: 'Proyectos Activos',
      value: stats?.activeProjects || 0,
      color: 'text-apple-blue-500 dark:text-apple-blue-400',
      bg: 'bg-apple-blue-100 dark:bg-apple-blue-900/30',
    },
    {
      icon: CheckSquare,
      label: 'Tareas Pendientes',
      value: stats?.pendingTasks || 0,
      color: 'text-orange-500 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
    },
    {
      icon: Clock,
      label: 'Horas esta semana',
      value: `${stats?.weekHours || 0}h`,
      color: 'text-apple-green-500 dark:text-apple-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      icon: TrendingUp,
      label: 'Completadas',
      value: `${stats?.completionRate || 0}%`,
      color: 'text-purple-500 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-apple-gray-900 dark:text-apple-gray-100">
            Dashboard
          </h1>
          <p className="text-apple-gray-600 dark:text-apple-gray-400 mt-2">
            Bienvenido de vuelta, {user?.name}. Aquí tienes un resumen de tu actividad.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <Card key={index} hover>
              <CardBody className="flex items-center gap-4">
                <div className={`p-3 rounded-apple ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400">{stat.label}</p>
                  <p className="text-2xl font-semibold text-apple-gray-900 dark:text-apple-gray-100 mt-1">
                    {stat.value}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Notes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-apple-gray-900 dark:text-apple-gray-100">
                  Notas Rápidas
                </h2>
                <div className="flex items-center gap-3">
                  {lastSaved && (
                    <span className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
                      Guardado: {format(lastSaved, 'HH:mm', { locale: es })}
                    </span>
                  )}
                  <button
                    onClick={saveNotes}
                    disabled={saving}
                    className="p-2 bg-apple-orange-500 hover:bg-apple-orange-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    title={saving ? 'Guardando...' : 'Guardar notas'}
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400 mt-1">
                Presiona Ctrl+S o Cmd+S para guardar rápidamente
              </p>
            </CardHeader>
            <CardBody>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escribe tus notas rápidas aquí..."
                className="w-full h-96 p-4 bg-apple-gray-50 dark:bg-dark-hover border border-apple-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-apple-blue-500 focus:border-transparent resize-none text-apple-gray-900 dark:text-apple-gray-100 placeholder-apple-gray-400 dark:placeholder-apple-gray-500 scrollbar-thin scrollbar-thumb-apple-gray-300 dark:scrollbar-thumb-dark-border scrollbar-track-transparent"
              />
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-apple-gray-900 dark:text-apple-gray-100">
                Actividad Reciente
              </h2>
            </CardHeader>
            <CardBody>
              {!stats?.recentActivity || stats.recentActivity.length === 0 ? (
                <p className="text-apple-gray-600 dark:text-apple-gray-400 text-center py-8">
                  No hay actividad reciente
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 bg-apple-gray-50 dark:bg-dark-hover rounded-lg hover:bg-apple-gray-100 dark:hover:bg-dark-card transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-apple-gray-400 dark:text-apple-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-apple-gray-900 dark:text-apple-gray-100 truncate">
                          {activity.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {getStatusLabel(activity.status)}
                          </span>
                          <span className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
                            {format(new Date(activity.date), 'd MMM', { locale: es })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
