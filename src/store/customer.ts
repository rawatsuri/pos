import { create } from 'zustand';
import { toast } from 'react-hot-toast';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  orders: number;
  totalSpent: number;
  lastOrder: string;
  loyaltyPoints: number;
}

// Mock data for demo
const mockCustomers: Customer[] = [
  {
    id: 'c1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 234-567-8901',
    orders: 12,
    totalSpent: 458.90,
    lastOrder: new Date().toISOString(),
    loyaltyPoints: 120
  },
  {
    id: 'c2',
    name: 'Emma Wilson',
    email: 'emma.w@email.com',
    phone: '+1 234-567-8902',
    orders: 8,
    totalSpent: 325.50,
    lastOrder: new Date().toISOString(),
    loyaltyPoints: 80
  }
];

interface CustomerState {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  fetchCustomers: () => Promise<void>;
  addCustomer: (customerData: Omit<Customer, 'id' | 'orders' | 'totalSpent' | 'lastOrder'>) => Promise<void>;
  updateCustomer: (id: string, customerData: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: mockCustomers,
  isLoading: false,
  error: null,

  fetchCustomers: async () => {
    try {
      set({ isLoading: true });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ customers: mockCustomers, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch customers', isLoading: false });
      toast.error('Failed to fetch customers');
    }
  },

  addCustomer: async (customerData) => {
    try {
      set({ isLoading: true });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const newCustomer: Customer = {
        id: `c${Date.now()}`,
        ...customerData,
        orders: 0,
        totalSpent: 0,
        lastOrder: new Date().toISOString()
      };
      set((state) => ({
        customers: [...state.customers, newCustomer],
        isLoading: false
      }));
      toast.success('Customer added successfully');
    } catch (error) {
      set({ error: 'Failed to add customer', isLoading: false });
      toast.error('Failed to add customer');
    }
  },

  updateCustomer: async (id, customerData) => {
    try {
      set({ isLoading: true });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set((state) => ({
        customers: state.customers.map((customer) =>
          customer.id === id ? { ...customer, ...customerData } : customer
        ),
        isLoading: false
      }));
      toast.success('Customer updated successfully');
    } catch (error) {
      set({ error: 'Failed to update customer', isLoading: false });
      toast.error('Failed to update customer');
    }
  },

  deleteCustomer: async (id) => {
    try {
      set({ isLoading: true });
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set((state) => ({
        customers: state.customers.filter((customer) => customer.id !== id),
        isLoading: false
      }));
      toast.success('Customer deleted successfully');
    } catch (error) {
      set({ error: 'Failed to delete customer', isLoading: false });
      toast.error('Failed to delete customer');
    }
  }
}));