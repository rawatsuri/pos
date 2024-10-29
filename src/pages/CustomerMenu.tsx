import React from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useInventoryStore } from '../store/inventory';
import { useOrderStore } from '../store/order';
import { useBranchStore } from '../store/branch';
import toast from 'react-hot-toast';

const CustomerMenu = () => {
  const { branchId, tableNumber } = useParams();
  const [cart, setCart] = React.useState<{ [key: string]: number }>({});
  const [customerPhone, setCustomerPhone] = React.useState('');
  const { products } = useInventoryStore();
  const { createNewOrder } = useOrderStore();
  const { branches } = useBranchStore();

  const branch = branches.find(b => b.id === branchId);
  const categories = [...new Set(products.map(p => p.category))];

  const handleQuantityChange = (productId: string, delta: number) => {
    setCart(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: next };
    });
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product?.price || 0) * quantity;
    }, 0);
  };

  const handleSubmitOrder = async (paymentMethod: 'cash' | 'online' | 'partial') => {
    if (!customerPhone) {
      toast.error('Please enter your phone number');
      return;
    }

    const orderItems = Object.entries(cart).map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId)!;
      return {
        productId,
        name: product.name,
        quantity,
        price: product.price
      };
    });

    const total = calculateTotal();

    try {
      await createNewOrder({
        items: orderItems,
        total,
        status: 'pending',
        tableNumber: tableNumber!,
        branchId: branchId!,
        customerPhone,
        paymentMethod,
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'processing'
      });

      toast.success('Order placed successfully!');
      setCart({});
      setCustomerPhone('');
    } catch (error) {
      toast.error('Failed to place order');
    }
  };

  if (!branch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Invalid branch or table</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">{branch.name}</h1>
          <p className="text-gray-600">Table {tableNumber}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-[2fr,1fr] gap-6">
          <div>
            {categories.map(category => (
              <div key={category} className="mb-8">
                <h2 className="text-xl font-semibold mb-4">{category}</h2>
                <div className="grid gap-4">
                  {products
                    .filter(p => p.category === category)
                    .map(product => (
                      <div key={product.id} className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm text-gray-500">{product.description}</p>
                            <p className="text-blue-600 font-medium mt-1">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <button
                              onClick={() => handleQuantityChange(product.id, -1)}
                              className="p-1 text-gray-500 hover:text-gray-700"
                              disabled={!cart[product.id]}
                            >
                              <Minus size={20} />
                            </button>
                            <span className="w-8 text-center">
                              {cart[product.id] || 0}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(product.id, 1)}
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              <Plus size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="sticky top-6 h-fit">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">Your Order</h2>
              {Object.keys(cart).length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Your cart is empty
                </p>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {Object.entries(cart).map(([productId, quantity]) => {
                      const product = products.find(p => p.id === productId)!;
                      return (
                        <div key={productId} className="flex justify-between">
                          <span>
                            {quantity}x {product.name}
                          </span>
                          <span>${(product.price * quantity).toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (for order updates)
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => handleSubmitOrder('online')}
                  disabled={Object.keys(cart).length === 0}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Pay Online
                </button>
                <button
                  onClick={() => handleSubmitOrder('cash')}
                  disabled={Object.keys(cart).length === 0}
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  Pay by Cash
                </button>
                <button
                  onClick={() => handleSubmitOrder('partial')}
                  disabled={Object.keys(cart).length === 0}
                  className="w-full py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                >
                  Split Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerMenu;