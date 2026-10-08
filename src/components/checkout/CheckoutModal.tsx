import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { setAuthRedirect } from '../../lib/authRedirect';
import { navigateToTracking } from '../../lib/orderTracking';
import { Order } from '../../types/ecommerce';
import confetti from 'canvas-confetti';
import { Truck, CreditCard, ArrowLeft, CheckCircle, Lock, ShoppingBag, Loader2, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function scrollToCheckoutField(el: HTMLElement | null) {
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  window.setTimeout(() => {
    if ('focus' in el && typeof (el as HTMLInputElement).focus === 'function') {
      (el as HTMLInputElement).focus({ preventScroll: true });
    }
  }, 350);
}

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    clearCart,
    formatPrice,
    currency,
    addOrder,
    setActiveView,
    cmsConfig,
    openPolicy,
    showToast,
  } = useStore();

  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'COD'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [upiVerification, setUpiVerification] = useState<'idle' | 'valid' | 'invalid' | 'loading'>('idle');
  const [upiAccountName, setUpiAccountName] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [termsError, setTermsError] = useState('');

  const emailRef = useRef<HTMLInputElement>(null);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const addressLineRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const postalCodeRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLInputElement>(null);
  const upiInputRef = useRef<HTMLInputElement>(null);
  const termsCheckboxRef = useRef<HTMLInputElement>(null);

  const { user, profile, isAuthenticated, isLoading: authLoading } = useAuth();
  useEffect(() => {
    if (authLoading || isAuthenticated || cart.length === 0) return;
    setAuthRedirect('checkout');
    setActiveView('login');
  }, [authLoading, isAuthenticated, cart.length, setActiveView]);

  // Prefill from logged-in user profile
  useEffect(() => {
    if (profile) {
      if (profile.email) setEmail(profile.email);
      if (profile.displayName) setFullName(profile.displayName);
      if (profile.addresses?.[0]) {
        const addr = profile.addresses[0];
        setAddressLine(addr.addressLine || '');
        setCity(addr.city || '');
        setPostalCode(addr.postalCode || '');
        setCountry(addr.country || 'India');
        setPhone(addr.phone || '');
      }
    }
  }, [profile]);

  const shippingFee = cartSubtotal >= (cmsConfig.freeShippingThreshold || 5000) ? 0 : 500;
  const totalAmount = cartSubtotal + shippingFee;

  const handleSubmitDetails = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const requiredFields: { ref: React.RefObject<HTMLInputElement | null>; value: string; label: string }[] = [
      { ref: emailRef, value: email, label: 'email address' },
      { ref: fullNameRef, value: fullName, label: 'full name' },
      { ref: phoneRef, value: phone, label: 'phone number' },
      { ref: addressLineRef, value: addressLine, label: 'street address' },
      { ref: cityRef, value: city, label: 'city' },
      { ref: postalCodeRef, value: postalCode, label: 'pincode' },
      { ref: countryRef, value: country, label: 'country' },
    ];

    for (const field of requiredFields) {
      if (!field.value.trim()) {
        scrollToCheckoutField(field.ref.current);
        field.ref.current?.setCustomValidity(`Please enter your ${field.label}.`);
        form.reportValidity();
        field.ref.current?.setCustomValidity('');
        return;
      }
    }

    if (!form.checkValidity()) {
      const firstInvalid =
        form.querySelector<HTMLInputElement>('input:invalid') ?? requiredFields.find((f) => !f.value.trim())?.ref.current;
      scrollToCheckoutField(firstInvalid ?? null);
      form.reportValidity();
      return;
    }

    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openRazorpayCheckout = async () => {
    if (!window.Razorpay) {
      throw new Error('Razorpay Checkout did not load. Please refresh and try again.');
    }

    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!keyId) throw new Error('Razorpay key not configured.');

    await new Promise<void>((resolve, reject) => {
      const razorpay = new window.Razorpay({
        key: keyId,
        amount: Math.round(totalAmount * 100), // paise
        currency: 'INR',
        name: 'KAYTLYN LEONOR',
        description: `Order Checkout (${cart.length} ${cart.length === 1 ? 'item' : 'items'})`,
        image: '/Luxury%20Gold%20KL%20Monogram%20Logo.png',
        prefill: { name: fullName, email, contact: phone },
        notes: { address: `${addressLine}, ${city}, ${postalCode}, ${country}` },
        theme: { color: '#11100E' },
        modal: { ondismiss: () => resolve() },
        handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          finalizeOrder(response.razorpay_payment_id);
          resolve();
        }
      });

      razorpay.on('payment.failed', (response: { error?: { description?: string } }) => {
        reject(new Error(response.error?.description || 'Payment failed. Please try again.'));
      });
      razorpay.open();
    });
  };

  const handlePlaceOrder = async () => {
    if (!agreeTerms) {
      setTermsError('Please accept the terms and conditions to complete your order.');
      scrollToCheckoutField(termsCheckboxRef.current);
      return;
    }
    setTermsError('');

    if (paymentMethod === 'UPI') {
      if (!upiId.trim()) {
        setUpiVerification('invalid');
        scrollToCheckoutField(upiInputRef.current);
        return;
      }
      if (upiVerification === 'loading') return; // still verifying
      if (upiVerification !== 'valid') {
        setUpiVerification('invalid');
        scrollToCheckoutField(upiInputRef.current);
        return;
      }
    }

    if (paymentMethod === 'COD') {
      await finalizeOrder();
      return;
    }

    setIsPaymentLoading(true);
    setPaymentError('');
    try {
      await openRazorpayCheckout();
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Unable to start payment. Please try again.');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const verifyUpi = async () => {
    const trimmed = upiId.trim();
    const vpaPattern = /^[A-Za-z0-9._-]{2,256}@[A-Za-z0-9][A-Za-z0-9.-]{1,63}$/;
    if (!vpaPattern.test(trimmed)) {
      setUpiAccountName(null);
      setUpiVerification('invalid');
      return;
    }

    // Simulate async bank lookup
    setUpiVerification('loading');
    setUpiAccountName(null);

    await new Promise((res) => setTimeout(res, 1200));

    // Derive a display name from the handle (before @)
    const handle = trimmed.split('@')[0].replace(/[0-9._-]+/g, ' ').trim();
    const derivedName = handle
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ') || 'Account Holder';

    setUpiAccountName(derivedName);
    setUpiVerification('valid');
  };

  const finalizeOrder = async (paymentId?: string) => {
    const paymentLabel = paymentId
      ? `Razorpay ${paymentMethod} (Payment ID: ${paymentId})`
      : 'Cash on Delivery';

    const newOrder: Order = {
      id: `KL-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      items: cart.map((item) => ({
        productName: item.product.name,
        variantName: item.selectedVariant.name,
        size: item.selectedSize,
        quantity: item.quantity,
        price: item.product.price,
        image: item.product.images[0]
      })),
      totalAmount,
      currency,
      status: 'Processing',
      shippingAddress: {
        fullName,
        addressLine,
        city,
        postalCode,
        country
      },
      paymentMethod: paymentLabel,
      trackingNumber: `KL-IN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      customerEmail: email.trim().toLowerCase(),
    };

    // Track success of each operation
    let firestoreSaved = false;
    let emailsSent = false;
    let firestoreError: Error | null = null;
    let emailError: Error | null = null;

    // Save to Firestore (orders collection for admin panel)
    try {
      await addDoc(collection(db, 'orders'), {
        ...newOrder,
        customerEmail: email,
        customerPhone: phone,
        razorpayPaymentId: paymentId || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      firestoreSaved = true;
      console.log('Order saved to Firestore orders collection:', newOrder.id);
    } catch (err) {
      console.error('Failed to save order to Firestore:', err);
      firestoreError = err instanceof Error ? err : new Error('Unknown error');
    }

    // Also save to user's Firestore document if authenticated (for user portal)
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const existingOrders = userSnap.exists() && userSnap.data().orders ? userSnap.data().orders : [];
        await setDoc(userRef, {
          orders: [newOrder, ...existingOrders],
          updatedAt: serverTimestamp(),
        }, { merge: true });
        console.log('Order saved to user Firestore document');
      } catch (err) {
        console.error('Failed to save order to user Firestore:', err);
      }
    }

    // Send emails via Vercel API
    try {
      // In development, use the full URL if VITE_API_BASE_URL is set, otherwise use relative path
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const apiUrl = `${apiBaseUrl}/api/order-created`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newOrder, customerEmail: email, customerPhone: phone }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API returned ${response.status}`);
      }
      emailsSent = true;
      console.log('Order confirmation emails sent successfully');
    } catch (err) {
      console.error('Failed to send order emails:', err);
      emailError = err instanceof Error ? err : new Error('Unknown error');
    }

    // Add to local state (localStorage) - this always works
    addOrder(newOrder);
    setCreatedOrder(newOrder);
    clearCart();
    setStep('confirmation');

    // Show toast with status
    if (firestoreSaved && emailsSent) {
      showToast('Order confirmed! Confirmation email sent.', 'success');
    } else if (firestoreSaved && !emailsSent) {
      showToast('Order confirmed! Email notification failed - please check spam folder.', 'info');
    } else if (!firestoreSaved && emailsSent) {
      showToast('Order confirmed! Admin panel sync failed - contact support.', 'info');
    } else {
      showToast('Order saved locally. Please contact support - backend sync failed.', 'error');
    }

    // Trigger subtle celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#A99684', '#11100E', '#D8C8B7', '#F5F1EB']
    });
  };

  if (cart.length === 0 && step !== 'confirmation') {
    return (
      <div className="py-24 px-6 max-w-xl mx-auto text-center space-y-6">
        <ShoppingBag size={48} className="mx-auto text-[#A99684]" strokeWidth={1} />
        <h2 className="font-serif text-3xl tracking-[0.2em] uppercase">YOUR BAG IS EMPTY</h2>
        <p className="text-xs font-sans text-[#A99684] tracking-wider">
          Please add items to your shopping bag before proceeding to checkout.
        </p>
        <button
          onClick={() => setActiveView('shop')}
          className="bg-[#11100E] text-[#F5F1EB] text-xs uppercase tracking-[0.25em] px-8 py-3 hover:bg-[#A99684] transition-colors"
        >
          EXPLORE SHOP
        </button>
      </div>
    );
  }

  const paymentOptionClass = (selected: boolean) =>
    `flex cursor-pointer flex-col gap-2 border p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4 transition-all ${
      selected ? 'border-[#11100E] bg-[#F5F1EB]' : 'border-[#EEE8DF]'
    }`;

  return (
    <div className="min-h-screen bg-[#F5F1EB] px-3 py-6 pb-8 sm:px-6 sm:py-10 lg:px-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Link */}
        {step !== 'confirmation' && (
          <button
            onClick={() => setActiveView('home')}
            className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-sans uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#A99684] hover:text-[#11100E] transition-colors mb-4 sm:mb-8"
          >
            <ArrowLeft size={16} /> RETURN TO STORE
          </button>
        )}

        {/* STEP 1 & 2: CHECKOUT FORM */}
        {step !== 'confirmation' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 lg:gap-12">
            
            {/* Order summary first on mobile */}
            <div className="order-1 lg:order-2 lg:col-span-5 space-y-4 bg-white p-4 sm:p-6 lg:p-8 border border-[#EEE8DF] shadow-xs">
              <h3 className="font-serif text-base sm:text-lg tracking-[0.12em] sm:tracking-[0.15em] uppercase border-b border-[#EEE8DF] pb-2 sm:pb-3">
                ORDER SUMMARY ({cart.length} {cart.length === 1 ? 'ITEM' : 'ITEMS'})
              </h3>

              <div className="space-y-3 max-h-[220px] sm:max-h-[360px] overflow-y-auto no-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-14 sm:w-14 sm:h-18 object-cover bg-[#EEE8DF] shrink-0" />
                    <div className="flex-1 min-w-0 text-[11px] sm:text-xs font-sans">
                      <h4 className="font-semibold uppercase text-[#11100E] truncate">{item.product.name}</h4>
                      <span className="text-[10px] text-[#A99684] block truncate">
                        {item.selectedVariant.name} · Size {item.selectedSize} · Qty {item.quantity}
                      </span>
                    </div>
                    <span className="font-semibold text-[11px] sm:text-xs text-[#11100E] shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 sm:space-y-2 pt-3 sm:pt-4 border-t border-[#EEE8DF] text-[11px] sm:text-xs font-sans text-[#2C2925]">
                <div className="flex justify-between gap-4">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Shipping</span>
                  <span className="font-semibold">{shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between gap-4 text-sm font-bold text-[#11100E] pt-2 border-t border-[#EEE8DF]">
                  <span>Total</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Left Column: Input Form */}
            <div className="order-2 lg:order-1 lg:col-span-7 space-y-6 sm:space-y-8 bg-white p-4 sm:p-6 md:p-10 border border-[#EEE8DF] shadow-xs">
              
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-[#EEE8DF] pb-3 sm:pb-4">
                <h1 className="font-serif text-xl sm:text-2xl md:text-3xl tracking-[0.12em] sm:tracking-[0.2em] uppercase font-light leading-tight">
                  Express Checkout
                </h1>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-sans uppercase tracking-wider text-[#A99684]">
                  <Lock size={13} /> Secure checkout
                </div>
              </div>

              {step === 'details' ? (
                <form onSubmit={handleSubmitDetails} className="space-y-6 text-xs font-sans" noValidate>
                  {/* Contact Section */}
                  <div className="space-y-3">
                    <h3 className="font-serif text-sm uppercase tracking-wider text-[#A99684] font-semibold">
                      1. CONTACT INFORMATION
                    </h3>
                    <input
                      ref={emailRef}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="EMAIL ADDRESS FOR ORDER RECEIPT"
                      className="w-full bg-[#F5F1EB] border border-[#EEE8DF] p-3 text-xs text-[#11100E] placeholder:text-[#A99684] focus:outline-none focus:border-[#11100E]"
                    />
                  </div>

                  {/* Shipping Section */}
                  <div className="space-y-3 pt-4 border-t border-[#EEE8DF]">
                    <h3 className="font-serif text-sm uppercase tracking-wider text-[#A99684] font-semibold">
                      2. SHIPPING ADDRESS
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        ref={fullNameRef}
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="FULL NAME"
                        className="w-full bg-[#F5F1EB] border border-[#EEE8DF] p-3 text-xs text-[#11100E] focus:outline-none focus:border-[#11100E]"
                      />
                      <input
                        ref={phoneRef}
                        type="tel"
                        required
                        minLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="PHONE NUMBER (+91)"
                        className="w-full bg-[#F5F1EB] border border-[#EEE8DF] p-3 text-xs text-[#11100E] focus:outline-none focus:border-[#11100E]"
                      />
                    </div>
                    <input
                      ref={addressLineRef}
                      type="text"
                      required
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="STREET ADDRESS / APARTMENT / SUITE"
                      className="w-full bg-[#F5F1EB] border border-[#EEE8DF] p-3 text-xs text-[#11100E] focus:outline-none focus:border-[#11100E]"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        ref={cityRef}
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="CITY"
                        className="w-full bg-[#F5F1EB] border border-[#EEE8DF] p-3 text-xs text-[#11100E] focus:outline-none focus:border-[#11100E]"
                      />
                      <input
                        ref={postalCodeRef}
                        type="text"
                        required
                        inputMode="numeric"
                        minLength={4}
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="PINCODE / POSTAL"
                        className="w-full bg-[#F5F1EB] border border-[#EEE8DF] p-3 text-xs text-[#11100E] focus:outline-none focus:border-[#11100E]"
                      />
                      <input
                        ref={countryRef}
                        type="text"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="COUNTRY"
                        className="w-full bg-[#F5F1EB] border border-[#EEE8DF] p-3 text-xs text-[#11100E] focus:outline-none focus:border-[#11100E]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#11100E] text-[#F5F1EB] py-3.5 sm:py-4 text-[11px] sm:text-xs font-sans uppercase tracking-[0.15em] sm:tracking-[0.25em] font-medium hover:bg-[#A99684] transition-colors mt-4 sm:mt-6 shadow-lg"
                  >
                    Continue to payment
                  </button>
                </form>
              ) : (
                /* PAYMENT STEP */
                <div className="space-y-5 sm:space-y-6 text-xs font-sans animate-fade-up">
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between text-[11px] sm:text-xs pb-2 border-b border-[#EEE8DF]">
                    <span className="text-[#A99684] uppercase tracking-wider">Shipping to</span>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <span className="font-semibold text-[#11100E] truncate">{fullName}, {city}</span>
                      <button type="button" onClick={() => setStep('details')} className="shrink-0 underline text-[#A99684]">
                        Edit
                      </button>
                    </div>
                  </div>

                  <h3 className="font-serif text-sm uppercase tracking-wider text-[#A99684] font-semibold">
                    3. Payment method
                  </h3>

                  <div className="space-y-2.5 sm:space-y-3">
                    {/* UPI */}
                    <label onClick={() => setPaymentMethod('UPI')} className={paymentOptionClass(paymentMethod === 'UPI')}>
                      <div className="flex items-start gap-2.5 sm:items-center sm:gap-3 min-w-0">
                        <input type="radio" checked={paymentMethod === 'UPI'} readOnly className="accent-[#11100E] mt-0.5 sm:mt-0 shrink-0" />
                        <span className="font-semibold text-[11px] sm:text-xs uppercase tracking-wide leading-snug">
                          UPI · GPay, PhonePe, Paytm
                        </span>
                      </div>
                      <span className="self-start sm:self-center text-[9px] sm:text-[10px] text-[#A99684] uppercase tracking-wider pl-6 sm:pl-0">
                        Recommended
                      </span>
                    </label>

                    {paymentMethod === 'UPI' && (
                      <div className="p-3 bg-[#EEE8DF]/40 space-y-2.5 rounded-sm">
                        <span className="text-[10px] text-[#A99684] uppercase tracking-wide">UPI ID (VPA)</span>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            ref={upiInputRef}
                            type="text"
                            value={upiId}
                            onChange={(event) => {
                              setUpiId(event.target.value);
                              setUpiVerification('idle');
                              setUpiAccountName(null);
                            }}
                            className={`min-w-0 w-full border bg-white p-2.5 text-xs text-[#11100E] ${
                              upiVerification === 'invalid' ? 'border-red-400 ring-1 ring-red-200' : 'border-[#A99684]/40'
                            }`}
                            placeholder="username@upi"
                            autoComplete="off"
                            aria-label="Virtual payment address"
                            aria-invalid={upiVerification === 'invalid'}
                          />
                          <button
                            type="button"
                            onClick={verifyUpi}
                            disabled={upiVerification === 'loading'}
                            className="w-full sm:w-auto shrink-0 border border-[#11100E] px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-[#11100E] transition-colors hover:bg-[#11100E] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {upiVerification === 'loading' ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : 'Verify'}
                          </button>
                        </div>
                        <p aria-live="polite" className={`text-[10px] leading-relaxed ${upiVerification === 'valid' ? 'text-emerald-700' : upiVerification === 'invalid' ? 'text-red-700' : 'text-[#77716D]'}`}>
                          {upiVerification === 'valid'
                            ? upiAccountName
                              ? `✓ ${upiAccountName} · VPA verified. Your UPI app will confirm during payment.`
                              : '✓ VPA format verified. Your UPI app will confirm during payment.'
                            : upiVerification === 'invalid'
                              ? 'Enter a valid UPI ID (e.g. name@upi), then tap Verify.'
                              : upiVerification === 'loading'
                                ? 'Checking VPA with Razorpay…'
                                : 'We validate your VPA live; your bank app confirms the account.'}
                        </p>
                      </div>
                    )}

                    {/* CARD */}
                    <label onClick={() => setPaymentMethod('CARD')} className={paymentOptionClass(paymentMethod === 'CARD')}>
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <input type="radio" checked={paymentMethod === 'CARD'} readOnly className="accent-[#11100E] shrink-0" />
                        <span className="font-semibold text-[11px] sm:text-xs uppercase tracking-wide">Credit / debit card</span>
                      </div>
                      <CreditCard size={18} className="text-[#A99684] self-end sm:self-center" />
                    </label>

                    {/* COD */}
                    <label onClick={() => setPaymentMethod('COD')} className={paymentOptionClass(paymentMethod === 'COD')}>
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <input type="radio" checked={paymentMethod === 'COD'} readOnly className="accent-[#11100E] shrink-0" />
                        <span className="font-semibold text-[11px] sm:text-xs uppercase tracking-wide leading-snug">
                          Cash on delivery
                        </span>
                      </div>
                      <Truck size={18} className="text-[#A99684] self-end sm:self-center" />
                    </label>
                  </div>

                  <div className="space-y-3 sm:space-y-4 border-t border-[#EEE8DF] pt-4 sm:pt-6">

                    {/* Terms checkbox — highlighted, moved to top */}
                    <label
                      className={`flex cursor-pointer items-start gap-3 border p-3 sm:p-4 transition-colors ${
                        termsError
                          ? 'border-red-300 bg-red-50/60 ring-1 ring-red-200'
                          : agreeTerms
                          ? 'border-[#A99684] bg-[#F5F1EB]'
                          : 'border-[#C8B5A5] bg-[#FAF8F5] hover:border-[#A99684]'
                      }`}
                    >
                      <input
                        ref={termsCheckboxRef}
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => {
                          setAgreeTerms(e.target.checked);
                          if (e.target.checked) setTermsError('');
                        }}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[#11100E]"
                        aria-required
                        aria-invalid={!!termsError}
                      />
                      <span className="text-[12px] font-medium leading-relaxed text-[#11100E]">
                        I have read and agree to the website{' '}
                        <button
                          type="button"
                          onClick={() => { setActiveView('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="font-semibold text-[#11100E] underline underline-offset-2 hover:text-[#A99684]"
                        >
                          terms and conditions
                        </button>
                        <span className="text-red-600 font-bold" aria-hidden> *</span>
                      </span>
                    </label>
                    {termsError && (
                      <p role="alert" className="text-[11px] text-red-700 -mt-1">
                        {termsError}
                      </p>
                    )}

                    <p className="text-[11px] leading-relaxed text-[#2C2925]">
                      Your personal data will be used to process your order, support your experience throughout this
                      website, and for other purposes described in our{' '}
                      <button
                        type="button"
                        onClick={() => { setActiveView('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="font-medium text-[#11100E] underline underline-offset-2 hover:text-[#A99684]"
                      >
                        privacy policy
                      </button>
                      .
                    </p>

                    {/* Compact assurances on mobile */}
                    <div className="md:hidden border border-[#EEE8DF] bg-[#F5F1EB] p-3 space-y-2 text-[11px] leading-relaxed text-[#2C2925]">
                      <p>
                        <span className="font-semibold text-[#11100E]">Delivery:</span> Free returns within 15 days
                        (items undamaged).
                      </p>
                      <p>
                        <span className="font-semibold text-[#11100E]">30-day guarantee:</span> Contact us within 30
                        days for a free tights replacement.
                      </p>
                      <p>
                        <span className="font-semibold text-[#11100E]">Payments:</span> Secure Razorpay checkout — UPI,
                        cards, COD.
                      </p>
                    </div>

                    <div className="hidden md:block space-y-3">
                      <div className="flex gap-3 border border-[#EEE8DF] bg-[#F5F1EB] p-4">
                        <Truck size={20} className="mt-0.5 shrink-0 text-[#A99684]" strokeWidth={1.5} />
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#11100E]">
                            Delivery Information
                          </p>
                          <p className="text-[11px] leading-relaxed text-[#2C2925]">
                            Free returns within 15 days, please make sure the items are in undamaged condition.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 border border-[#EEE8DF] bg-[#F5F1EB] p-4">
                        <RotateCcw size={20} className="mt-0.5 shrink-0 text-[#A99684]" strokeWidth={1.5} />
                        <div className="space-y-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#11100E]">
                            Up to 30-Day Guarantee
                          </p>
                          <p className="text-[11px] leading-relaxed text-[#2C2925]">
                            Bad luck with your tights? Simply contact us within 30 days of receiving your order and we
                            will replace them for free!
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 border border-[#EEE8DF] bg-[#F5F1EB] p-4">
                        <Headphones size={20} className="mt-0.5 shrink-0 text-[#A99684]" strokeWidth={1.5} />
                        <div className="space-y-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#11100E]">
                            Payment Support
                          </p>
                          <p className="text-[11px] leading-relaxed text-[#2C2925]">
                            Secure checkout via Razorpay — UPI, credit &amp; debit cards, and cash on delivery. Need
                            help? Email{' '}
                            <a
                              href="mailto:concierge@kaytlynleonor.com"
                              className="font-medium text-[#11100E] underline underline-offset-2 hover:text-[#A99684]"
                            >
                              concierge@kaytlynleonor.com
                            </a>
                            .
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {['UPI', 'Visa', 'Mastercard', 'Razorpay', 'COD'].map((badge) => (
                              <span
                                key={badge}
                                className="border border-[#EEE8DF] bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#A99684]"
                              >
                                {badge}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#A99684]">
                      <ShieldCheck size={14} strokeWidth={1.5} />
                      PCI-DSS compliant · 256-bit encrypted checkout
                    </p>
                  </div>

                  {paymentError && (
                    <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                      {paymentError}
                    </p>
                  )}

                  <div className="pt-2 sm:pt-4 flex flex-col-reverse gap-2 sm:flex-row sm:gap-3 md:static fixed inset-x-0 bottom-0 z-30 border-t border-[#EEE8DF] bg-[#F5F1EB]/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:relative sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="w-full sm:w-auto border border-[#11100E] text-[#11100E] px-6 py-3 text-[11px] sm:text-xs uppercase tracking-wider"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={isPaymentLoading}
                      className="flex w-full flex-1 items-center justify-center gap-2 bg-[#11100E] py-3.5 sm:py-4 text-[10px] sm:text-xs font-sans font-medium uppercase tracking-[0.12em] sm:tracking-[0.2em] text-[#F5F1EB] shadow-lg transition-colors hover:bg-[#A99684] disabled:cursor-wait disabled:opacity-70"
                    >
                      {isPaymentLoading ? (
                        <><Loader2 size={15} className="animate-spin" /> Processing…</>
                      ) : paymentMethod === 'COD' ? (
                        <>Place order · {formatPrice(totalAmount)}</>
                      ) : (
                        <>Pay · {formatPrice(totalAmount)}</>
                      )}
                    </button>
                  </div>
                  <div className="h-24 sm:hidden" aria-hidden />
                </div>
              )}

            </div>

          </div>
        )}

        {/* STEP 3: ORDER CONFIRMATION MODAL */}
        {step === 'confirmation' && createdOrder && (
          <div className="max-w-2xl mx-auto bg-white p-10 md:p-14 border border-[#EEE8DF] text-center space-y-6 shadow-2xl animate-fade-in-scale">
            <CheckCircle size={56} className="mx-auto text-emerald-700" strokeWidth={1.5} />
            
            <span className="text-[11px] font-sans uppercase tracking-[0.4em] text-[#A99684]">
              PURCHASE CONFIRMED
            </span>

            <h1 className="font-serif text-3xl md:text-5xl tracking-[0.15em] uppercase font-light">
              THANK YOU FOR YOUR ORDER
            </h1>

            <p className="text-xs font-sans text-[#2C2925] tracking-wider leading-relaxed max-w-md mx-auto">
              Your order <strong className="text-[#11100E]">{createdOrder.id}</strong> has been received by our atelier. A confirmation email has been dispatched to <strong>{email}</strong>.
            </p>

            <div className="p-4 bg-[#F5F1EB] text-left text-xs font-sans space-y-1 border border-[#EEE8DF]">
              <p className="font-bold text-[#11100E] uppercase tracking-wider">ORDER DETAILS:</p>
              <p>Tracking Number: <span className="font-mono text-[#A99684]">{createdOrder.trackingNumber}</span></p>
              <p>Payment: {createdOrder.paymentMethod}</p>
              <p>Total Paid: {formatPrice(createdOrder.totalAmount)}</p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() =>
                  navigateToTracking(setActiveView, {
                    reference: createdOrder.trackingNumber,
                    email,
                  })
                }
                className="bg-[#11100E] text-[#F5F1EB] px-8 py-3.5 text-xs uppercase tracking-[0.25em] font-sans font-medium hover:bg-[#A99684] transition-colors"
              >
                Track this order
              </button>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setActiveView('orders')}
                  className="border border-[#11100E] text-[#11100E] px-8 py-3.5 text-xs uppercase tracking-[0.25em] font-sans font-medium hover:bg-[#11100E] hover:text-[#F5F1EB] transition-colors"
                >
                  View my orders
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setActiveView('home')}
                className="border border-[#11100E] text-[#11100E] px-8 py-3.5 text-xs uppercase tracking-[0.25em] font-sans font-medium hover:bg-[#11100E] hover:text-[#F5F1EB] transition-colors"
              >
                Continue shopping
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
