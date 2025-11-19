import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button, Card, CardBody, Textarea, Input } from '../../components/ui';
import PageTransition from '../../components/animations/PageTransition';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const WikiEditor = () => {
  const [title, setTitle] = useState('Nueva Página');
  const [content, setContent] = useState('# Título\n\nEscribe tu contenido aquí...');
  const [isPreview, setIsPreview] = useState(false);

  return (
    <PageTransition>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-semibold max-w-xl"
          placeholder="Título del documento"
        />
        <div className="flex gap-3">
          <Button
            variant={isPreview ? 'secondary' : 'ghost'}
            onClick={() => setIsPreview(!isPreview)}
          >
            {isPreview ? 'Editar' : 'Vista Previa'}
          </Button>
          <Button variant="primary" icon={<Save className="w-5 h-5" />}>
            Guardar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        {!isPreview && (
          <Card className="lg:col-span-1">
            <CardBody>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                placeholder="Escribe tu contenido en Markdown..."
                className="font-mono text-sm"
              />
            </CardBody>
          </Card>
        )}

        {/* Preview */}
        <Card className={isPreview ? 'lg:col-span-2' : 'lg:col-span-1'}>
          <CardBody className="prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </CardBody>
        </Card>
      </div>
    </div>
    </PageTransition>
  );
};

export default WikiEditor;
