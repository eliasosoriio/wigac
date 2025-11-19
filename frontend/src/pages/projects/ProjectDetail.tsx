import { useParams } from 'react-router-dom';
import { Card, CardBody, CardHeader } from '../../components/ui';
import PageTransition from '../../components/animations/PageTransition';

const ProjectDetail = () => {
  const { id } = useParams();

  return (
    <PageTransition>
      <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-apple-gray-900">
        Detalle del Proyecto {id}
      </h1>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Información del Proyecto</h2>
        </CardHeader>
        <CardBody>
          <p className="text-apple-gray-600">
            Contenido del proyecto en desarrollo...
          </p>
        </CardBody>
        </Card>
      </div>
    </PageTransition>
  );
};

export default ProjectDetail;