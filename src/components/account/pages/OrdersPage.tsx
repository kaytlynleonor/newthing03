import React from 'react';
import { useStore } from '../../../context/StoreContext';
import { AuthLayout } from './AuthLayout';

export const OrdersPage: React.FC = () => {
  const { orders, formatPrice, setActiveView, setSelectedOrder } = useStore();

  return (
    <AuthLayout title="Your Orders">
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-[#A99684] uppercase">No orders placed yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-[#EEE8DF] p-4 bg-white">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-serif text-lg uppercase">Order {order.id}</h3>
                <span className="text-sm text-[#A99684]">{order.date}</span>
              </div>
              <p className="text-xs text-[#11100E] mb-1">Status: {order.status}</p>
              <p className="text-xs text-[#11100E] mb-1">Total: {formatPrice(order.totalAmount)}</p>
              <p className="text-xs text-[#11100E] mb-1">Tracking: {order.trackingNumber}</p>
              <button
                onClick={() => {
                  setSelectedOrder(order);
                  setActiveView('order-detail');
                }}
                className="mt-2 text-xs text-[#11100E] underline"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </AuthLayout>
  );
};

