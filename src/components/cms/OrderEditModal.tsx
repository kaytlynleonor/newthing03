import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { DocumentData } from 'firebase/firestore';

export interface OrderEditPayload {
  status: string;
  trackingNumber: string;
  shippingAddress?: {
    fullName?: string;
    addressLine?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
}

interface Props {
  order: DocumentData | null;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: OrderEditPayload) => void;
}

export const OrderEditModal: React.FC<Props> = ({ order, saving, onClose, onSave }) => {
  const [status, setStatus]               = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [fullName, setFullName]           = useState('');
  const [addressLine, setAddressLine]     = useState('');
  const [city, setCity]                   = useState('');
  const [postalCode, setPostalCode]       = useState('');
  const [country, setCountry]             = useState('');

  useEffect(() => {
    if (order) {
      setStatus(order.status ?? '');
      setTrackingNumber(order.trackingNumber ?? '');
      setFullName(order.shippingAddress?.fullName ?? '');
      setAddressLine(order.shippingAddress?.addressLine ?? '');
      setCity(order.shippingAddress?.city ?? '');
      setPostalCode(order.shippingAddress?.postalCode ?? '');
      setCountry(order.shippingAddress?.country ?? '');
    }
  }, [order]);

  if (!order) return null;

  const inp = 'w-full bg-[#F5F1EB] border border-[#EEE8DF] p-2.5 text-xs text-[#11100E] focus:outline-none focus:border-[#11100E]';
  const lbl = 'block text-[10px] text-[#A99684] uppercase tracking-[0.2em] mb-1';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      status,
      trackingNumber,
      shippingAddress: { fullName, addressLine, city, postalCode, country },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEE8DF]">
          <h3 className="font-serif text-sm uppercase tracking-[0.2em]">Edit Order</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#A99684] hover:text-[#11100E] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-[10px] text-[#A99684] uppercase tracking-wider">Order {order.id}</p>

          {/* Status */}
          <div>
            <label className={lbl}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className={inp}>
              {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Tracking */}
          <div>
            <label className={lbl}>Tracking Number</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={e => setTrackingNumber(e.target.value)}
              className={inp}
            />
          </div>

          {/* Shipping Address */}
          <div className="space-y-2">
            <p className={lbl + ' mb-2'}>Shipping Address</p>
            {[
              { label: 'Full Name',    val: fullName,    set: setFullName },
              { label: 'Address Line', val: addressLine, set: setAddressLine },
              { label: 'City',         val: city,        set: setCity },
              { label: 'Postal Code',  val: postalCode,  set: setPostalCode },
              { label: 'Country',      val: country,     set: setCountry },
            ].map(f => (
              <div key={f.label}>
                <label className={lbl}>{f.label}</label>
                <input
                  type="text"
                  value={f.val}
                  onChange={e => f.set(e.target.value)}
                  className={inp}
                />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs uppercase tracking-wider border border-[#EEE8DF] text-[#A99684] hover:text-[#11100E] hover:border-[#11100E] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-xs uppercase tracking-wider bg-[#11100E] text-[#F5F1EB] hover:bg-[#A99684] transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 size={12} className="animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
