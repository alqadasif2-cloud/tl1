import React, { useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { MessageProcessingLog, AppScreenId } from '../types';

interface ErrorDetailsScreenProps {
  log: MessageProcessingLog | null;
  onNavigate: (screen: AppScreenId) => void;
  onRetry: (log: MessageProcessingLog) => void;
  isRtl: boolean;
}

export const ErrorDetailsScreen: React.FC<ErrorDetailsScreenProps> = ({
  log,
  onNavigate,
  onRetry,
  isRtl,
}) => {
  const [copied, setCopied] = useState(false);

  if (!log) {
    return (
      <div className="p-6 text-center text-slate-400">
        <p>{isRtl ? 'لم يتم تحديد أي سجل' : 'No log selected'}</p>
        <button
          onClick={() => onNavigate('logs')}
          className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
        >
          {isRtl ? 'العودة للسجلات' : 'Back to Logs'}
        </button>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSuccess = log.processingStatus === 'SUCCESS';
  const isFailed = log.processingStatus === 'FAILED';
  const isFiltered = log.processingStatus === 'FILTERED_OUT';

  return (
    <div className="p-4 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('logs')}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
          <h2 className="text-sm font-bold text-white">
            {isRtl ? 'تفاصيل العملية والسجل' : 'Log Details & Trace'}
          </h2>
        </div>

        <button
          onClick={() => copyToClipboard(JSON.stringify(log, null, 2))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? (isRtl ? 'تم النسخ' : 'Copied!') : isRtl ? 'نسخ السجل' : 'Copy JSON'}</span>
        </button>
      </div>

      {/* Main Status Badge Card */}
      <div
        className={`p-4 rounded-2xl border ${
          isSuccess
            ? 'bg-emerald-950/20 border-emerald-500/30'
            : isFiltered
            ? 'bg-amber-950/20 border-amber-500/30'
            : 'bg-rose-950/20 border-rose-500/30'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {isFiltered && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {isFailed && <XCircle className="w-5 h-5 text-rose-400" />}
            <div>
              <h3 className="text-sm font-bold text-white">{log.ruleName}</h3>
              <p className="text-xs text-slate-400">
                {isRtl ? 'الحالة:' : 'Status:'}{' '}
                <span className="font-bold text-white">{log.processingStatus}</span>
              </p>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-400">
            <div>{new Date(log.createdAt).toLocaleTimeString()}</div>
            <div>{new Date(log.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Source & Destination Bar */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="truncate">
            <span className="text-slate-400">{isRtl ? 'المصدر:' : 'Source:'} </span>
            <span className="font-semibold text-indigo-300">{log.sourceChatName}</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0 mx-2" />
          <div className="truncate text-right">
            <span className="text-slate-400">{isRtl ? 'الوجهة:' : 'Dest:'} </span>
            <span className="font-semibold text-cyan-300">{log.destinationChatName}</span>
          </div>
        </div>
      </div>

      {/* Error / Filter Breakdown */}
      {(log.errorMessage || log.filterReason) && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
          <h4 className="font-bold text-white flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{log.errorMessage ? (isRtl ? 'رسالة الخطأ والسبب:' : 'Error Message:') : isRtl ? 'سبب الاستبعاد بالفلاتر:' : 'Filter Reason:'}</span>
          </h4>
          <p className="text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] leading-relaxed">
            {log.errorMessage || log.filterReason}
          </p>
          {log.errorStackTrace && (
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold mt-2 mb-1">
                {isRtl ? 'تتبع الخطأ البرمجي (Stack Trace):' : 'Exception Stack Trace:'}
              </div>
              <pre className="p-2 rounded bg-black/60 border border-slate-800 text-[10px] text-rose-300 font-mono overflow-x-auto whitespace-pre-wrap">
                {log.errorStackTrace}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Original vs Transformed Message Comparison */}
      <div className="space-y-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isRtl ? 'النص الأصلي من المصدر:' : 'Original Source Message:'}
          </div>
          <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs whitespace-pre-wrap">
            {log.originalPreview}
          </pre>
        </div>

        {log.transformedPreview && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              {isRtl ? 'النص بعد تطبيق قواعد التعديل (المرسل للوجهة):' : 'Transformed Message (Sent):'}
            </div>
            <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs whitespace-pre-wrap">
              {log.transformedPreview}
            </pre>
          </div>
        )}
      </div>

      {/* Retry Action */}
      <div className="pt-2">
        <button
          onClick={() => onRetry(log)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isRtl ? 'إعادة تجربة وتمرير الرسالة في المحاكي' : 'Retry in Simulator'}</span>
        </button>
      </div>
    </div>
  );
};
