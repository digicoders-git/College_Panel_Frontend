import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

export default function Unauthorized() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center animate-loader-fade-in relative">
      <Loader />
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-rose-500/10 blur-[60px] animate-pulse-glow" />
        <div className="relative w-32 h-32 bg-white rounded-3xl shadow-2xl shadow-rose-900/10 border border-rose-50 flex items-center justify-center">
          <span className="text-5xl font-black text-rose-500 tracking-tighter">403</span>
        </div>
      </div>
      
      <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Access Restricted</h1>
      <p className="text-slate-500 font-medium max-w-[320px] mb-10 leading-relaxed">
        It looks like you don't have the required permissions to view this secure portal area.
      </p>

      <button 
        onClick={() => navigate(-1)} 
        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2 group"
      >
        <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center group-hover:-translate-x-1 transition-transform">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </div>
        Return to Safety
      </button>

      <p className="mt-12 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Institutional Security Protocol</p>
    </div>
  );
}
