import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Card, CardBody, Tag } from '../../components/ui';

const Projects = () => {
  const [projects] = useState([
    {
      id: '1',
      name: 'Proyecto Web App',
      description: 'Desarrollo de aplicación web principal',
      status: 'active',
      color: '#007aff',
      tasksCount: 24,
      progress: 65,
    },
    {
      id: '2',
      name: 'Diseño UI/UX',
      description: 'Renovación de diseño de interfaz',
      status: 'active',
      color: '#34c759',
      tasksCount: 12,
      progress: 40,
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-apple-gray-900">
            Proyectos
          </h1>
          <p className="text-apple-gray-600 mt-2">
            Gestiona tus proyectos y su progreso
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-5 h-5" />}>
          Nuevo Proyecto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} hover className="cursor-pointer">
            <CardBody className="space-y-4">
              <div className="flex items-start justify-between">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <Tag variant="primary" size="sm">
                  {project.status}
                </Tag>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-apple-gray-900">
                  {project.name}
                </h3>
                <p className="text-sm text-apple-gray-600 mt-1">
                  {project.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm text-apple-gray-600 mb-2">
                  <span>Progreso</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-apple-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-apple-blue-500 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-apple-gray-200">
                <span className="text-sm text-apple-gray-600">
                  {project.tasksCount} tareas
                </span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Projects;
