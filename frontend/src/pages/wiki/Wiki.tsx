import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, FolderKanban, ChevronRight, ChevronDown, Trash2, Edit2, CheckSquare, X, Save, ChevronUp } from 'lucide-react';
import { Card, CardBody } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui';
import PageTransition from '../../components/animations/PageTransition';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

interface WikiPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  projectId?: number;
  taskId?: number;
  project?: {
    id: number;
    name: string;
  };
  task?: {
    id: number;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TreeNode {
  id: string;
  type: 'project' | 'task' | 'page';
  name: string;
  pages?: WikiPage[];
  tasks?: TreeNode[];
  expanded?: boolean;
  projectId?: number;
  taskId?: number;
}

const Wiki = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
  const [newPageTitle, setNewPageTitle] = useState('');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pagesRes, projectsRes, tasksRes] = await Promise.all([
        axios.get(`${API_URL}/wiki`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/projects`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setPages(pagesRes.data);
      setProjects(projectsRes.data);
      setTasks(tasksRes.data);
      buildTree(pagesRes.data, projectsRes.data, tasksRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (wikiPages: WikiPage[], projects: any[], tasks: any[]) => {
    const tree: TreeNode[] = [];

    // Pages sin proyecto ni tarea
    const orphanPages = wikiPages.filter(p => !p.projectId && !p.taskId);
    if (orphanPages.length > 0) {
      tree.push({
        id: 'orphan',
        type: 'project',
        name: 'Sin clasificar',
        pages: orphanPages,
        expanded: false
      });
    }

    // Agrupar por proyecto
    projects.forEach(project => {
      const projectPages = wikiPages.filter(p => p.projectId === project.id && !p.taskId);
      const projectTasks = tasks.filter(t => t.project?.id === project.id);

      const taskNodes: TreeNode[] = projectTasks.map(task => ({
        id: `task-${task.id}`,
        type: 'task' as const,
        name: task.title,
        projectId: project.id,
        taskId: task.id,
        pages: wikiPages.filter(p => p.taskId === task.id),
        expanded: false
      })).filter(node => node.pages && node.pages.length > 0);

      if (projectPages.length > 0 || taskNodes.length > 0) {
        tree.push({
          id: `project-${project.id}`,
          type: 'project' as const,
          name: project.name,
          projectId: project.id,
          pages: projectPages,
          tasks: taskNodes,
          expanded: false
        });
      }
    });

    setTreeData(tree);
  };

  const toggleNode = (nodeId: string) => {
    const updateTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.tasks) {
          return { ...node, tasks: updateTree(node.tasks) };
        }
        return node;
      });
    };
    setTreeData(updateTree(treeData));
  };

  const toggleTaskPages = (taskId: number) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) {
      toast.error('El título es requerido');
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/wiki`,
        {
          title: newPageTitle,
          content: '# ' + newPageTitle + '\n\nComienza a escribir aquí...',
          projectId: selectedProject,
          taskId: selectedTask
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Página creada');
      setShowModal(false);
      setNewPageTitle('');
      setSelectedProject(null);
      setSelectedTask(null);
      navigate(`/wiki/${response.data.id}`);
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error('Error al crear página');
    }
  };

  const handleDeletePage = async (pageId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Estás seguro de eliminar esta página?')) return;

    try {
      await axios.delete(`${API_URL}/wiki/${pageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Página eliminada');
      fetchData();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Error al eliminar página');
    }
  };

  const renderTree = (nodes: TreeNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.id} style={{ marginLeft: `${level * 20}px` }}>
        <div className="flex items-center gap-2 py-2 px-3 hover:bg-apple-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors group">
          {(node.type === 'project' || node.type === 'task') && (node.tasks?.length || 0) > 0 && (
            <button
              onClick={() => toggleNode(node.id)}
              className="p-1 hover:bg-apple-gray-200 dark:hover:bg-dark-border rounded"
            >
              {node.expanded ? (
                <ChevronDown className="w-4 h-4 text-apple-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-apple-gray-500" />
              )}
            </button>
          )}

          {node.type === 'project' ? (
            <FolderKanban className="w-4 h-4 text-apple-blue-500" />
          ) : node.type === 'task' ? (
            <CheckSquare className="w-4 h-4 text-orange-500" />
          ) : (
            <FileText className="w-4 h-4 text-apple-gray-500" />
          )}

          <span className="flex-1 text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300">
            {node.name}
          </span>
        </div>

        {node.pages && node.pages.length > 0 && node.type === 'task' && (
          <div style={{ marginLeft: '20px' }}>
            <button
              onClick={() => toggleTaskPages(node.taskId!)}
              className="flex items-center gap-2 py-1.5 px-3 mb-1 hover:bg-apple-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors w-full text-left"
            >
              {expandedTasks.has(node.taskId!) ? (
                <ChevronUp className="w-3.5 h-3.5 text-apple-gray-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-apple-gray-500" />
              )}
              <span className="text-xs font-medium text-apple-gray-600 dark:text-apple-gray-400">
                Páginas ({node.pages.length})
              </span>
            </button>
            {expandedTasks.has(node.taskId!) && (
              <div className="space-y-0.5">
                {node.pages.map(page => (
                  <div
                    key={page.id}
                    className="flex items-center gap-2 py-2 px-3 hover:bg-apple-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors cursor-pointer group"
                    onClick={() => navigate(`/wiki/${page.id}`)}
                  >
                    <FileText className="w-4 h-4 text-apple-gray-400 dark:text-apple-gray-500" />
                    <span className="flex-1 text-sm text-apple-gray-600 dark:text-apple-gray-400">
                      {page.title}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/wiki/${page.id}`);
                        }}
                        className="p-1 hover:bg-apple-gray-200 dark:hover:bg-dark-card text-apple-gray-600 dark:text-apple-gray-400 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeletePage(page.id, e)}
                        className="p-1 hover:bg-apple-gray-200 dark:hover:bg-dark-card text-apple-gray-600 dark:text-apple-gray-400 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {node.pages && node.pages.length > 0 && node.type !== 'task' && (
          <div style={{ marginLeft: '20px' }}>
            {node.pages.map(page => (
              <div
                key={page.id}
                className="flex items-center gap-2 py-2 px-3 hover:bg-apple-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors cursor-pointer group"
                onClick={() => navigate(`/wiki/${page.id}`)}
              >
                <FileText className="w-4 h-4 text-apple-gray-400 dark:text-apple-gray-500" />
                <span className="flex-1 text-sm text-apple-gray-600 dark:text-apple-gray-400">
                  {page.title}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/wiki/${page.id}`);
                    }}
                    className="p-1 hover:bg-apple-gray-200 dark:hover:bg-dark-card text-apple-gray-600 dark:text-apple-gray-400 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeletePage(page.id, e)}
                    className="p-1 hover:bg-apple-gray-200 dark:hover:bg-dark-card text-apple-gray-600 dark:text-apple-gray-400 rounded transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {node.expanded && node.tasks && renderTree(node.tasks, level + 1)}
      </div>
    ));
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

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-apple-gray-900 dark:text-apple-gray-100">Wiki</h1>
            <p className="text-apple-gray-600 dark:text-apple-gray-400 mt-2">
              Documentación en Markdown organizada por proyectos y tareas
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="p-3 rounded-apple bg-apple-orange-500 hover:bg-apple-orange-600 text-white transition-all shadow-apple"
            title="Nueva Página"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Árbol de navegación */}
          <Card className="lg:col-span-1">
            <CardBody>
              <h2 className="text-lg font-semibold text-apple-gray-900 dark:text-apple-gray-100 mb-4">
                Navegación
              </h2>
              <div className="space-y-1">
                {treeData.length === 0 ? (
                  <p className="text-sm text-apple-gray-500 dark:text-apple-gray-400 text-center py-8">
                    No hay páginas todavía
                  </p>
                ) : (
                  renderTree(treeData)
                )}
              </div>
            </CardBody>
          </Card>

          {/* Lista de páginas recientes */}
          <Card className="lg:col-span-2">
            <CardBody>
              <h2 className="text-lg font-semibold text-apple-gray-900 dark:text-apple-gray-100 mb-4">
                Páginas Recientes
              </h2>
              {pages.length === 0 ? (
                <p className="text-center py-12 text-apple-gray-500 dark:text-apple-gray-400">
                  No hay páginas todavía
                </p>
              ) : (
                <div className="space-y-3">
                  {pages.slice(0, 10).map(page => (
                    <div
                      key={page.id}
                      onClick={() => navigate(`/wiki/${page.id}`)}
                      className="p-4 bg-apple-gray-50 dark:bg-dark-hover hover:bg-apple-gray-100 dark:hover:bg-dark-card rounded-lg cursor-pointer transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-apple-gray-900 dark:text-apple-gray-100 mb-1">
                            {page.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-apple-gray-500 dark:text-apple-gray-400">
                            {page.project && (
                              <span className="inline-flex items-center gap-1">
                                <FolderKanban className="w-3 h-3" />
                                {page.project.name}
                              </span>
                            )}
                            {page.task && (
                              <span className="inline-flex items-center gap-1">
                                <CheckSquare className="w-3 h-3" />
                                {page.task.title}
                              </span>
                            )}
                            <span>
                              {new Date(page.updatedAt).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/wiki/${page.id}`);
                            }}
                            className="p-2 hover:bg-apple-blue-100 dark:hover:bg-apple-blue-900/30 text-apple-blue-600 dark:text-apple-blue-400 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeletePage(page.id, e)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Modal para crear nueva página */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setNewPageTitle('');
            setSelectedProject(null);
            setSelectedTask(null);
          }}
          title="Nueva Página Wiki"
          size="md"
        >
          <form onSubmit={(e) => { e.preventDefault(); handleCreatePage(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
                Título
              </label>
              <input
                type="text"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-apple border border-apple-gray-300 dark:border-dark-border bg-white dark:bg-dark-hover text-apple-gray-900 dark:text-apple-gray-100 focus:border-apple-blue-500 dark:focus:border-apple-blue-400 focus:ring-2 focus:ring-apple-blue-100 dark:focus:ring-apple-blue-900/30 transition-all"
                placeholder="Título de la página"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
                Proyecto (opcional)
              </label>
              <select
                value={selectedProject || ''}
                onChange={(e) => {
                  setSelectedProject(e.target.value ? parseInt(e.target.value) : null);
                  setSelectedTask(null);
                }}
                className="w-full px-4 py-3 rounded-apple border border-apple-gray-300 dark:border-dark-border bg-white dark:bg-dark-hover text-apple-gray-900 dark:text-apple-gray-100 focus:border-apple-blue-500 dark:focus:border-apple-blue-400 focus:ring-2 focus:ring-apple-blue-100 dark:focus:ring-apple-blue-900/30 transition-all"
              >
                <option value="">Sin proyecto</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedProject && (
              <div>
                <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
                  Tarea (opcional)
                </label>
                <select
                  value={selectedTask || ''}
                  onChange={(e) => setSelectedTask(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-3 rounded-apple border border-apple-gray-300 dark:border-dark-border bg-white dark:bg-dark-hover text-apple-gray-900 dark:text-apple-gray-100 focus:border-apple-blue-500 dark:focus:border-apple-blue-400 focus:ring-2 focus:ring-apple-blue-100 dark:focus:ring-apple-blue-900/30 transition-all"
                >
                  <option value="">Sin tarea</option>
                  {tasks
                    .filter(t => t.project?.id === selectedProject)
                    .map(task => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setNewPageTitle('');
                  setSelectedProject(null);
                  setSelectedTask(null);
                }}
                className="p-3 rounded-apple bg-apple-gray-900 hover:bg-apple-gray-800 dark:bg-apple-gray-800 dark:hover:bg-apple-gray-700 text-white transition-all"
                title="Cancelar"
              >
                <X className="w-4 h-4" />
              </button>
              <Button
                type="submit"
                variant="primary"
                icon={<Save className="w-4 h-4" />}
                title="Crear página"
              />
            </div>
          </form>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default Wiki;
