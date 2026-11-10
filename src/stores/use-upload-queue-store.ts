import { create } from 'zustand';
import type { TranscriptPreviewDTO } from '@/types/domain.types';

export interface UploadQueueItem {
  id: string;
  file: File;
  status: 'PENDING' | 'PARSING' | 'SUCCESS' | 'ERROR';
  errorMessage?: string;
}

interface UploadQueueState {
  queue: UploadQueueItem[];
  previews: TranscriptPreviewDTO[];
  isSaving: boolean;
  addToQueue: (files: File[]) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  updateQueueItemStatus: (
    id: string,
    status: UploadQueueItem['status'],
    error?: string
  ) => void;
  setPreviews: (previews: TranscriptPreviewDTO[]) => void;
  updatePreviewStudent: (index: number, studentId: string) => void;
  clearPreviews: () => void;
  setIsSaving: (saving: boolean) => void;
}

export const useUploadQueueStore = create<UploadQueueState>((set) => ({
  queue: [],
  previews: [],
  isSaving: false,
  addToQueue: (files) =>
    set((state) => ({
      queue: [
        ...state.queue,
        ...files.map((file) => ({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          status: 'PENDING' as const,
        })),
      ],
    })),
  removeFromQueue: (id) =>
    set((state) => ({
      queue: state.queue.filter((item) => item.id !== id),
    })),
  clearQueue: () => set({ queue: [] }),
  updateQueueItemStatus: (id, status, errorMessage) =>
    set((state) => ({
      queue: state.queue.map((item) =>
        item.id === id ? { ...item, status, errorMessage } : item
      ),
    })),
  setPreviews: (previews) => set({ previews }),
  updatePreviewStudent: (index, studentId) =>
    set((state) => {
      const updated = [...state.previews];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          matchedStudentId: studentId,
          parseStatus: 'READY',
        };
      }
      return { previews: updated };
    }),
  clearPreviews: () => set({ previews: [] }),
  setIsSaving: (isSaving) => set({ isSaving }),
}));
