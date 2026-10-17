import React from 'react';
import {
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
  Copy,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { ForwardingRule, AppScreenId } from '../types';

interface RulesScreenProps {
  rules: ForwardingRule[];
  onToggleRule: (ruleId: string) => void;
  onDeleteRule: (ruleId: string) => void;
  onEditRule: (rule: ForwardingRule) => void;
  onNavigate: (screen: AppScreenId) => void;
  onOpenSimulator: () => void;
  isRtl: boolean;
}

export const RulesScreen: React.FC<RulesScreenProps> = ({
  rules,
  onToggleRule,
  onDeleteRule,
  onEditRule,
  onNavigate,
  onOpenSimulator,
  isRtl,
}) => {
  return (
    <div className="p-4 space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
          <h2 className="text-sm font-bold text-white">
            {isRtl ? 'قواعد إعادة التوجيه' : 'Forwarding Rules'}
          </h2>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 font-semibold">
            {rules.length}
          </span>
        </div>

        <button
          onClick={() => onNavigate('rule_wizard')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isRtl ? 'قاعدة جديدة' : 'New Rule'}</span>
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-4 rounded-2xl border transition-all ${
              rule.isEnabled
                ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                : 'bg-slate-900/60 border-slate-800/60 opacity-75'
            }`}
          >
            {/* Title & Enable Switch */}
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white truncate">{rule.name}</h3>
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      rule.forwardingMode === 'NATIVE_FORWARD'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    }`}
                  >
                    {rule.forwardingMode === 'NATIVE_FORWARD'
                      ? isRtl ? 'توجيه أصلي' : 'Native Forward'
                      : isRtl ? 'نسخ وتعديل' : 'Copy Content'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <span className="truncate max-w-[140px] text-indigo-300 font-medium">
                    {rule.sourceChatNames.join(', ')}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate max-w-[140px] text-cyan-300 font-medium">
                    {rule.destinationChatNames.join(', ')}
                  </span>
                </div>
              </div>

              {/* Status Toggle Button */}
              <button
                onClick={() => onToggleRule(rule.id)}
                className={`p-1.5 rounded-xl border transition-all shrink-0 ${
                  rule.isEnabled
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
                title={rule.isEnabled ? 'Disable Rule' : 'Enable Rule'}
              >
                {rule.isEnabled ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
              </button>
            </div>

            {/* Filter Tags Summary */}
            <div className="flex flex-wrap items-center gap-1.5 my-2">
              {rule.includeKeywords.length > 0 && (
                <span className="text-[10px] bg-slate-800 text-indigo-300 px-2 py-0.5 rounded-md border border-slate-700">
                  {isRtl ? 'تضمين:' : 'Include:'} {rule.includeKeywords.join(', ')}
                </span>
              )}
              {rule.excludeKeywords.length > 0 && (
                <span className="text-[10px] bg-slate-800 text-rose-300 px-2 py-0.5 rounded-md border border-slate-700">
                  {isRtl ? 'استبعاد:' : 'Exclude:'} {rule.excludeKeywords.join(', ')}
                </span>
              )}
              {rule.regexPattern && (
                <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded-md border border-slate-700 font-mono">
                  Regex: {rule.regexPattern.slice(0, 20)}...
                </span>
              )}
              {rule.transformations.length > 0 && (
                <span className="text-[10px] bg-slate-800 text-emerald-300 px-2 py-0.5 rounded-md border border-slate-700">
                  {rule.transformations.length} {isRtl ? 'استبدالات' : 'transforms'}
                </span>
              )}
            </div>

            {/* Stats row & Actions */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-3 text-[11px]">
                <span>
                  {isRtl ? 'تمت المعالجة:' : 'Processed:'}{' '}
                  <b className="text-white">{rule.totalProcessedCount}</b>
                </span>
                <span>
                  {isRtl ? 'نجاح:' : 'Success:'}{' '}
                  <b className="text-emerald-400">{rule.totalForwardedCount}</b>
                </span>
                {rule.totalFailedCount > 0 && (
                  <span>
                    {isRtl ? 'فشل:' : 'Fail:'}{' '}
                    <b className="text-rose-400">{rule.totalFailedCount}</b>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenSimulator}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                  title="Test rule with simulator"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onEditRule(rule)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Edit Rule"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteRule(rule.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Delete Rule"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {rules.length === 0 && (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400">
            <Layers className="w-8 h-8 mx-auto mb-2 text-slate-500" />
            <p className="font-semibold text-white text-sm">
              {isRtl ? 'لا توجد قواعد توجيه مضافة بعد' : 'No Forwarding Rules Yet'}
            </p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              {isRtl
                ? 'أنشئ قاعدتك الأولى لمراقبة قنوات التوصيات وإعادة توجيهها تلقائياً'
                : 'Create your first rule to automatically forward messages between chats'}
            </p>
            <button
              onClick={() => onNavigate('rule_wizard')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              {isRtl ? '+ إنشاء قاعدة جديدة' : '+ Create Rule'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
