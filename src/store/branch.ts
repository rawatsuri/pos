import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

interface BranchState {
  branches: Branch[];
  selectedBranch: Branch | null;
  isLoading: boolean;
  error: string | null;
  fetchBranches: () => Promise<void>;
  selectBranch: (branchId: string) => void;
  addBranch: (branch: Omit<Branch, 'id'>) => Promise<void>;
  updateBranch: (id: string, data: Partial<Branch>) => Promise<void>;
}

// Demo data
const demoBranches: Branch[] = [
  {
    id: 'branch-1',
    name: 'Main Branch',
    address: '123 Main St, City',
    phone: '+1 234-567-8900',
    isActive: true
  },
  {
    id: 'branch-2',
    name: 'Downtown',
    address: '456 Downtown Ave, City',
    phone: '+1 234-567-8901',
    isActive: true
  },
  {
    id: 'branch-3',
    name: 'Airport',
    address: '789 Airport Rd, City',
    phone: '+1 234-567-8902',
    isActive: true
  }
];

export const useBranchStore = create<BranchState>()(
  persist(
    (set, get) => ({
      branches: demoBranches,
      selectedBranch: demoBranches[0],
      isLoading: false,
      error: null,

      fetchBranches: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch('/api/branches');
          
          if (!response.ok) {
            throw new Error('Failed to fetch branches');
          }
          
          const data = await response.json();
          set({ 
            branches: data,
            selectedBranch: data[0] || demoBranches[0],
            isLoading: false 
          });
        } catch (error) {
          console.info('Using demo branches data');
          // Use demo data if API fails
          const { selectedBranch } = get();
          set({ 
            branches: demoBranches,
            selectedBranch: selectedBranch || demoBranches[0],
            isLoading: false,
            error: null // Don't show error when falling back to demo data
          });
        }
      },

      selectBranch: (branchId: string) => {
        const branch = get().branches.find(b => b.id === branchId);
        if (branch) {
          set({ selectedBranch: branch });
          // Only attempt WebSocket if it's available
          try {
            const socket = (window as any).socketService;
            if (socket?.connected) {
              socket.joinBranch(branchId);
              toast.success(`Switched to ${branch.name}`);
            } else {
              toast.success(`Switched to ${branch.name} (Offline Mode)`);
            }
          } catch (error) {
            toast.success(`Switched to ${branch.name} (Offline Mode)`);
          }
        }
      },

      addBranch: async (branchData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch('/api/branches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(branchData)
          });
          
          if (!response.ok) {
            throw new Error('Failed to add branch');
          }
          
          const newBranch = await response.json();
          set((state) => ({
            branches: [...state.branches, newBranch],
            isLoading: false
          }));
          toast.success('Branch added successfully');
        } catch (error) {
          // Fallback to demo mode
          const newBranch: Branch = {
            ...branchData,
            id: `branch-${Date.now()}`,
            isActive: true
          };
          set((state) => ({
            branches: [...state.branches, newBranch],
            isLoading: false,
            error: null
          }));
          toast.success('Branch added successfully (Demo Mode)');
        }
      },

      updateBranch: async (id, branchData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`/api/branches/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(branchData)
          });
          
          if (!response.ok) {
            throw new Error('Failed to update branch');
          }
          
          const updatedBranch = await response.json();
          set((state) => ({
            branches: state.branches.map((branch) =>
              branch.id === id ? { ...branch, ...updatedBranch } : branch
            ),
            selectedBranch: state.selectedBranch?.id === id ? 
              { ...state.selectedBranch, ...updatedBranch } : 
              state.selectedBranch,
            isLoading: false
          }));
          toast.success('Branch updated successfully');
        } catch (error) {
          // Fallback to demo mode
          set((state) => ({
            branches: state.branches.map((branch) =>
              branch.id === id ? { ...branch, ...branchData } : branch
            ),
            selectedBranch: state.selectedBranch?.id === id ?
              { ...state.selectedBranch, ...branchData } :
              state.selectedBranch,
            isLoading: false,
            error: null
          }));
          toast.success('Branch updated successfully (Demo Mode)');
        }
      }
    }),
    {
      name: 'branch-storage',
      partialize: (state) => ({ 
        selectedBranch: state.selectedBranch,
        branches: state.branches 
      })
    }
  )
);