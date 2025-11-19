import { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { Button, Card, CardBody } from '../../components/ui';

const Wiki = () => {
  const [pages] = useState([
    { id: '1', title: 'Guía de inicio', project: 'Web App', updatedAt: '2024-01-10' },
    { id: '2', title: 'API Documentation', project: 'Backend', updatedAt: '2024-01-08' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-apple-gray-900">Wiki</h1>
          <p className="text-apple-gray-600 mt-2">
            Documentación de proyectos en Markdown
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-5 h-5" />}>
          Nueva Página
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <Card key={page.id} hover className="cursor-pointer">
            <CardBody className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-apple bg-apple-blue-100">
                  <FileText className="w-5 h-5 text-apple-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-apple-gray-900 truncate">
                    {page.title}
                  </h3>
                  <p className="text-sm text-apple-gray-600 mt-1">
                    {page.project}
                  </p>
                </div>
              </div>
              <p className="text-xs text-apple-gray-500">
                Actualizado: {page.updatedAt}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Wiki;
