import React from 'react';
import {
  ArrowLeft,
  Bell,
  BatteryCharging,
  Shield,
  Moon,
  Globe,
  Sliders,
  Database,
  Trash2,
  ExternalLink,
  Info,
} from 'lucide-react';
import { AppScreenId } from '../types';

interface SettingsScreenProps {
  isServiceActive: boolean;
  onToggleService: () => void;
  lang: 'ar' | 'en';
  onToggleLang: () => void;
  onNavigate: (screen: AppScreenId) => void;
  onClearLogs: () => void;
  isRtl: boolean;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  isServiceActive,
  onToggleService,
  lang,
  onToggleLang,
  onNavigate,
  onClearLogs,
  isRtl,
}) => {
  return (
    <div className="p-4 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
          <h2 className="text-sm font-bold text-white">
            {isRtl ? 'الإعدادات والتشغيل المستمر' : 'Settings & Background Service'}
          </h2>
        </div>
      </div>

      {/* Foreground Service Settings */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white">
            {isRtl ? 'خدمة المراقبة في الخلفية (Foreground Service)' : 'Foreground Background Service'}
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {isRtl
            ? 'تضمن تشغيل محرك إعادة التوجيه بصورة مستمرة في نظام أندرويد مع إظهار إشعار دائم مطابق لقيود Android 14.'
            : 'Keeps the message monitoring engine running continuously in the background according to Android 14 requirements.'}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-200">
            {isRtl ? 'تفعيل خدمة المراقبة' : 'Enable Monitoring Service'}
          </span>
          <button
            onClick={onToggleService}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              isServiceActive ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                isServiceActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Battery Optimization Guidance (Requirement #11) */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <BatteryCharging className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-white">
            {isRtl ? 'استثناءات تحسين البطارية (Battery Optimization)' : 'Battery Optimization Exceptions'}
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {isRtl
            ? 'تغلق بعض الشركات (Samsung, Xiaomi, Huawei) التطبيقات في الخلفية لتوفير البطارية. لضمان عدم توقف التوجيه:'
            : 'Modern Android vendors aggressively kill background tasks. To keep the forwarder alive 24/7:'}
        </p>
        <div className="space-y-1.5 text-[11px] text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div>• <b>Samsung:</b> Settings → Apps → TForwarder → Battery → Unrestricted.</div>
          <div>• <b>Xiaomi (MIUI/HyperOS):</b> App Info → Autostart (Enable) → No restrictions.</div>
          <div>• <b>Huawei:</b> Settings → Battery → App Launch → Manage Manually.</div>
          <div>• <b>Google Pixel:</b> Settings → Apps → App battery usage → Unrestricted.</div>
        </div>
      </div>

      {/* Language & UI Preferences */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white">
            {isRtl ? 'لغة الواجهة وتجربة الاستخدام' : 'Language & Display'}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-300">
            {isRtl ? 'اللغة الحالية (عربي / English):' : 'Current Language:'}
          </span>
          <button
            onClick={onToggleLang}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-white hover:bg-slate-700"
          >
            {lang === 'ar' ? 'العربية (RTL)' : 'English (LTR)'}
          </button>
        </div>
      </div>

      {/* Storage and Cleanup */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-rose-400" />
          <h3 className="text-xs font-bold text-white">
            {isRtl ? 'إدارة التخزين وقاعدة البيانات' : 'Storage & Database'}
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          {isRtl
            ? 'يتم تخزين السجلات في قاعدة بيانات Room المحلية. يتم حذف السجلات القديمة تلقائيًا بعد 30 يومًا.'
            : 'Logs and rule states are persisted locally. Auto-purged after 30 days.'}
        </p>

        <button
          onClick={() => {
            if (window.confirm(isRtl ? 'هل تريد مسح جميع السجلات؟' : 'Clear all logs?')) {
              onClearLogs();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold hover:bg-rose-500/20 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{isRtl ? 'تفريغ سجل العمليات الآن' : 'Clear Processing Logs'}</span>
        </button>
      </div>
    </div>
  );
};
