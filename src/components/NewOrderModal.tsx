import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Minus } from 'lucide-react';
import { useOrderStore } from '../store/order';
import { useInventoryStore } from '../store/inventory';

const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  name: z.string(),
  price: z.number()
});

const orderSchema = z.object({
  tableNumber: z.string().min(1, 'Table number is required'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose }) => {
  const { createNewOrder, isLoading } = useOrderStore();
  const { products } = useInventoryStore();
  
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      items: [{ productId: '', quantity: 1, name: '', price: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const onSubmit = async (data: OrderFormData) => {
    const total = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    await createNewOrder({
      ...data,
      total,
      status: 'pending'
    });
    onClose();
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setValue(`items.${index}.name`, product.name);
      setValue(`items.${index}.price`, product.price);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">New Order</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Table Number
              </label>
              <input
                type="text"
                {...register('tableNumber')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.tableNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.tableNumber.message}</p>
              )}
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <select
                      {...register(`items.${index}.productId`)}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select Product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ${product.price}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-32">
                    <input
                      type="number"
                      {...register(`items.${index}.quantity`)}
                      min="1"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}

              {errors.items && (
                <p className="text-sm text-red-600">{errors.items.message}</p>
              )}

              <button
                type="button"
                onClick={() => append({ productId: '', quantity: 1, name: '', price: 0 })}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                <Plus size={20} className="mr-1" />
                Add Item
              </button>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Create Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewOrderModal;