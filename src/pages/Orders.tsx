import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { useOrderStore } from '../store/order';
import OrderCard from '../components/OrderCard';
import NewOrderModal from '../components/NewOrderModal';
import PageHeader from '../components/PageHeader';

const Orders = () => {
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const { orders, fetchOrders, setActiveOrder } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'active') {
      return ['pending', 'preparing', 'ready'].includes(order.status);
    }
    return ['completed', 'cancelled'].includes(order.status);
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Orders" 
        buttonLabel="New Order"
        onButtonClick={() => setIsNewOrderModalOpen(true)}
      />

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onClick={() => setActiveOrder(order)}
          />
        ))}
      </div>

      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
      />
    </div>
  );
};

export default Orders;