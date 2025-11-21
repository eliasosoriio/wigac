import { useState } from 'react';
import { Calendar, FolderKanban } from 'lucide-react';
import PageTransition from '../../components/animations/PageTransition';
import Diary from '../diary/Diary';
import Projects from '../projects/Projects';

type TabType = 'diary' | 'projects';

const TasksLayout = () => {
  const [activeTab, setActiveTab] = useState<TabType>('diary');

  const tabs = [
    { id: 'diary' as TabType, label: 'Registros', icon: Calendar },
    { id: 'projects' as TabType, label: 'Proyectos', icon: FolderKanban }
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-apple-gray-200 dark:border-dark-border">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all
                    ${
                      isActive
                        ? 'border-apple-blue-500 text-apple-blue-600 dark:text-apple-blue-400'
                        : 'border-transparent text-apple-gray-500 dark:text-apple-gray-400 hover:text-apple-gray-700 dark:hover:text-apple-gray-300 hover:border-apple-gray-300 dark:hover:border-apple-gray-600'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:text-apple-gray-700 dark:group-hover:text-apple-gray-300'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'diary' && <Diary />}
          {activeTab === 'projects' && <Projects />}
        </div>
      </div>
    </PageTransition>
  );
};

export default TasksLayout;
