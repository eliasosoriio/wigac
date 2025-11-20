import { useState, useRef, useEffect } from 'react';
import { FileDown, Copy, FileText, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '../ui';

interface ExportMenuProps {
  onExportDailyReport: (date: Date) => void;
  onCopyDailyReport: (date: Date) => void;
  onExportProgressReport: (date: Date) => void;
  onCopyProgressReport: (date: Date) => void;
}

export const ExportMenu = ({
  onExportDailyReport,
  onCopyDailyReport,
  onExportProgressReport,
  onCopyProgressReport,
}: ExportMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (action: (date: Date) => void) => {
    action(new Date(selectedDate));
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="secondary"
        icon={<FileDown className="w-5 h-5" />}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="hidden sm:inline">Exportar</span>
        <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-card border border-apple-gray-200 dark:border-dark-border rounded-xl shadow-lg z-50">
          <div className="p-4">
            {/* Date Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Seleccionar fecha
                </div>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-dark-bg border border-apple-gray-300 dark:border-dark-border rounded-lg text-apple-gray-900 dark:text-apple-gray-100 focus:outline-none focus:ring-2 focus:ring-apple-blue"
              />
            </div>

            <div className="border-t border-apple-gray-200 dark:border-dark-border pt-3 space-y-2">
              {/* Daily Report Options */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-apple-gray-500 dark:text-apple-gray-400 uppercase tracking-wide px-2">
                  Reporte Diario
                </p>
                <button
                  onClick={() => handleAction(onCopyDailyReport)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-apple-gray-700 dark:text-apple-gray-300 hover:bg-apple-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copiar al portapapeles</span>
                </button>
                <button
                  onClick={() => handleAction(onExportDailyReport)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-apple-gray-700 dark:text-apple-gray-300 hover:bg-apple-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Descargar archivo .txt</span>
                </button>
              </div>

              {/* Progress Report Options */}
              <div className="space-y-1 pt-2 border-t border-apple-gray-200 dark:border-dark-border">
                <p className="text-xs font-semibold text-apple-gray-500 dark:text-apple-gray-400 uppercase tracking-wide px-2">
                  Informe de Actualidad
                </p>
                <button
                  onClick={() => handleAction(onCopyProgressReport)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-apple-gray-700 dark:text-apple-gray-300 hover:bg-apple-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Copiar al portapapeles</span>
                </button>
                <button
                  onClick={() => handleAction(onExportProgressReport)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-apple-gray-700 dark:text-apple-gray-300 hover:bg-apple-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Descargar archivo .txt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
