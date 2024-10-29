import { create } from 'zustand';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '../api';
import { toast } from 'react-hot-toast';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  orders: number;
  totalSpent: number;
  lastOrder: Date;
  loyaltyPoints: number;
}

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
  customers: [],
  isLoading: false,
  error: null,

  fetchCustomers: async () => {
    try {
      set({ isLoading: true });
      const { data } = await getCustomers();
      set({ customers: data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch customers', isLoading: false });
      toast.error('Failed to fetch customers');
    }
  },

  addCustomer: async (customerData) => {
    try {
      set({ isLoading: true });
      const { data } = await addCustomer(customerData);
      set((state) => ({
        customers: [...state.customers, data],
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
      const { data } = await updateCustomer(id, customerData);
      set((state) => ({
        customers: state.customers.map((customer) =>
          customer.id === id ? { ...customer, ...data } : customer
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
      await deleteCustomer(id);
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