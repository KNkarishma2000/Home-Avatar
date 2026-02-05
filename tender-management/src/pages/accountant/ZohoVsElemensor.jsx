import React, { useState, useEffect, useRef, useCallback } from 'react';
import { financeAPI } from '../../api/auth.service';
import { Play, FileText, Loader2, CheckCircle, Clock, ExternalLink, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ZohoVsElemensor() {
  const [loading, setLoading] = useState(false);
  const [isSystemBusy, setIsSystemBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({
    filename: '', elemensor_file: '', zoho_balance_sheet: '', start_date: '', end_date: ''
  });

  const toastIdRef = useRef(null);

  const checkStatusAndSetUI = useCallback((data) => {
    const processingItem = data.find(row => row.status === 'PROCESSING' || row.status === 'PENDING');
    
    if (processingItem) {
      setIsSystemBusy(true);
      if (!toastIdRef.current) {
        toastIdRef.current = toast.loading(`Mapping Analysis: ${processingItem.filename} in progress...`, { 
          id: "zoho-sync",
          duration: Infinity 
        });
      }
    } else {
      setIsSystemBusy(false);
      if (toastIdRef.current) {
        toast.dismiss("zoho-sync");
        toastIdRef.current = null;
      }
    }
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await financeAPI.getZohoVsElemensorHistory();
      if (data.success) {
        setHistory(data.data);
        checkStatusAndSetUI(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch history");
    }
  };

  useEffect(() => { 
    fetchHistory(); 
    const interval = setInterval(fetchHistory, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [checkStatusAndSetUI]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSystemBusy) return;

    setLoading(true);
    toastIdRef.current = toast.loading("Initializing Analysis Engine...", { id: "zoho-sync", duration: Infinity });

    try {
      const { data } = await financeAPI.processZohoVsElemensor(formData);
      if (data.success) {
        toast.success("Analysis Complete!", { id: "zoho-sync" });
        setFormData({ filename: '', elemensor_file: '', zoho_balance_sheet: '', start_date: '', end_date: '' });
        fetchHistory();
      }
    } catch (err) {
      console.error("Sync Error:", err);
      toast.error("Process interrupted. Monitoring background status...", { id: "zoho-sync", duration: 5000 });
      fetchHistory();
    } finally {
      setLoading(false);
      toastIdRef.current = null;
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* 1. INPUT FORM SECTION */}
      <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg ${isSystemBusy ? 'bg-indigo-600 text-white animate-pulse' : 'bg-indigo-100 text-indigo-600'}`}>
            <FileText size={24} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight">Zoho vs Elemensor Mapping</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase ml-2">File Name</label>
            <input 
              placeholder="e.g. DEC 2025 Mapping"
              className="w-full p-4 bg-neutral-50 rounded-2xl border border-neutral-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold disabled:opacity-50"
              value={formData.filename}
              onChange={e => setFormData({...formData, filename: e.target.value})}
              required
              disabled={loading || isSystemBusy}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase ml-2 flex items-center gap-1"><Calendar size={12} /> Start Date</label>
              <input type="date" className="w-full p-4 bg-neutral-50 rounded-2xl border border-neutral-200 font-bold disabled:opacity-50" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} required disabled={loading || isSystemBusy} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase ml-2 flex items-center gap-1"><Calendar size={12} /> End Date</label>
              <input type="date" className="w-full p-4 bg-neutral-50 rounded-2xl border border-neutral-200 font-bold disabled:opacity-50" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} required disabled={loading || isSystemBusy} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Elemensor URL" className="w-full p-4 bg-neutral-50 rounded-2xl border text-sm disabled:opacity-50" value={formData.elemensor_file} onChange={e => setFormData({...formData, elemensor_file: e.target.value})} required disabled={loading || isSystemBusy} />
            <input placeholder="Zoho BS URL" className="w-full p-4 bg-neutral-50 rounded-2xl border text-sm disabled:opacity-50" value={formData.zoho_balance_sheet} onChange={e => setFormData({...formData, zoho_balance_sheet: e.target.value})} required disabled={loading || isSystemBusy} />
          </div>

          <button 
            type="submit"
            disabled={loading || isSystemBusy} 
            className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-black flex items-center justify-center gap-3 disabled:bg-neutral-300"
          >
            {loading || isSystemBusy ? (
              <><Loader2 className="animate-spin" /> <span className="uppercase">Engine Busy...</span></>
            ) : (
              <><Play size={20} fill="currentColor" /> Start Mapping</>
            )}
          </button>
        </form>
      </div>

      {/* 2. HISTORY SECTION */}
      <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
          <h3 className="font-black text-neutral-800 uppercase tracking-widest text-xs">Analysis History</h3>
          {isSystemBusy && <div className="text-orange-600 animate-pulse text-[10px] font-black uppercase flex items-center gap-2"><Clock size={14} /> Processing Active</div>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 border-b">
              <tr className="text-[10px] font-black text-neutral-400 uppercase">
                <th className="p-6">Batch & Period</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Mapping Result</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {history.map((row) => (
                <tr key={row.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="p-6">
                    <div className="font-bold text-neutral-800">{row.filename}</div>
                    <div className="text-[10px] text-neutral-400 font-bold uppercase">{row.start_date} → {row.end_date}</div>
                  </td>
                  <td className="p-6">
                    {row.status === 'COMPLETED' ? (
                      <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full font-black text-[10px] uppercase">Success</span>
                    ) : row.status === 'FAILED' ? (
                      <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full font-black text-[10px] uppercase flex items-center gap-1 w-fit"><AlertCircle size={12}/> Analysis Stopped</span>
                    ) : (
                      <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-full font-black text-[10px] uppercase animate-pulse flex items-center gap-1 w-fit"><Clock size={12}/> Processing</span>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    {row.output_url ? (
                      <a href={row.output_url} target="_blank" rel="noreferrer" className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-black text-[10px] inline-flex items-center gap-2">VIEW FILE <ExternalLink size={12} /></a>
                    ) : row.status === 'FAILED' ? (
                      <span className="text-red-300 italic text-[10px] font-bold uppercase">Error occured</span>
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