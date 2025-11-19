import { useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { Button, Card, CardBody, CardHeader } from '../../components/ui';
import { format } from 'date-fns';

const TimeTracking = () => {
  const [selectedDate] = useState(new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-apple-gray-900">
            Time Tracking
          </h1>
          <p className="text-apple-gray-600 mt-2">
            Registra tus horas de trabajo diarias
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={<Download className="w-5 h-5" />}>
            Generar Parte
          </Button>
          <Button variant="primary" icon={<Plus className="w-5 h-5" />}>
            Nueva Actividad
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-apple-gray-900">
            {format(selectedDate, 'dd MMMM yyyy')}
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <p className="text-apple-gray-600">
              No hay actividades registradas para hoy.
            </p>
            <div className="pt-4 border-t border-apple-gray-200">
              <p className="text-lg font-semibold text-apple-gray-900">
                Total: <span className="text-apple-blue-500">0 horas</span>
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default TimeTracking;
