import React from 'react';
import {
  Smartphone,
  Monitor,
  Globe,
  Play,
  Square,
  ShieldCheck,
  Send,
  Code2,
} from 'lucide-react';

interface HeaderProps {
  isServiceActive: boolean;
  onToggleService: () => void;
  lang: 'ar' | 'en';
  onToggleLang: () => void;
  viewMode: 'phone' | 'desktop';
  onToggleViewMode: () => void;
  onOpenSimulator: () => void;
  onOpenCodeExporter: () => void;
  onOpenRealTelegram: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isServiceActive,
  onToggleService,
  lang,
  onToggleLang,
  viewMode,
  onToggleViewMode,
  onOpenSimulator,
  onOpenCodeExporter,
  onOpenRealTelegram,
}) => {
  const isRtl = lang === 'ar';

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Send className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                {isRtl ? 'تي فورواردر برو' : 'TForwarder Pro'}
              </h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Native Android
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {isRtl
                ? 'محرك إعادة توجيه رسائل Telegram المتقدم وقواعد التصفية'
                : 'Telegram Message Auto-Forwarder & Transformation Engine'}
            </p>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex items-center gap-2">
          {/* Engine Status Toggle */}
          <button
            onClick={onToggleService}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              isServiceActive
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'
            }`}
            title={isRtl ? 'تشغيل / إيقاف محرك المراقبة' : 'Start / Stop Service'}
          >
            {isServiceActive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Square className="w-3.5 h-3.5 fill-current" />
                <span className="hidden md:inline">
                  {isRtl ? 'المحرك نشط (إيقاف)' : 'Active (Stop)'}
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <Play className="w-3.5 h-3.5 fill-current" />
                <span className="hidden md:inline">
                  {isRtl ? 'المحرك متوقف (تشغيل)' : 'Stopped (Start)'}
                </span>
              </>
            )}
          </button>

          {/* Real Telegram API Live Connection Button */}
          <button
            onClick={onOpenRealTelegram}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">
              {isRtl ? 'اتصال Telegram الفعلي' : 'Real Telegram API'}
            </span>
          </button>

          {/* Test Message Simulator Button */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">
              {isRtl ? 'محاكي الرسائل' : 'Test Dispatcher'}
            </span>
          </button>

          {/* Android Source Code & APK Button */}
          <button
            onClick={onOpenCodeExporter}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">
              {isRtl ? 'كود أندرويد & APK' : 'Android Source & APK'}
            </span>
          </button>

          {/* View Mode Toggle (Phone / Desktop) */}
          <button
            onClick={onToggleViewMode}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
            title={
              viewMode === 'phone'
                ? isRtl ? 'عرض لوحة التحكم الكاملة' : 'Switch to Desktop Mode'
                : isRtl ? 'عرض محاكي هاتف أندرويد' : 'Switch to Phone Mockup'
            }
          >
            {viewMode === 'phone' ? (
              <Monitor className="w-4 h-4" />
            ) : (
              <Smartphone className="w-4 h-4" />
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700 text-xs font-semibold"
            title="تغيير اللغة / Toggle Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
