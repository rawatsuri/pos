import React, { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';

interface Order {
  id: string;
  table: string;
  items: number;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  time: string;
}

const Orders = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  
  const orders: Order[] = [
    { id: 'ORD001', table: 'Table 1', items: 3, total: 45.80, status: 'pending', time: '5 mins ago' },
    { id: 'ORD002', table: 'Table 4', items: 2, total: 32.50, status: 'preparing', time: '12 mins ago' },
    { id: 'ORD003', table: 'Table 2', items: 4, total: 78.90, status: 'ready', time: '18 mins ago' },
    { id: 'ORD004', table: 'Table 6', items: 1, total: 15.99, status: 'completed', time: '25 mins ago' },
  ];

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return colors[status];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={20} className="mr-2" />
          New Order
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter size={20} className="mr-2 text-gray-500" />
          Filters
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-4 px-1 ${
              activeTab === 'active'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500'
            }`}
          >
            Active Orders
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-4 px-1 ${
              activeTab === 'completed'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500'
            }`}
          >
            Completed Orders
          </button>
        </nav>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-6 gap-4 p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="font-medium text-gray-500">Order ID</div>
          <div className="font-medium text-gray-500">Table</div>
          <div className="font-medium text-gray-500">Items</div>
          <div className="font-medium text-gray-500">Total</div>
          <div className="font-medium text-gray-500">Status</div>
          <div className="font-medium text-gray-500">Time</div>
        </div>
        {orders.map((order) => (
          <div key={order.id} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50">
            <div className="font-medium">{order.id}</div>
            <div>{order.table}</div>
            <div>{order.items} items</div>
            <div>${order.total.toFixed(2)}</div>
            <div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div className="text-gray-500">{order.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;