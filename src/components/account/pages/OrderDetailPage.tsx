import React from 'react';
import { useStore } from '../../../context/StoreContext';
import { AuthLayout } from './AuthLayout';
import { X, Truck, Package, CreditCard, MapPin, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { selectedOrder, formatPrice, setActiveView, setSelectedOrder } = useStore();

  if (!selectedOrder) {
    return (
      <AuthLayout title="Order Details">
        <div className="text-center py-12">
          <p className="text-sm text-[#A99684] uppercase">No order selected.</p>
          <button
            onClick={() => setActiveView('orders')}
            className="mt-4 text-xs underline text-[#11100E]"
          >
            Back to Orders
          </button>
        </div>
      </AuthLayout>
    );
  }

  const order = selectedOrder;
  const statusIcons = {
    Processing: <Clock size={16} className="text-[#A99684]" />,
    Shipped: <Truck size={16} className="text-[#A99684]" />,
    Delivered: <CheckCircle size={16} className="text-[#22C55E]" />,
  };

  const statusColors = {
    Processing: 'text-[#A99684]',
    Shipped: 'text-[#11100E]',
    Delivered: 'text-[#22C55E]',
  };

  return (
    <AuthLayout title={`Order ${order.id}`}>
      <div className="space-y-8">
        {/* Status Header */}
        <div className="bg-white border border-[#EEE8DF] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-xl uppercase">Order Status</h3>
            <button
              onClick={() => {
                setSelectedOrder(null);
                setActiveView('orders');
              }}
              className="text-xs text-[#A99684] underline"
            >
              Back to Orders
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`${statusColors[order.status] || 'text-[#11100E]'}`}>
              {statusIcons[order.status as keyof typeof statusIcons] || <AlertCircle size={16} />}
              <span className="font-medium uppercase tracking-wider">{order.status}</span>
            </div>
            <span className="text-xs text-[#A99684]">Placed on {order.date}</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-center">
            <div className="p-5 bg-[#F5F1EB] space-y-1">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#A99684]">Order ID</p>
              <p className="font-serif text-base font-medium">{order.id}</p>
            </div>
            <div className="p-5 bg-[#F5F1EB] space-y-1">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#A99684]">Tracking</p>
              <p className="font-serif text-base font-medium break-all">{order.trackingNumber}</p>
            </div>
            <div className="p-5 bg-[#F5F1EB] space-y-1">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#A99684]">Payment</p>
              <p className="font-serif text-sm leading-snug">{order.paymentMethod}</p>
            </div>
            <div className="p-5 bg-[#F5F1EB] space-y-1">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#A99684]">Total</p>
              <p className="font-serif text-2xl font-semibold">{formatPrice(order.totalAmount)}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white border border-[#EEE8DF] p-6">
          <h3 className="font-serif text-xl uppercase mb-4">Order Items</h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center gap-4 border-b pb-4 last:border-0">
                <img 
                  src={item.image} 
                  alt={item.productName} 
                  className="w-20 h-20 object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-serif text-sm uppercase">{item.productName}</h4>
                  <p className="text-xs text-[#A99684]">{item.variantName} &bull; Size: {item.size}</p>
                  <p className="text-xs text-[#11100E]">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white border border-[#EEE8DF] p-6">
          <h3 className="font-serif text-xl uppercase mb-4 flex items-center gap-2">
            <MapPin size={20} /> Shipping Address
          </h3>
          <address className="not-italic text-sm leading-relaxed">
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.addressLine}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
            <p>{order.shippingAddress.country}</p>
          </address>
        </div>

        {/* Timeline */}
        <div className="bg-white border border-[#EEE8DF] p-6">
          <h3 className="font-serif text-xl uppercase mb-4">Order Timeline</h3>
          <div className="space-y-6 border-l border-[#EEE8DF] pl-6">
            <div className="relative">
              <div className="absolute left-[-6px] top-0 w-2 h-2 bg-[#11100E] rounded-full" />
              <div className="pb-2">
                <p className="text-xs text-[#A99684] uppercase mb-1">Order Placed</p>
                <p className="text-sm">{order.date}</p>
              </div>
            </div>
            {(order.status === 'Shipped' || order.status === 'Delivered') && (
              <div className="relative">
                <div className="absolute left-[-6px] top-0 w-2 h-2 bg-[#A99684] rounded-full" />
                <div className="pb-2">
                  <p className="text-xs text-[#A99684] uppercase mb-1">Order Shipped</p>
                  <p className="text-sm">Your order has been dispatched</p>
                </div>
              </div>
            )}
            {order.status === 'Delivered' && (
              <div className="relative">
                <div className="absolute left-[-6px] top-0 w-2 h-2 bg-[#22C55E] rounded-full" />
                <div>
                  <p className="text-xs text-[#A99684] uppercase mb-1">Delivered</p>
                  <p className="text-sm">Order delivered successfully</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};