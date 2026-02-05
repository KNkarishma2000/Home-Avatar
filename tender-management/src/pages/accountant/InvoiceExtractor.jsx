import React, { useState, useEffect, useRef, useCallback } from 'react';
import { financeAPI } from '../../api/auth.service';
import { Play, FileText, ExternalLink, Loader2, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InvoiceExtractor() {
  const [loading, setLoading] = useState(false);
  const [isSystemBusy, setIsSystemBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({ folder_name: '', folder_url: '' });
  
  const toastIdRef = useRef(null);

  const checkStatusAndSetUI = useCallback((data) => {
    // We only consider the system "Busy" if a record is PROCESSING or PENDING
    const processingItem = data.find(row => row.status === 'PROCESSING' || row.status === 'PENDING');
    
    if (processingItem) {
      setIsSystemBusy(true);
      if (!toastIdRef.current) {
        toastIdRef.current = toast.loading(`Processing: ${processingItem.folder_name}...`, { 
          id: "invoice-sync",
          duration: Infinity 
        });
      }
    } else {
      setIsSystemBusy(false);
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    }
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await financeAPI.getInvoiceHistory();
      if (data.success) {
        setHistory(data.data);
        checkStatusAndSetUI(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 10000); // Polling every 10s
    return () => {
      clearInterval(interval);
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
    };
  }, [checkStatusAndSetUI]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSystemBusy) return;

    setLoading(true);
    toastIdRef.current = toast.loading("Initializing extraction...", { id: "invoice-sync" });

    try {
      const { data } = await financeAPI.processInvoiceExtraction(formData);
      if (data.success) {
        toast.success("Extraction Complete!", { id: "invoice-sync" });
        setFormData({ folder_name: '', folder_url: '' });
        fetchHistory();
      }
    } catch (err) {
      console.error("Submit Error:", err);
      toast.error("Process failed or timed out. Check history below.", { id: "invoice-sync" });
      fetchHistory();
    } finally {
      setLoading(false);
      toastIdRef.current = null;
    }
  };

  return (
    <div className="p-8 space-y-10">
      {/* INPUT SECTION */}
      <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
            <FileText size={24} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight">Invoice PDF Extractor</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 space-y-2 w-full">
            <label className="text-[10px] font-black text-neutral-400 uppercase ml-2">Batch Name</label>
            <input 
              type="text" 
              className="w-full p-4 bg-neutral-50 rounded-2xl border border-neutral-200 focus:ring-2 ring-orange-500 outline-none font-bold"
              value={formData.folder_name}
              onChange={e => setFormData({...formData, folder_name: e.target.value})}
              required 
              disabled={loading || isSystemBusy}
            />
          </div>
          
          <div className="flex-[2] space-y-2 w-full">
            <label className="text-[10px] font-black text-neutral-400 uppercase ml-2">Google Drive Folder URL</label>
            <input 
              type="url" 
              className="w-full p-4 bg-neutral-50 rounded-2xl border border-neutral-200 focus:ring-2 ring-orange-500 outline-none font-bold"
              value={formData.folder_url}
              onChange={e => setFormData({...formData, folder_url: e.target.value})}
              required 
              disabled={loading || isSystemBusy}
            />
          </div>

          <button 
            type="submit"
            disabled={loading || isSystemBusy}
            className="bg-neutral-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-orange-600 transition-all flex items-center gap-2 h-[58px] disabled:bg-neutral-300"
          >
            {loading || isSystemBusy ? (
              <><Loader2 className="animate-spin" size={20} /> <span className="uppercase">Processing...</span></>
            ) : (
              <><Play size={20} fill="currentColor" /> <span className="uppercase">Start Extraction</span></>
            )}
          </button>
        </form>
      </div>

      {/* HISTORY TABLE */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
          <h3 className="font-black uppercase text-xs tracking-[0.2em] text-neutral-500">Extraction History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="p-5 text-[10px] font-black text-neutral-400 uppercase">Status</th>
                <th className="p-5 text-[10px] font-black text-neutral-400 uppercase">Batch Name</th>
                <th className="p-5 text-[10px] font-black text-neutral-400 uppercase text-right">Download Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {history.map((row) => (
                <tr key={row.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="p-5">
                    {row.status === 'COMPLETED' ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase">Ready</span>
                    ) : row.status === 'FAILED' ? (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-black uppercase">Failed / Stopped</span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase animate-pulse">Processing</span>
                    )}
                  </td>
                  <td className="p-5">
                    <span className="font-bold text-neutral-800 uppercase text-sm">{row.folder_name}</span>
                  </td>
                  <td className="p-5 text-right">
                    {row.status === 'COMPLETED' ? (
                      <a href={row.extracted_output_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-black text-[10px] hover:bg-indigo-600 hover:text-white transition-all">
                        VIEW FILE <ExternalLink size={12} />
                      </a>
                    ) : row.status === 'FAILED' ? (
                      <div className="flex items-center justify-end gap-1 text-red-400 font-bold text-[10px] uppercase">
                        <AlertCircle size={12} /> Error Occurred
                      </div>
                    ) : (
                      <span className="text-neutral-300 italic text-[10px] font-bold uppercase">Working...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}