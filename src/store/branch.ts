import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import { socketService } from '../services/socket';

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

export const useBranchStore = create<BranchState>()(
  persist(
    (set, get) => ({
      branches: [
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
      ],
      selectedBranch: null,
      isLoading: false,
      error: null,

      fetchBranches: async () => {
        try {
          set({ isLoading: true });
          const response = await fetch('/api/branches');
          const data = await response.json();
          set({ 
            branches: data,
            selectedBranch: data[0],
            isLoading: false 
          });
        } catch (error) {
          console.error('Failed to fetch branches:', error);
          // Use demo data if API fails
          const { branches } = get();
          set({ 
            selectedBranch: branches[0],
            isLoading: false 
          });
        }
      },

      selectBranch: (branchId: string) => {
        const branch = get().branches.find(b => b.id === branchId);
        if (branch) {
          set({ selectedBranch: branch });
          socketService.joinBranch(branchId);
          toast.success(`Switched to ${branch.name}`);
        }
      },

      addBranch: async (branchData) => {
        try {
          set({ isLoading: true });
          const response = await fetch('/api/branches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(branchData)
          });
          const newBranch = await response.json();
          
          set((state) => ({
            branches: [...state.branches, newBranch],
            isLoading: false
          }));
          toast.success('Branch added successfully');
        } catch (error) {
          set({ error: 'Failed to add branch', isLoading: false });
          toast.error('Failed to add branch');
        }
      },

      updateBranch: async (id, branchData) => {
        try {
          set({ isLoading: true });
          const response = await fetch(`/api/branches/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(branchData)
          });
          const updatedBranch = await response.json();

          set((state) => ({
            branches: state.branches.map((branch) =>
              branch.id === id ? { ...branch, ...updatedBranch } : branch
            ),
            isLoading: false
          }));
          toast.success('Branch updated successfully');
        } catch (error) {
          set({ error: 'Failed to update branch', isLoading: false });
          toast.error('Failed to update branch');
        }
      }
    }),
    {
      name: 'branch-storage',
      partialize: (state) => ({ selectedBranch: state.selectedBranch })
    }
  )
);