import create from 'zustand';

interface Store {
  selectedBranch: string;
  branches: string[];
  setBranch: (branch: string) => void;
}

export const useStore = create<Store>((set) => ({
  selectedBranch: 'Main Branch',
  branches: ['Main Branch', 'Downtown', 'Airport'],
  setBranch: (branch) => set({ selectedBranch: branch }),
}));