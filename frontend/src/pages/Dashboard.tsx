import { Card, CardBody, CardHeader } from '../components/ui';
import { FolderKanban, CheckSquare, Clock, TrendingUp } from 'lucide-react';
import PageTransition from '../components/animations/PageTransition';

const Dashboard = () => {
  const stats = [
    {
      icon: FolderKanban,
      label: 'Proyectos Activos',
      value: '12',
      color: 'text-apple-blue-500',
      bg: 'bg-apple-blue-100',
    },
    {
      icon: CheckSquare,
      label: 'Tareas Pendientes',
      value: '45',
      color: 'text-apple-orange-500',
      bg: 'bg-orange-100',
    },
    {
      icon: Clock,
      label: 'Horas esta semana',
      value: '32.5',
      color: 'text-apple-green-500',
      bg: 'bg-green-100',
    },
    {
      icon: TrendingUp,
      label: 'Completadas',
      value: '89%',
      color: 'text-apple-purple-500',
      bg: 'bg-purple-100',
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-apple-gray-900">
          Dashboard
        </h1>
        <p className="text-apple-gray-600 mt-2">
          Bienvenido de vuelta. Aquí tienes un resumen de tu actividad.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} hover>
            <CardBody className="flex items-center gap-4">
              <div className={`p-3 rounded-apple ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-apple-gray-600">{stat.label}</p>
                <p className="text-2xl font-semibold text-apple-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-apple-gray-900">
            Actividad Reciente
          </h2>
        </CardHeader>
        <CardBody>
          <p className="text-apple-gray-600">
            No hay actividad reciente para mostrar.
          </p>
        </CardBody>
      </Card>
    </div>
    </PageTransition>
  );
};

export default Dashboard;
