import React, { useState } from 'react';
import { Search, Filter, Plus, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  lastOrder: Date;
}

const Customers = () => {
  const customers: Customer[] = [
    {
      id: 'CUS001',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 234-567-8901',
      orders: 12,
      totalSpent: 458.90,
      lastOrder: new Date(2024, 2, 15),
    },
    {
      id: 'CUS002',
      name: 'Emma Wilson',
      email: 'emma.w@email.com',
      phone: '+1 234-567-8902',
      orders: 8,
      totalSpent: 325.50,
      lastOrder: new Date(2024, 2, 14),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={20} className="mr-2" />
          Add Customer
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter size={20} className="mr-2 text-gray-500" />
          Filters
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-7 gap-4 p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="font-medium text-gray-500">Customer</div>
          <div className="font-medium text-gray-500">Contact</div>
          <div className="font-medium text-gray-500 col-span-2">Email</div>
          <div className="font-medium text-gray-500">Orders</div>
          <div className="font-medium text-gray-500">Total Spent</div>
          <div className="font-medium text-gray-500">Last Order</div>
        </div>
        {customers.map((customer) => (
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
            <div className="text-gray-500">{format(customer.lastOrder, 'MMM d, yyyy')}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customers;