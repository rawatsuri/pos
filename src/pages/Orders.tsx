import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  Loader2,
  AlertCircle,
  UtensilsCrossed,
  ChefHat,
  CheckCircle2,
  XCircle,
  WifiOff
} from 'lucide-react';
import { useOrderStore } from '../store/order';
import { networkService } from '../services/network';
import OrderCard from '../components/OrderCard';
import NewOrderModal from '../components/NewOrderModal';
import PageHeader from '../components/PageHeader';

const Orders = () => {
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const { orders, fetchOrders, isLoading, error } = useOrderStore();
  const [isOnline, setIsOnline] = React.useState(networkService.isOnline());

  useEffect(() => {
    fetchOrders();
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    networkService.addListener('online', handleOnline);
    networkService.addListener('offline', handleOffline);
    
    return () => {
      networkService.removeListener('online', handleOnline);
      networkService.removeListener('offline', handleOffline);
    };
  }, [fetchOrders]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'preparing':
        return <ChefHat className="w-5 h-5 text-blue-500" />;
      case 'ready':
        return <UtensilsCrossed className="w-5 h-5 text-green-500" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === 'active' 
      ? ['pending', 'preparing', 'ready'].includes(order.status)
      : ['completed', 'cancelled'].includes(order.status);
      
    const matchesSearch = order.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Orders" 
        buttonLabel="New Order"
        onButtonClick={() => setIsNewOrderModalOpen(true)}
      />

      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
          <WifiOff className="text-yellow-500 mr-2" />
          <span className="text-yellow-700">
            You're offline. Orders will sync when you're back online.
          </span>
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search orders by table or items..."
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

      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-4 px-1 flex items-center ${
              activeTab === 'active'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500'
            }`}
          >
            <ChefHat className="mr-2 h-5 w-5" />
            Active Orders
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-4 px-1 flex items-center ${
              activeTab === 'completed'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500'
            }`}
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Completed Orders
          </button>
        </nav>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <AlertCircle className="w-12 h-12 mb-4 text-gray-400" />
          <p>Failed to load orders. Using offline data.</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <UtensilsCrossed className="w-12 h-12 mb-4 text-gray-400" />
          <p>No orders found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              statusIcon={getStatusIcon(order.status)}
            />
          ))}
        </div>
      )}

      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
      />
    </div>
  );
};

export default Orders;