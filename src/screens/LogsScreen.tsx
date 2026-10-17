import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Copy,
  Clock,
  Layers,
} from 'lucide-react';
import { MessageProcessingLog, ProcessingStatus, AppScreenId } from '../types';

interface LogsScreenProps {
  logs: MessageProcessingLog[];
  onClearLogs: () => void;
  onSelectLog: (log: MessageProcessingLog) => void;
  onNavigate: (screen: AppScreenId) => void;
  isRtl: boolean;
}

export const LogsScreen: React.FC<LogsScreenProps> = ({
  logs,
  onClearLogs,
  onSelectLog,
  onNavigate,
  isRtl,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (statusFilter !== 'ALL' && log.processingStatus !== statusFilter) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const inText = log.originalPreview.toLowerCase().includes(term);
      const inRule = log.ruleName.toLowerCase().includes(term);
      const inSource = log.sourceChatName.toLowerCase().includes(term);
      const inDest = log.destinationChatName.toLowerCase().includes(term);
      const inError = (log.errorMessage || '').toLowerCase().includes(term);
      if (!inText && !inRule && !inSource && !inDest && !inError) return false;
    }
    return true;
  });

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
            {isRtl ? 'سجل العمليات والأخطاء' : 'Execution & Error Logs'}
          </h2>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 font-semibold">
            {logs.length}
          </span>
        </div>

        {logs.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm(isRtl ? 'هل تريد مسح سجل العمليات؟' : 'Clear all logs?')) {
                onClearLogs();
              }
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
            statusFilter === 'ALL'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          {isRtl ? 'الكل' : 'All'} ({logs.length})
        </button>
        <button
          onClick={() => setStatusFilter('SUCCESS')}
          className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
            statusFilter === 'SUCCESS'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 text-emerald-400/80 border border-slate-800 hover:bg-slate-850'
          }`}
        >
          {isRtl ? 'الناجحة' : 'Success'} ({logs.filter((l) => l.processingStatus === 'SUCCESS').length})
        </button>
        <button
          onClick={() => setStatusFilter('FILTERED_OUT')}
          className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
            statusFilter === 'FILTERED_OUT'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-900 text-amber-400/80 border border-slate-800 hover:bg-slate-850'
          }`}
        >
          {isRtl ? 'مستبعدة بالفلاتر' : 'Filtered'} ({logs.filter((l) => l.processingStatus === 'FILTERED_OUT').length})
        </button>
        <button
          onClick={() => setStatusFilter('FAILED')}
          className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
            statusFilter === 'FAILED'
              ? 'bg-rose-600 text-white'
              : 'bg-slate-900 text-rose-400/80 border border-slate-800 hover:bg-slate-850'
          }`}
        >
          {isRtl ? 'فاشلة' : 'Failed'} ({logs.filter((l) => l.processingStatus === 'FAILED').length})
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute top-3 left-3 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={isRtl ? 'بحث في السجلات بالنص أو الخطأ...' : 'Search logs by message, rule, or error...'}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Logs List */}
      <div className="space-y-2.5">
        {filteredLogs.map((log) => {
          const isSuccess = log.processingStatus === 'SUCCESS';
          const isFiltered = log.processingStatus === 'FILTERED_OUT';
          const isFailed = log.processingStatus === 'FAILED';

          return (
            <div
              key={log.id}
              onClick={() => onSelectLog(log)}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-2 text-xs"
            >
              {/* Header: Rule name, Status badge, Timestamp */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {isFiltered && <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />}
                  {isFailed && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  <span className="font-bold text-white truncate">{log.ruleName}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      isSuccess
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isFiltered
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {log.processingStatus}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Source -> Destination */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="truncate max-w-[130px] text-indigo-300 font-medium">
                  {log.sourceChatName}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                <span className="truncate max-w-[130px] text-cyan-300 font-medium">
                  {log.destinationChatName}
                </span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400 ml-auto uppercase font-semibold">
                  {log.messageType}
                </span>
              </div>

              {/* Content preview */}
              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-850 font-mono text-[11px] text-slate-300 line-clamp-2">
                {log.originalPreview}
              </div>

              {/* Filter reason or error explanation */}
              {isFiltered && log.filterReason && (
                <div className="text-[11px] text-amber-300/90 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{log.filterReason}</span>
                </div>
              )}

              {isFailed && log.errorMessage && (
                <div className="text-[11px] text-rose-300 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{log.errorMessage}</span>
                </div>
              )}
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
            {isRtl ? 'لا توجد سجلات تطابق البحث' : 'No logs match your filter criteria.'}
          </div>
        )}
      </div>
    </div>
  );
};
