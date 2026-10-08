import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { navigateToTracking } from '../../lib/orderTracking';

const CONCIERGE_EMAIL = 'concierge@kaytlynleonor.com';

export const ContactView: React.FC = () => {
  const { openPolicy, setActiveView } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [enquiryType, setEnquiryType] = useState('product questions or issues');
  const [otherIssue, setOtherIssue] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const otherIssueDetails = enquiryType === 'other' ? `\nIssue details: ${otherIssue}\n` : '';
    const body = `Name: ${name}\nEmail: ${email}\nEnquiry type: ${enquiryType}${otherIssueDetails}\nMessage: ${message}`;
    const mailtoUrl = `mailto:${CONCIERGE_EMAIL}?subject=${encodeURIComponent(enquiryType)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <main className="min-h-[70vh] bg-[#F5F1EB] px-6 py-12 text-[#252329] md:py-16">
      <div className="mx-auto max-w-[620px] text-center">
        <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.3em] text-[#A99684]">
          Client Care
        </span>
        <h1 className="mt-2 font-serif text-3xl font-light uppercase tracking-[0.12em] text-[#11100E] md:text-4xl">
          Contact Us
        </h1>
        <div className="mt-4 space-y-1 text-sm leading-relaxed text-[#4D4742] md:text-base">
          <p>Our client care team is here to assist you.</p>
          <p>
            For order updates, visit our{' '}
            <button type="button" onClick={() => navigateToTracking(setActiveView)} className="underline underline-offset-2 hover:text-[#11100E]">
              track your order
            </button>.
          </p>
          <p>
            For product or website questions, please see our{' '}
            <button type="button" onClick={() => openPolicy('faq')} className="underline underline-offset-2 hover:text-[#11100E]">
              frequently asked questions
            </button>.
          </p>
          <p>If you still need assistance, send us a message below.</p>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto mt-12 max-w-[462px] space-y-5 text-left md:mt-14">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="space-y-1.5 text-xs font-medium text-[#4D4742]">
              <span>Name</span>
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11 w-full border border-[#D8C8B7] bg-white px-3 text-sm text-[#252329] outline-none transition-colors focus:border-[#11100E]"
              />
            </label>
            <label className="space-y-1.5 text-xs font-medium text-[#4D4742]">
              <span>Email address</span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 w-full border border-[#D8C8B7] bg-white px-3 text-sm text-[#252329] outline-none transition-colors focus:border-[#11100E]"
              />
            </label>
          </div>

          <label className="block space-y-1.5 text-xs font-medium text-[#4D4742]">
            <span>How can we help?</span>
            <select
              value={enquiryType}
              onChange={(event) => setEnquiryType(event.target.value)}
              className="h-11 w-full border border-[#D8C8B7] bg-white px-3 text-sm font-normal text-[#4D4742] outline-none focus:border-[#11100E]"
            >
              <option>product questions or issues</option>
              <option>tracking and delivery issues</option>
              <option>damaged product</option>
              <option>health concern</option>
              <option>website feedback, checkout or promotions issue</option>
              <option>website account</option>
              <option>public relations and collaborations</option>
              <option>data privacy</option>
              <option>other</option>
            </select>
          </label>

          {enquiryType === 'other' && (
            <label className="block animate-fade-up space-y-1.5 text-xs font-medium text-[#4D4742]">
              <span>Describe your issue</span>
              <textarea
                required
                rows={3}
                value={otherIssue}
                onChange={(event) => setOtherIssue(event.target.value)}
                placeholder="Tell us what you need help with."
                className="w-full resize-y border border-[#D8C8B7] bg-white px-3 py-3 text-sm font-normal leading-relaxed text-[#252329] outline-none placeholder:text-[#9A938D] focus:border-[#11100E]"
              />
            </label>
          )}

          <label className="block space-y-1.5 text-xs font-medium text-[#4D4742]">
            <span>Message</span>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Please include any details that may help us assist you."
              className="w-full resize-y border border-[#D8C8B7] bg-white px-3 py-3 text-sm font-normal leading-relaxed text-[#252329] outline-none placeholder:text-[#9A938D] focus:border-[#11100E]"
            />
          </label>

          <button
            type="submit"
            className="h-11 w-full bg-[#11100E] text-xs font-medium uppercase tracking-[0.2em] text-[#F5F1EB] transition-colors hover:bg-[#2C2925]"
          >
            Send Message
          </button>
        </form>
      </div>
    </main>
  );
};