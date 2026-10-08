import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Truck, RotateCcw, Shield, HelpCircle, FileText } from 'lucide-react';

export const PolicyModal: React.FC = () => {
  const { isPolicyOpen, policyType, closePolicy } = useStore();

  if (!isPolicyOpen) return null;

  const getPolicyContent = () => {
    switch (policyType) {
      case 'shipping':
        return {
          title: 'COMPLIMENTARY SHIPPING POLICY',
          icon: <Truck className="text-[#A99684]" size={24} />,
          text: [
            'KAYTLYN LEONOR offers complimentary signature white-glove shipping on all orders over ₹5,000 across India.',
            'Standard Domestic Delivery: 2-4 business days via insured luxury logistics partners (Blue Dart Express Apex / DHL Express).',
            'International Express Shipping: 3-5 business days globally. Duties and taxes are pre-calculated and cleared at checkout to avoid customs delay.',
            'Every shipment arrives in archival presentation boxes, hand-tied with custom champagne satin ribbon and sealed with our beeswax crest.'
          ]
        };
      case 'returns':
        return {
          title: 'WHITE-GLOVE RETURNS & EXCHANGES',
          icon: <RotateCcw className="text-[#A99684]" size={24} />,
          text: [
            'We extend a 14-day complimentary return or exchange window from the date of delivery.',
            'To maintain our couture standards, returned items must be unworn, unwashed, unaltered, and with all original security tags, garment bags, and packaging intact.',
            'Beauty & Fragrance items must remain unopened with intact protective plastic seal.',
            'To request a complimentary courier pick-up from your home or hotel, contact concierge@kaytlynleonor.com or initiate via your Account portal.'
          ]
        };
      case 'faq':
        return {
          title: 'CLIENT SERVICES FAQ',
          icon: <HelpCircle className="text-[#A99684]" size={24} />,
          text: [
            'Q: How do I verify authenticity of my Kaytlyn Leonor handbag or fine jewelry?',
            'A: Every leather bag and piece of fine jewelry features an embedded NFC authenticity chip and an engraved serial number registered in our master atelier database.',
            'Q: Can I request bespoke alterations or custom sizing?',
            'A: Yes. Our Mumbai and Paris ateliers offer bespoke tailoring upon request for our Signature eveningwear collection.',
            'Q: What payment methods do you accept?',
            'A: We accept all major Indian UPI applications (GPay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, Amex, Diner\'s), Net Banking, and Apple Pay.'
          ]
        };
      case 'contact':
        return {
          title: 'CONTACT US',
          icon: <HelpCircle className="text-[#A99684]" size={24} />,
          text: [
            'Our client care team is available to assist with orders, products, and appointments.',
            'Email concierge@kaytlynleonor.com for personal assistance. Please include your order number when asking about an existing order.',
            'For order status and tracking details, open the Orders section in your client account.'
          ]
        };
      case 'terms':
        return {
          title: 'TERMS OF SERVICE',
          icon: <FileText className="text-[#A99684]" size={24} />,
          text: [
            'By using this site, you agree to use its services lawfully and provide accurate information when placing an order.',
            'Product availability, pricing, and delivery estimates may change. An order is confirmed after checkout and payment authorization.',
            'Product imagery is representative; colors may vary slightly between displays. All site content and brand materials are protected by applicable intellectual property laws.',
            'For questions about these terms, contact concierge@kaytlynleonor.com.'
          ]
        };
      case 'accessibility':
        return {
          title: 'ACCESSIBILITY',
          icon: <FileText className="text-[#A99684]" size={24} />,
          text: [
            'KAYTLYN LEONOR is committed to making this shopping experience accessible to as many people as possible.',
            'If you encounter a barrier while browsing or placing an order, contact concierge@kaytlynleonor.com and describe the page and assistance you need.',
            'We review accessibility feedback as part of ongoing improvements to the site.'
          ]
        };
      case 'cookie-policy':
        return {
          title: 'COOKIE POLICY',
          icon: <Shield className="text-[#A99684]" size={24} />,
          text: [
            'This site uses essential browser storage to remember your cookie choice and support core shopping functions.',
            'Your cookie preference is stored in this browser. Use “Set My Cookies” in the footer to reopen the preference controls.',
            'For questions about data and privacy, contact concierge@kaytlynleonor.com.'
          ]
        };
      case 'tracking':
        return {
          title: 'ORDER TRACKING',
          icon: <Truck className="text-[#A99684]" size={24} />,
          text: [
            'Use the carrier tracking link in your shipping confirmation email to view the latest delivery status.',
            'For help locating your confirmation or tracking details, contact concierge@kaytlynleonor.com with your order number.'
          ]
        };
      case 'privacy':
      default:
        return {
          title: 'PRIVACY POLICY & DATA PROTECTION',
          icon: <Shield className="text-[#A99684]" size={24} />,
          text: [
            'KAYTLYN LEONOR respects your privacy and is dedicated to safeguarding your personal data in accordance with global privacy laws.',
            'We collect personal information solely to process orders, manage accounts, provide concierge client support, and curate personalized recommendations.',
            'We never sell, rent, or trade your personal information to third parties.',
            'Payment transactions are encrypted using SSL 256-bit technology and processed directly through PCI-DSS Level 1 compliant payment gateways.'
          ]
        };
    }
  };

  const content = getPolicyContent();

  return (
    <div className="fixed inset-0 z-50 bg-[#11100E]/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#F5F1EB] text-[#11100E] w-full max-w-2xl max-h-[85vh] overflow-y-auto p-8 border border-[#EEE8DF] shadow-2xl relative animate-fade-in-scale">
        <button
          onClick={closePolicy}
          className="absolute top-6 right-6 p-2 text-[#11100E] hover:text-[#A99684] transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#EEE8DF]">
          {content.icon}
          <h3 className="font-serif text-xl md:text-2xl tracking-[0.2em] font-light uppercase">
            {content.title}
          </h3>
        </div>

        <div className="space-y-4 text-xs md:text-sm font-sans text-[#2C2925] leading-relaxed">
          {content.text.map((paragraph, index) => (
            <p key={index} className="border-l-2 border-[#A99684]/40 pl-4 py-1">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-[#EEE8DF] text-center">
          <button
            onClick={closePolicy}
            className="bg-[#11100E] text-[#F5F1EB] text-xs uppercase tracking-[0.25em] px-8 py-3 hover:bg-[#A99684] transition-colors"
          >
            CLOSE WINDOW
          </button>
        </div>
      </div>
    </div>
  );
};
