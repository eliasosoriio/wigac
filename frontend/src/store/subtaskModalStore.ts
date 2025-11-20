import { create } from 'zustand';

interface Subtask {
  id: number;
  description: string;
  workDate: string;
  startTime: string;
  endTime: string;
  timeSpentMinutes: number;
  taskId?: number;
}

interface SubtaskModalStore {
  isOpen: boolean;
  subtask: Subtask | null;
  taskId: number | null;
  refreshCallback: (() => void) | null;

  openModal: (taskId: number, subtask?: Subtask | null) => void;
  closeModal: () => void;
  setRefreshCallback: (callback: () => void) => void;
  refreshSubtasks: () => void;
}

export const useSubtaskModalStore = create<SubtaskModalStore>((set, get) => ({
  isOpen: false,
  subtask: null,
  taskId: null,
  refreshCallback: null,

  openModal: (taskId, subtask = null) => {
    set({ isOpen: true, taskId, subtask });
  },

  closeModal: () => {
    set({ isOpen: false, subtask: null, taskId: null });
  },

  setRefreshCallback: (callback) => {
    set({ refreshCallback: callback });
  },

  refreshSubtasks: () => {
    const { refreshCallback, closeModal } = get();
    if (refreshCallback) {
      refreshCallback();
    }
    closeModal();
  },
}));
