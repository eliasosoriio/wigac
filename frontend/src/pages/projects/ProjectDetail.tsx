import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { Button, Card, CardBody, CardHeader, Tag } from '../../components/ui';
import PageTransition from '../../components/animations/PageTransition';
import ProjectModal from '../../components/projects/ProjectModal';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  _count?: {
    tasks: number;
  };
}

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(response.data);
    } catch (error) {
      toast.error('Error al cargar el proyecto');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este proyecto?')) return;

    try {
      await axios.delete(`${API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Proyecto eliminado');
      navigate('/projects');
    } catch (error) {
      toast.error('Error al eliminar proyecto');
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: 'Activo',
      ON_HOLD: 'En Espera',
      COMPLETED: 'Completado'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'primary',
      ON_HOLD: 'warning',
      COMPLETED: 'success'
    };
    return colors[status] || 'default';
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

  if (!project) {
    return null;
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              icon={<ArrowLeft className="w-5 h-5" />}
              onClick={() => navigate('/projects')}
            >
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-semibold text-apple-gray-900">
                {project.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Tag variant={getStatusColor(project.status) as any} size="sm">
                  {getStatusLabel(project.status)}
                </Tag>
                <span className="text-sm text-apple-gray-600">
                  {project._count?.tasks || 0} tareas
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              icon={<Edit2 className="w-5 h-5" />}
              onClick={() => setShowModal(true)}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 className="w-5 h-5" />}
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-apple-gray-900">
              Descripción
            </h2>
          </CardHeader>
          <CardBody>
            <p className="text-apple-gray-600">{project.description}</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-apple-gray-900">Tareas</h2>
          </CardHeader>
          <CardBody>
            <p className="text-apple-gray-600">
              Las tareas del proyecto aparecerán aquí próximamente.
            </p>
          </CardBody>
        </Card>

        <ProjectModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchProject();
            setShowModal(false);
          }}
          project={project}
        />
      </div>
    </PageTransition>
  );
};

export default ProjectDetail;