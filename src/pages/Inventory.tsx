import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, AlertTriangle } from 'lucide-react';
import { useInventoryStore } from '../store/inventory';
import NewProductModal from '../components/NewProductModal';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';

const Inventory = () => {
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { products, fetchProducts, isLoading } = useInventoryStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categories = ['All', 'Vegetables', 'Meat', 'Dairy', 'Pantry'];

  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === 'all' || product.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const lowStockProducts = products.filter(product => product.stock <= product.minStock);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Inventory Management" 
        buttonLabel="Add Item"
        onButtonClick={() => setIsNewProductModalOpen(true)}
      />

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search inventory..."
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

      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="text-yellow-500 mr-2" size={20} />
            <span className="text-yellow-700">
              {lowStockProducts.length} items are running low on stock
            </span>
          </div>
        </div>
      )}

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
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading inventory...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No items found</div>
        ) : (
          filteredProducts.map((item) => (
            <div key={item.id} className="grid grid-cols-7 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50">
              <div className="font-medium">{item.name}</div>
              <div>{item.category}</div>
              <div>{item.stock}</div>
              <div>{item.unit}</div>
              <div>{item.minStock}</div>
              <div>
                <StatusBadge
                  status={item.stock <= item.minStock ? 'Low Stock' : 'In Stock'}
                  variant={item.stock <= item.minStock ? 'error' : 'success'}
                />
              </div>
              <div className="text-gray-500">
                {new Date(item.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
      />
    </div>
  );
};

export default Inventory;