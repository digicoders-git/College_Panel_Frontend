import React from "react";
import { DownloadCloud } from "lucide-react";

export default function InstallPrompt({ installPrompt, onInstall }) {
  if (!installPrompt) return null;

  return (
    <div className="fixed bottom-32 sm:bottom-8 right-6 z-[9999] animate-bounce-subtle">
      <button
        onClick={onInstall}
        className="flex items-center gap-2.5 bg-gradient-to-br from-blue-600 to-blue-700 text-white px-5 py-3 rounded-2xl shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 backdrop-blur-sm group"
      >
        <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition-colors">
          <DownloadCloud size={18} strokeWidth={2.5} />
        </div>
        <span className="font-bold text-sm tracking-tight">Install App</span>
      </button>
      
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-2xl -z-10" />
    </div>
  );
}
