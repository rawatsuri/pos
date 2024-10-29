import React from 'react';
import { Clock, ChevronRight, DollarSign, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Order } from '../store/order';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  statusIcon?: React.ReactNode;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick, statusIcon }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    preparing: 'bg-blue-100 text-blue-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center">
            <Users size={16} className="text-gray-500 mr-2" />
            <h3 className="font-medium">Table {order.tableNumber}</h3>
          </div>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Clock size={14} className="mr-1" />
            {format(new Date(order.createdAt), 'HH:mm')}
          </div>
        </div>
        <div className="flex items-center">
          {statusIcon}
          <span className={`ml-2 px-2 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <div className="flex items-center">
              <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-xs mr-2">
                {item.quantity}
              </span>
              <span>{item.name}</span>
            </div>
            <span className="text-gray-600">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center font-medium">
          <DollarSign size={16} className="text-green-600 mr-1" />
          ${order.total.toFixed(2)}
        </div>
        <ChevronRight size={20} className="text-gray-400" />
      </div>
    </div>
  );
};

export default OrderCard;