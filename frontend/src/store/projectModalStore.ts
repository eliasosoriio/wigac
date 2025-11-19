import { create } from 'zustand';

interface Project {
  id?: number;
  name: string;
  description: string;
  status: string;
}

interface ProjectModalState {
  isOpen: boolean;
  project: Project | null;
  refreshCallback: (() => void) | null;
  openModal: (project: Project | null) => void;
  closeModal: () => void;
  setRefreshCallback: (callback: () => void) => void;
  refreshProjects: () => void;
}

export const useProjectModalStore = create<ProjectModalState>((set, get) => ({
  isOpen: false,
  project: null,
  refreshCallback: null,
  openModal: (project) => set({ isOpen: true, project }),
  closeModal: () => set({ isOpen: false, project: null }),
  setRefreshCallback: (callback) => set({ refreshCallback: callback }),
  refreshProjects: () => {
    const { refreshCallback, closeModal } = get();
    if (refreshCallback) {
      refreshCallback();
    }
    closeModal();
  },
}));
