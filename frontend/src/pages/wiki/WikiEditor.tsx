import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, FolderKanban, CheckSquare, Link2, Unlink } from 'lucide-react';
import { Button, Card, CardBody } from '../../components/ui';
import PageTransition from '../../components/animations/PageTransition';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

interface WikiPage {
  id: number;
  title: string;
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
}

const WikiEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [page, setPage] = useState<WikiPage | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncScroll, setSyncScroll] = useState(true);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<number>();

  useEffect(() => {
    if (id) {
      fetchPage();
    }

    // Cleanup al desmontar
    return () => {
      if (scrollTimeoutRef.current) {
        window.cancelAnimationFrame(scrollTimeoutRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, content]);

  // Sincronizar scroll cuando cambia el contenido (al escribir)
  useEffect(() => {
    if (!syncScroll || !editorRef.current || !previewRef.current) return;

    const editor = editorRef.current;
    const preview = previewRef.current;

    // Mantener la posición de scroll relativa después de cambios de contenido
    const editorScrollableHeight = editor.scrollHeight - editor.clientHeight;
    const scrollPercentage = editorScrollableHeight > 0 ? editor.scrollTop / editorScrollableHeight : 0;

    const previewScrollableHeight = preview.scrollHeight - preview.clientHeight;
    const targetScrollTop = scrollPercentage * previewScrollableHeight;

    // Si el usuario está escribiendo cerca del final, hacer scroll automático
    const isNearBottom = editor.scrollTop > editorScrollableHeight * 0.9;

    if (isNearBottom || scrollPercentage > 0.95) {
      // Scroll al final en ambos paneles
      requestAnimationFrame(() => {
        editor.scrollTop = editor.scrollHeight;
        preview.scrollTop = preview.scrollHeight;
      });
    } else {
      // Mantener posición relativa
      requestAnimationFrame(() => {
        preview.scrollTop = targetScrollTop;
      });
    }
  }, [content, syncScroll]);

  const handleEditorScroll = () => {
    if (!syncScroll || isScrollingRef.current || !editorRef.current || !previewRef.current) return;

    if (scrollTimeoutRef.current) {
      window.cancelAnimationFrame(scrollTimeoutRef.current);
    }

    isScrollingRef.current = true;
    const editor = editorRef.current;
    const preview = previewRef.current;

    // Calcular posición relativa más precisa
    const editorScrollableHeight = editor.scrollHeight - editor.clientHeight;
    const scrollPercentage = editorScrollableHeight > 0 ? editor.scrollTop / editorScrollableHeight : 0;

    const previewScrollableHeight = preview.scrollHeight - preview.clientHeight;
    const targetScrollTop = scrollPercentage * previewScrollableHeight;

    // Usar requestAnimationFrame para scroll suave
    scrollTimeoutRef.current = window.requestAnimationFrame(() => {
      if (preview) {
        preview.scrollTop = targetScrollTop;
      }
      isScrollingRef.current = false;
    });
  };

  const handlePreviewScroll = () => {
    if (!syncScroll || isScrollingRef.current || !editorRef.current || !previewRef.current) return;

    if (scrollTimeoutRef.current) {
      window.cancelAnimationFrame(scrollTimeoutRef.current);
    }

    isScrollingRef.current = true;
    const editor = editorRef.current;
    const preview = previewRef.current;

    // Calcular posición relativa más precisa
    const previewScrollableHeight = preview.scrollHeight - preview.clientHeight;
    const scrollPercentage = previewScrollableHeight > 0 ? preview.scrollTop / previewScrollableHeight : 0;

    const editorScrollableHeight = editor.scrollHeight - editor.clientHeight;
    const targetScrollTop = scrollPercentage * editorScrollableHeight;

    // Usar requestAnimationFrame para scroll suave
    scrollTimeoutRef.current = window.requestAnimationFrame(() => {
      if (editor) {
        editor.scrollTop = targetScrollTop;
      }
      isScrollingRef.current = false;
    });
  };

  const fetchPage = async () => {
    try {
      const response = await axios.get(`${API_URL}/wiki/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPage(response.data);
      setTitle(response.data.title);
      setContent(response.data.content);
    } catch (error) {
      console.error('Error fetching page:', error);
      toast.error('Error al cargar la página');
      navigate('/wiki');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('El título es requerido');
      return;
    }

    setSaving(true);
    try {
      await axios.put(
        `${API_URL}/wiki/${id}`,
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Cambios guardados');
      fetchPage();
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Error al guardar cambios');
    } finally {
      setSaving(false);
    }
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
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => navigate('/wiki')}
                className="p-3 rounded-apple bg-apple-orange-500 hover:bg-apple-orange-600 text-white transition-all shadow-apple"
                title="Volver"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              {page?.project && (
                <span className="inline-flex items-center gap-1 text-sm text-apple-gray-600 dark:text-apple-gray-400">
                  <FolderKanban className="w-4 h-4" />
                  {page.project.name}
                </span>
              )}
              {page?.task && (
                <span className="inline-flex items-center gap-1 text-sm text-apple-gray-600 dark:text-apple-gray-400">
                  <CheckSquare className="w-4 h-4" />
                  {page.task.title}
                </span>
              )}
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-3xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-apple-gray-900 dark:text-apple-gray-100 w-full"
              placeholder="Título del documento"
            />
          </div>
          <Button
            variant="primary"
            icon={<Save className="w-5 h-5" />}
            onClick={handleSave}
            disabled={saving}
            title={saving ? 'Guardando...' : 'Guardar'}
          />
        </div>

        <div className="mb-4 flex items-center justify-end">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-apple-gray-700 dark:text-apple-gray-300">
            <input
              type="checkbox"
              checked={syncScroll}
              onChange={(e) => setSyncScroll(e.target.checked)}
              className="rounded border-apple-gray-300 dark:border-dark-border text-apple-blue-500 focus:ring-apple-blue-500 focus:ring-offset-0"
            />
            {syncScroll ? (
              <>
                <Link2 className="w-4 h-4" />
                <span>Scroll sincronizado</span>
              </>
            ) : (
              <>
                <Unlink className="w-4 h-4" />
                <span>Scroll independiente</span>
              </>
            )}
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <Card className="lg:col-span-1">
            <CardBody>
              <div className="mb-2">
                <h3 className="text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300">
                  Editor Markdown
                </h3>
                <p className="text-xs text-apple-gray-500 dark:text-apple-gray-400">
                  Usa Ctrl+S o Cmd+S para guardar
                </p>
              </div>
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onScroll={handleEditorScroll}
                className="w-full h-[600px] p-4 font-mono text-sm bg-apple-gray-50 dark:bg-dark-hover border border-apple-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-apple-blue-500 focus:border-transparent resize-none text-apple-gray-900 dark:text-apple-gray-100 scrollbar-thin scrollbar-thumb-apple-gray-300 dark:scrollbar-thumb-dark-border scrollbar-track-transparent"
                placeholder="Escribe tu contenido en Markdown..."
              />
            </CardBody>
          </Card>

          {/* Preview */}
          <Card className="lg:col-span-1">
            <CardBody>
              <div className="mb-2">
                <h3 className="text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300">
                  Vista Previa
                </h3>
              </div>
              <div
                ref={previewRef}
                onScroll={handlePreviewScroll}
                className="h-[600px] overflow-y-auto p-4 bg-white dark:bg-dark-card rounded-lg border border-apple-gray-200 dark:border-dark-border scrollbar-thin scrollbar-thumb-apple-gray-300 dark:scrollbar-thumb-dark-border scrollbar-track-transparent"
              >
                <article className="prose prose-sm dark:prose-invert max-w-none
                  prose-headings:font-semibold
                  prose-h1:text-3xl prose-h1:mb-4
                  prose-h2:text-2xl prose-h2:mb-3
                  prose-h3:text-xl prose-h3:mb-2
                  prose-p:leading-7 prose-p:mb-4
                  prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                  prose-strong:font-semibold
                  prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
                  prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4
                  prose-li:mb-1
                  prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600 prose-blockquote:pl-4 prose-blockquote:italic
                  prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-gray-900 dark:prose-code:text-gray-100 prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:border-0 prose-pre:shadow-none
                  prose-img:rounded-lg prose-img:shadow-md
                  prose-hr:border-gray-300 dark:prose-hr:border-gray-700
                  prose-table:border-collapse prose-table:w-full
                  prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-700 prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:p-2
                  prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700 prose-td:p-2
                ">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content || '*Escribe algo para ver la vista previa...*'}
                  </ReactMarkdown>
                </article>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default WikiEditor;
