import { create } from 'zustand';

interface Task {
  id?: number;
  title: string;
  description: string;
  status: string;
  workDate: string;
  startTime: string;
  endTime: string;
  projectId?: number;
}

interface TaskModalState {
  isOpen: boolean;
  task: Task | null;
  refreshCallback: (() => void) | null;
  openModal: (task: Task | null) => void;
  closeModal: () => void;
  setRefreshCallback: (callback: () => void) => void;
  refreshTasks: () => void;
}

export const useTaskModalStore = create<TaskModalState>((set, get) => ({
  isOpen: false,
  task: null,
  refreshCallback: null,
  openModal: (task) => set({ isOpen: true, task }),
  closeModal: () => set({ isOpen: false, task: null }),
  setRefreshCallback: (callback) => set({ refreshCallback: callback }),
  refreshTasks: () => {
    const { refreshCallback, closeModal } = get();
    if (refreshCallback) {
      refreshCallback();
    }
    closeModal();
  },
}));
