import React from 'react';
import {
  Play,
  Square,
  ShieldCheck,
  Radio,
  Send,
  Sliders,
  FileText,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Code2,
} from 'lucide-react';
import {
  ForwardingRule,
  MessageProcessingLog,
  TelegramAuthState,
  AppScreenId,
} from '../types';

interface DashboardScreenProps {
  rules: ForwardingRule[];
  logs: MessageProcessingLog[];
  auth: TelegramAuthState;
  isServiceActive: boolean;
  onToggleService: () => void;
  onNavigate: (screen: AppScreenId) => void;
  onOpenSimulator: () => void;
  onSelectLog: (log: MessageProcessingLog) => void;
  isRtl: boolean;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  rules,
  logs,
  auth,
  isServiceActive,
  onToggleService,
  onNavigate,
  onOpenSimulator,
  onSelectLog,
  isRtl,
}) => {
  const activeRulesCount = rules.filter((r) => r.isEnabled).length;
  const totalProcessed = logs.length;
  const successCount = logs.filter((l) => l.processingStatus === 'SUCCESS').length;
  const filteredCount = logs.filter((l) => l.processingStatus === 'FILTERED_OUT').length;
  const failedCount = logs.filter((l) => l.processingStatus === 'FAILED').length;

  const lastSuccessfulLog = logs.find((l) => l.processingStatus === 'SUCCESS');
  const lastProcessedTime = logs[0]?.createdAt
    ? new Date(logs[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div className="p-4 space-y-4">
      {/* Telegram Account & Connection Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-bold text-white text-sm">
                {auth.userFirstName ? auth.userFirstName[0].toUpperCase() : 'T'}
              </div>
            </div>
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                auth.isAuthorized ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white truncate">
                {auth.userFirstName
                  ? `${auth.userFirstName} ${auth.userLastName || ''}`
                  : isRtl ? 'حساب تيليجرام نشط' : 'Telegram Account'}
              </h2>
              {auth.isAuthorized && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-semibold border border-emerald-500/20">
                  {isRtl ? 'متصل' : 'Connected'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">
              {auth.phoneNumber || '+971 50 123 4567'} • @{auth.username || 'user'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onNavigate('real_telegram')}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 transition-colors"
          >
            {isRtl ? '⚡ اتصال فعلي بـ API' : '⚡ Connect Real API'}
          </button>
          <button
            onClick={() => onNavigate('account_info')}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            {isRtl ? 'الحساب' : 'Manage'}
          </button>
        </div>
      </div>

      {/* Real-time Engine Banner with Toggle */}
      <div
        className={`rounded-2xl p-4 border transition-all ${
          isServiceActive
            ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/30'
            : 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/30'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isServiceActive
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {isServiceActive ? (
                <Radio className="w-5 h-5 animate-pulse" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  {isServiceActive
                    ? isRtl ? 'محرك المراقبة والتوجيه قيد العمل' : 'Forwarding Service is Active'
                    : isRtl ? 'محرك المراقبة متوقف حالياً' : 'Forwarding Service is Paused'}
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                {isServiceActive
                  ? isRtl
                    ? `يعمل كـ Foreground Service في الخلفية لمراقبة ${activeRulesCount} قواعد`
                    : `Foreground Service running with ${activeRulesCount} active rules`
                  : isRtl
                  ? 'الرسائل الواردة لن يتم توجيهها تلقائياً'
                  : 'Incoming messages will not be auto-forwarded'}
              </p>
            </div>
          </div>

          <button
            onClick={onToggleService}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-md ${
              isServiceActive
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            {isServiceActive ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{isRtl ? 'إيقاف' : 'Pause'}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRtl ? 'تشغيل' : 'Start'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {isRtl ? 'القواعد النشطة' : 'Active Rules'}
          </div>
          <div className="text-lg font-bold text-white mt-1">
            {activeRulesCount}{' '}
            <span className="text-xs font-normal text-slate-500">/ {rules.length}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {isRtl ? 'المعالجة' : 'Processed'}
          </div>
          <div className="text-lg font-bold text-cyan-400 mt-1">{totalProcessed}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {isRtl ? 'تم التوجيه بنجاح' : 'Forwarded'}
          </div>
          <div className="text-lg font-bold text-emerald-400 mt-1">{successCount}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {isRtl ? 'أخطاء / استبعاد' : 'Filtered / Fail'}
          </div>
          <div className="text-lg font-bold text-amber-400 mt-1">
            {filteredCount}{' '}
            <span className="text-xs font-normal text-rose-400">({failedCount})</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="flex gap-2">
        <button
          onClick={() => onNavigate('rule_wizard')}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs py-2.5 px-3 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all"
        >
          <Layers className="w-4 h-4" />
          <span>{isRtl ? '+ إنشاء قاعدة جديدة' : '+ Create Forwarding Rule'}</span>
        </button>

        <button
          onClick={onOpenSimulator}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2.5 px-3 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{isRtl ? 'محاكاة رسالة' : 'Test Signal'}</span>
        </button>
      </div>

      {/* Main Navigation Modules */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onNavigate('rules')}
          className="bg-slate-900 hover:bg-slate-800/90 border border-slate-800 rounded-xl p-3 text-left transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {isRtl ? 'قواعد التوجيه' : 'Forwarding Rules'}
              </div>
              <div className="text-[11px] text-slate-400">{rules.length} {isRtl ? 'قاعدة' : 'rules'}</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          onClick={() => onNavigate('logs')}
          className="bg-slate-900 hover:bg-slate-800/90 border border-slate-800 rounded-xl p-3 text-left transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {isRtl ? 'سجل العمليات' : 'Processing Logs'}
              </div>
              <div className="text-[11px] text-slate-400">{logs.length} {isRtl ? 'سجل' : 'entries'}</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          onClick={() => onNavigate('sources')}
          className="bg-slate-900 hover:bg-slate-800/90 border border-slate-800 rounded-xl p-3 text-left transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {isRtl ? 'المصادر والوجهات' : 'Sources & Channels'}
              </div>
              <div className="text-[11px] text-slate-400">{isRtl ? 'إدارة القنوات' : 'Manage Chats'}</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
        </button>

        <button
          onClick={() => onNavigate('code_exporter')}
          className="bg-slate-900 hover:bg-slate-800/90 border border-slate-800 rounded-xl p-3 text-left transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {isRtl ? 'كود Kotlin & APK' : 'Android Kotlin APK'}
              </div>
              <div className="text-[11px] text-slate-400">{isRtl ? 'تحميل المشروع' : 'Download ZIP'}</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>

      {/* Recent Processing Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-white">
              {isRtl ? 'آخر العمليات المسجلة في قاعدة Room' : 'Recent Processing Operations'}
            </h4>
          </div>
          <button
            onClick={() => onNavigate('logs')}
            className="text-[11px] font-semibold text-blue-400 hover:text-blue-300"
          >
            {isRtl ? 'عرض الكل' : 'View all'}
          </button>
        </div>

        <div className="space-y-2">
          {logs.slice(0, 3).map((log) => (
            <div
              key={log.id}
              onClick={() => onSelectLog(log)}
              className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors text-xs"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 truncate">
                  {log.processingStatus === 'SUCCESS' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  {log.processingStatus === 'FILTERED_OUT' && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  )}
                  {log.processingStatus === 'FAILED' && (
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  )}
                  <span className="font-semibold text-white truncate">{log.ruleName}</span>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 font-mono">
                {log.originalPreview}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
