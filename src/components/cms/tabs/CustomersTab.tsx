import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Users, Mail, Phone, Loader2, RefreshCw, Search } from 'lucide-react';

export const CustomersTab: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      setCustomers(snap.docs.map(d => ({ _id: d.id, ...d.data() })));
    } catch (e) { console.warn(e); }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const visible = customers.filter(c =>
    (c.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-64">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A99684]" />
          <input className="w-full bg-white border border-[#EEE8DF] pl-8 pr-3 py-2 text-xs focus:outline-none"
            placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={fetch} className="p-2 border border-[#EEE8DF] bg-white text-[#A99684] hover:text-[#11100E]"><RefreshCw size={13} /></button>
      </div>

      <p className="text-[10px] uppercase tracking-[0.2em] text-[#A99684]">{visible.length} customers</p>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-[#A99684]" /></div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16">
          <Users size={36} className="mx-auto text-[#A99684] mb-3" strokeWidth={1} />
          <p className="text-sm text-[#A99684]">No customers yet</p>
        </div>
      ) : (
        <div className="border border-[#EEE8DF] overflow-x-auto">
          <table className="w-full text-xs font-sans">
            <thead>
              <tr className="bg-[#F5F1EB] border-b border-[#EEE8DF] text-[#A99684]">
                <th className="p-3 text-left text-[10px] uppercase tracking-[0.2em]">Name</th>
                <th className="p-3 text-left text-[10px] uppercase tracking-[0.2em]">Email</th>
                <th className="p-3 text-left text-[10px] uppercase tracking-[0.2em]">Membership</th>
                <th className="p-3 text-left text-[10px] uppercase tracking-[0.2em]">Joined</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c, i) => {
                const name = c.displayName || c.email?.split('@')[0] || 'Client';
                const initials = name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
                return (
                  <tr key={c._id} className={`border-b border-[#EEE8DF] hover:bg-[#F5F1EB] ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]'}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {c.photoURL
                          ? <img src={c.photoURL} alt={name} className="w-7 h-7 rounded-full object-cover" />
                          : <div className="w-7 h-7 rounded-full bg-[#11100E] flex items-center justify-center text-[#F5F1EB] text-[10px] font-bold">{initials}</div>
                        }
                        <span className="font-medium text-[#11100E]">{name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-[#A99684]"><span className="flex items-center gap-1"><Mail size={11} />{c.email || '—'}</span></td>
                    <td className="p-3"><span className="text-[10px] uppercase tracking-wider bg-[#F5F1EB] border border-[#EEE8DF] px-2 py-0.5">{c.membershipTier || 'Member'}</span></td>
                    <td className="p-3 text-[#A99684]">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
