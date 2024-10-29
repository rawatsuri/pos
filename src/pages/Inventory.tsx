import React, { useState } from 'react';
import { Search, Filter, Plus, AlertTriangle } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  lastUpdated: string;
}

const Inventory = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const inventory: InventoryItem[] = [
    { id: 'INV001', name: 'Tomatoes', category: 'Vegetables', stock: 45, unit: 'kg', minStock: 20, lastUpdated: '2h ago' },
    { id: 'INV002', name: 'Chicken Breast', category: 'Meat', stock: 15, unit: 'kg', minStock: 20, lastUpdated: '1h ago' },
    { id: 'INV003', name: 'Olive Oil', category: 'Pantry', stock: 25, unit: 'L', minStock: 10, lastUpdated: '1d ago' },
    { id: 'INV004', name: 'Mozzarella', category: 'Dairy', stock: 30, unit: 'kg', minStock: 15, lastUpdated: '4h ago' },
  ];

  const categories = ['All', 'Vegetables', 'Meat', 'Dairy', 'Pantry'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={20} className="mr-2" />
          Add Item
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search inventory..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter size={20} className="mr-2 text-gray-500" />
          Filters
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category.toLowerCase())}
            className={`px-4 py-2 rounded-lg ${
              activeCategory === category.toLowerCase()
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Low Stock Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="text-yellow-500 mr-2" size={20} />
          <span className="text-yellow-700">3 items are running low on stock</span>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-7 gap-4 p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="font-medium text-gray-500">Item Name</div>
          <div className="font-medium text-gray-500">Category</div>
          <div className="font-medium text-gray-500">Stock</div>
          <div className="font-medium text-gray-500">Unit</div>
          <div className="font-medium text-gray-500">Min. Stock</div>
          <div className="font-medium text-gray-500">Status</div>
          <div className="font-medium text-gray-500">Last Updated</div>
        </div>
        {inventory.map((item) => (
          <div key={item.id} className="grid grid-cols-7 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50">
            <div className="font-medium">{item.name}</div>
            <div>{item.category}</div>
            <div>{item.stock}</div>
            <div>{item.unit}</div>
            <div>{item.minStock}</div>
            <div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.stock <= item.minStock
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {item.stock <= item.minStock ? 'Low Stock' : 'In Stock'}
              </span>
            </div>
            <div className="text-gray-500">{item.lastUpdated}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;