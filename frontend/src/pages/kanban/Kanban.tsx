import { Card, CardBody, CardHeader } from '../../components/ui';
import PageTransition from '../../components/animations/PageTransition';

const Kanban = () => {
  const columns = ['Por Hacer', 'En Progreso', 'Completado'];

  return (
    <PageTransition>
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-apple-gray-900">Kanban</h1>
        <p className="text-apple-gray-600 mt-2">
          Vista de tablero de todas tus tareas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <Card key={column} className="min-h-[500px]">
            <CardHeader>
              <h3 className="font-semibold text-apple-gray-900">{column}</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-sm text-apple-gray-500">
                Arrastra tareas aquí...
              </p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
    </PageTransition>
  );
};

export default Kanban;