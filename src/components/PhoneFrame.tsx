import React from 'react';
import { Wifi, BatteryMedium, Bell, Radio } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  isServiceActive: boolean;
  activeRulesCount: number;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  isServiceActive,
  activeRulesCount,
}) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex justify-center items-center py-4 px-2">
      {/* Outer Phone Shell */}
      <div className="relative w-full max-w-[420px] h-[840px] bg-slate-950 rounded-[44px] p-3 shadow-2xl shadow-cyan-950/40 border-4 border-slate-700/80 ring-1 ring-slate-800 flex flex-col overflow-hidden">
        {/* Dynamic Android Status Bar */}
        <div className="h-7 w-full flex items-center justify-between px-6 select-none text-[11px] font-semibold text-slate-300 z-30 shrink-0">
          <div className="flex items-center gap-1.5">
            <span>{currentTime}</span>
            {isServiceActive && (
              <span className="flex items-center gap-0.5 text-emerald-400 text-[10px] ml-1 bg-emerald-500/10 px-1 rounded border border-emerald-500/20" title="Foreground Service Running">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                <span>TF</span>
              </span>
            )}
          </div>

          {/* Camera Notch */}
          <div className="w-4 h-4 rounded-full bg-black ring-1 ring-slate-800/80 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 ring-1 ring-blue-900" />
          </div>

          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5" />
            <BatteryMedium className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Foreground Service Ongoing Notification Banner inside Android system */}
        {isServiceActive && (
          <div className="mx-2 mb-2 p-2 rounded-xl bg-slate-900/95 border border-cyan-500/30 text-xs shadow-md flex items-center justify-between gap-2 shrink-0 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-[11px] font-bold text-white truncate">
                  TForwarder Foreground Service
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  Monitoring {activeRulesCount} active rules in real-time
                </p>
              </div>
            </div>
            <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
              Active
            </span>
          </div>
        )}

        {/* Main Phone Screen Content Area */}
        <div className="flex-1 overflow-y-auto rounded-3xl bg-slate-950 flex flex-col relative text-slate-200">
          {children}
        </div>

        {/* Android Gesture Bar */}
        <div className="h-5 w-full flex items-center justify-center pt-1 shrink-0">
          <div className="w-32 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
