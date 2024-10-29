import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { useCustomerStore } from '../store/customer';
import NewCustomerModal from '../components/NewCustomerModal';
import PageHeader from '../components/PageHeader';

const Customers = () => {
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { customers, fetchCustomers, isLoading } = useCustomerStore();

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Customers" 
        buttonLabel="Add Customer"
        onButtonClick={() => setIsNewCustomerModalOpen(true)}
      />

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter size={20} className="mr-2 text-gray-500" />
          Filters
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-7 gap-4 p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="font-medium text-gray-500">Customer</div>
          <div className="font-medium text-gray-500">Contact</div>
          <div className="font-medium text-gray-500 col-span-2">Email</div>
          <div className="font-medium text-gray-500">Orders</div>
          <div className="font-medium text-gray-500">Total Spent</div>
          <div className="font-medium text-gray-500">Last Order</div>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No customers found</div>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="grid grid-cols-7 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50">
              <div className="font-medium">{customer.name}</div>
              <div className="flex items-center text-gray-500">
                <Phone size={16} className="mr-2" />
                {customer.phone}
              </div>
              <div className="flex items-center col-span-2 text-gray-500">
                <Mail size={16} className="mr-2" />
                {customer.email}
              </div>
              <div>{customer.orders} orders</div>
              <div>${customer.totalSpent.toFixed(2)}</div>
              <div className="text-gray-500">
                {format(new Date(customer.lastOrder), 'MMM d, yyyy')}
              </div>
            </div>
          ))
        )}
      </div>

      <NewCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
      />
    </div>
  );
};

export default Customers;