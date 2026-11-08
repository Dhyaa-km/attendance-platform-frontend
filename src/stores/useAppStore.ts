import { create } from 'zustand';
import { STORAGE_KEYS } from '../utils/constants.ts';

export type SystemStatus = 'OPERATIONAL' | 'DEGRADED' | 'STANDBY';

interface AppStore {
  systemStatus: SystemStatus;
  soundEnabled: boolean;
  cameraFacing: 'environment' | 'user';
  sidebarOpen: boolean;
  setSystemStatus: (status: SystemStatus) => void;
  toggleSound: () => void;
  setCameraFacing: (facing: 'environment' | 'user') => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  systemStatus: 'OPERATIONAL',
  soundEnabled: localStorage.getItem(STORAGE_KEYS.SCANNER_AUDIO) !== 'false',
  cameraFacing: (localStorage.getItem(STORAGE_KEYS.SCANNER_CAMERA_FACING) as 'environment' | 'user') || 'environment',
  sidebarOpen: false,

  setSystemStatus: (systemStatus) => set({ systemStatus }),
  toggleSound: () =>
    set((state) => {
      const next = !state.soundEnabled;
      localStorage.setItem(STORAGE_KEYS.SCANNER_AUDIO, String(next));
      return { soundEnabled: next };
    }),
  setCameraFacing: (cameraFacing) => {
    localStorage.setItem(STORAGE_KEYS.SCANNER_CAMERA_FACING, cameraFacing);
    set({ cameraFacing });
  },
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
