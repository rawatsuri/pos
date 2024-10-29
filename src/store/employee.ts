import { create } from 'zustand';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee, getEmployeeStats } from '../api';
import { toast } from 'react-hot-toast';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'manager' | 'staff';
  status: 'active' | 'inactive';
  joinDate: string;
  schedule?: {
    [key: string]: { start: string; end: string };
  };
}

interface EmployeeStats {
  totalOrders: number;
  totalSales: number;
  averageOrderValue: number;
}

interface EmployeeState {
  employees: Employee[];
  employeeStats: Record<string, EmployeeStats>;
  isLoading: boolean;
  error: string | null;
  fetchEmployees: () => Promise<void>;
  addEmployee: (employeeData: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, employeeData: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  fetchEmployeeStats: (id: string) => Promise<void>;
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  employees: [],
  employeeStats: {},
  isLoading: false,
  error: null,

  fetchEmployees: async () => {
    try {
      set({ isLoading: true });
      const { data } = await getEmployees();
      set({ employees: data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch employees', isLoading: false });
      toast.error('Failed to fetch employees');
    }
  },

  addEmployee: async (employeeData) => {
    try {
      set({ isLoading: true });
      const { data } = await addEmployee(employeeData);
      set((state) => ({
        employees: [...state.employees, data],
        isLoading: false
      }));
      toast.success('Employee added successfully');
    } catch (error) {
      set({ error: 'Failed to add employee', isLoading: false });
      toast.error('Failed to add employee');
    }
  },

  updateEmployee: async (id, employeeData) => {
    try {
      set({ isLoading: true });
      const { data } = await updateEmployee(id, employeeData);
      set((state) => ({
        employees: state.employees.map((employee) =>
          employee.id === id ? { ...employee, ...data } : employee
        ),
        isLoading: false
      }));
      toast.success('Employee updated successfully');
    } catch (error) {
      set({ error: 'Failed to update employee', isLoading: false });
      toast.error('Failed to update employee');
    }
  },

  deleteEmployee: async (id) => {
    try {
      set({ isLoading: true });
      await deleteEmployee(id);
      set((state) => ({
        employees: state.employees.filter((employee) => employee.id !== id),
        isLoading: false
      }));
      toast.success('Employee deleted successfully');
    } catch (error) {
      set({ error: 'Failed to delete employee', isLoading: false });
      toast.error('Failed to delete employee');
    }
  },

  fetchEmployeeStats: async (id) => {
    try {
      const { data } = await getEmployeeStats(id);
      set((state) => ({
        employeeStats: {
          ...state.employeeStats,
          [id]: data
        }
      }));
    } catch (error) {
      toast.error('Failed to fetch employee stats');
    }
  }
}));