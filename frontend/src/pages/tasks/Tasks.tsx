import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Card, CardBody, Tag, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui';
import PageTransition from '../../components/animations/PageTransition';

const Tasks = () => {
  const [tasks] = useState([
    {
      id: '1',
      title: 'Implementar autenticación',
      project: 'Web App',
      status: 'in_progress',
      priority: 'high',
      assignee: 'Juan Pérez',
      dueDate: '2024-01-15',
    },
    {
      id: '2',
      title: 'Diseñar mockups',
      project: 'UI/UX',
      status: 'todo',
      priority: 'medium',
      assignee: 'María García',
      dueDate: '2024-01-20',
    },
  ]);

  const getStatusColor = (status: string) => {
    const colors = {
      todo: 'default',
      in_progress: 'primary',
      done: 'success',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'default',
      medium: 'warning',
      high: 'danger',
    };
    return colors[priority as keyof typeof colors] || 'default';
  };

  return (
    <PageTransition>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-apple-gray-900">Tareas</h1>
          <p className="text-apple-gray-600 mt-2">
            Gestiona todas las tareas de tus proyectos
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-5 h-5" />}>
          Nueva Tarea
        </Button>
      </div>

      <Card>
        <CardBody className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarea</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Asignado a</TableHead>
                <TableHead>Fecha Límite</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} onClick={() => {}}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{task.project}</TableCell>
                  <TableCell>
                    <Tag variant={getStatusColor(task.status) as any} size="sm">
                      {task.status}
                    </Tag>
                  </TableCell>
                  <TableCell>
                    <Tag variant={getPriorityColor(task.priority) as any} size="sm">
                      {task.priority}
                    </Tag>
                  </TableCell>
                  <TableCell>{task.assignee}</TableCell>
                  <TableCell>{task.dueDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
        </Card>
      </div>
    </PageTransition>
  );
};

export default Tasks;