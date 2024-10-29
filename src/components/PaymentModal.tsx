import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, DollarSign } from 'lucide-react';
import { Order } from '../store/order';
import toast from 'react-hot-toast';

const paymentSchema = z.object({
  cashAmount: z.number().min(0),
  onlineAmount: z.number().min(0),
  customerPhone: z.string().min(10, 'Invalid phone number')
}).refine(data => data.cashAmount + data.onlineAmount > 0, {
  message: "Total payment amount must be greater than 0"
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onSubmit: (data: PaymentFormData) => Promise<void>;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, order, onSubmit }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cashAmount: 0,
      onlineAmount: 0,
      customerPhone: order.customerPhone || ''
    }
  });

  const cashAmount = watch('cashAmount');
  const onlineAmount = watch('onlineAmount');
  const remaining = order.total - (cashAmount + onlineAmount);

  const handleFormSubmit = async (data: PaymentFormData) => {
    if (remaining !== 0) {
      toast.error('Total payment must equal order amount');
      return;
    }
    await onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Process Payment</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Amount
              </label>
              <div className="mt-1 text-2xl font-semibold text-gray-900">
                ${order.total.toFixed(2)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cash Amount
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign size={16} className="text-gray-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  {...register('cashAmount', { valueAsNumber: true })}
                  className="block w-full pl-10 pr-4 py-2 border rounded-md"
                />
              </div>
              {errors.cashAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.cashAmount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Online Amount
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign size={16} className="text-gray-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  {...register('onlineAmount', { valueAsNumber: true })}
                  className="block w-full pl-10 pr-4 py-2 border rounded-md"
                />
              </div>
              {errors.onlineAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.onlineAmount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Customer Phone (for online payment)
              </label>
              <input
                type="tel"
                {...register('customerPhone')}
                className="mt-1 block w-full px-3 py-2 border rounded-md"
              />
              {errors.customerPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.customerPhone.message}</p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Remaining Amount:</span>
                <span className={remaining === 0 ? 'text-green-600' : 'text-red-600'}>
                  ${remaining.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={remaining !== 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Process Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;