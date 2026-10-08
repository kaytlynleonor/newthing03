import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { isOrderTrashed, isTrashedOrderExpired } from '../../../lib/orderTrash';
import { Loader2, RotateCcw, Trash2 } from 'lucide-react';
import { DocumentData } from 'firebase/firestore';

export const TrashTab: React.FC = () => {
  const [items, setItems]       = useState<DocumentData[]>([]);
  const [loading, setLoading]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg]           = useState('');

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const fetchTrashed = async () => {
    setLoading(true);
    try {
      const q    = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setItems(
        snap.docs
          .map(d => ({ _docId: d.id, ...d.data() }))
          .filter(isOrderTrashed)
      );
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchTrashed(); }, []);

  const restore = async (docId: string, orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', docId), { trashedAt: null, updatedAt: serverTimestamp() });
      setItems(prev => prev.filter(o => o._docId !== docId));
      flash(`✓ Order ${orderId} restored.`);
    } catch { flash('✗ Restore failed.'); }
  };

  const permanentDelete = async (docId: string, orderId: string) => {
    if (!window.confirm(`Permanently delete order ${orderId}? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'orders', docId));
      setItems(prev => prev.filter(o => o._docId !== docId));
      flash(`✓ Order ${orderId} deleted.`);
    } catch { flash('✗ Delete failed.'); }
  };

  const deleteAll = async () => {
    if (!items.length) return;
    if (!window.confirm(`Permanently delete ALL ${items.length} trashed order(s)? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await Promise.all(items.map(o => deleteDoc(doc(db, 'orders', o._docId)).catch(() => {})));
      setItems([]);
      flash(`✓ All ${items.length} trashed order(s) permanently deleted.`);
    } catch { flash('✗ Bulk delete failed.'); }
    setDeleting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-serif text-lg uppercase tracking-[0.2em]">
          Trash <span className="text-[#A99684] text-sm">({items.length})</span>
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={fetchTrashed} className="text-[11px] uppercase tracking-wider text-[#A99684] hover:text-[#11100E]">
            Refresh
          </button>
          {items.length > 0 && (
            <button
              type="button"
              onClick={deleteAll}
              disabled={deleting}
              className="flex items-center gap-1.5 border border-red-400 bg-red-600 text-white px-4 py-2 text-[10px] uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
              Delete All Permanently
            </button>
          )}
        </div>
      </div>

      {msg && (
        <p className={`text-[11px] px-3 py-2 border ${msg.startsWith('✓') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {msg}
        </p>
      )}

      <p className="text-[11px] text-[#A99684]">
        Orders moved to trash are auto-deleted after 30 days.
      </p>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-[#A99684]" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-sm text-[#A99684]">Trash is empty.</div>
      ) : (
        <div className="space-y-2">
          {items.map(order => (
            <div key={order._docId} className="bg-white border border-[#EEE8DF] px-4 py-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-serif text-sm">{order.id}</p>
                <p className="text-[10px] text-[#A99684]">{order.customerEmail}</p>
                <p className="text-[10px] text-red-400 mt-0.5">
                  {isTrashedOrderExpired(order) ? 'Expired — will be deleted soon' : `Trashed ${new Date(order.trashedAt).toLocaleDateString()}`}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => restore(order._docId, order.id)}
                  className="flex items-center gap-1.5 border border-[#11100E] bg-white px-3 py-1.5 text-[10px] uppercase tracking-wider hover:bg-[#11100E] hover:text-white"
                >
                  <RotateCcw size={11} /> Restore
                </button>
                <button
                  type="button"
                  onClick={() => permanentDelete(order._docId, order.id)}
                  className="flex items-center gap-1.5 border border-red-300 bg-red-50 px-3 py-1.5 text-[10px] uppercase tracking-wider text-red-800 hover:bg-red-100"
                >
                  <Trash2 size={11} /> Delete Permanently
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
