import React, { useState } from 'react';
import {
  X,
  Send,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Copy,
  Info,
} from 'lucide-react';
import { ForwardingRule, TelegramChat, TelegramMessageType } from '../types';
import { KeywordFilter, RegexFilter, MessageTypeFilter } from '../engine/filters';
import { TextTransformer } from '../engine/transform';

interface LiveSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: ForwardingRule[];
  chats: TelegramChat[];
  isRtl: boolean;
  onDispatchMessage: (msg: {
    sourceChatId: string;
    sourceChatName: string;
    text: string;
    messageType: TelegramMessageType;
    hasLinks: boolean;
  }) => void;
}

export const LiveSimulatorModal: React.FC<LiveSimulatorModalProps> = ({
  isOpen,
  onClose,
  rules,
  chats,
  isRtl,
  onDispatchMessage,
}) => {
  const [selectedSourceId, setSelectedSourceId] = useState<string>(chats[0]?.id || '');
  const [messageType, setMessageType] = useState<TelegramMessageType>('TEXT');
  const [hasLinks, setHasLinks] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>(
    'GOLD BUY NOW\nEntry: 2650.50\nSL: 2640.00\nTP: 2675.00\nJoin: https://t.me/spamlink'
  );

  const [testResult, setTestResult] = useState<any>(null);

  if (!isOpen) return null;

  const samplePresets = [
    {
      title: isRtl ? 'إشارة شراء ذهب (Forex Gold BUY)' : 'Forex Gold BUY Signal',
      type: 'TEXT' as TelegramMessageType,
      hasLinks: true,
      text: 'GOLD BUY NOW\nEntry: 2650.50\nSL: 2640.00\nTP1: 2665.00\nTP2: 2675.00\nJoin: https://t.me/spamvip',
    },
    {
      title: isRtl ? 'تنبيه عملات مشفرة (Crypto Call)' : 'Crypto Alpha Call',
      type: 'TEXT' as TelegramMessageType,
      hasLinks: false,
      text: 'BTC/USDT LONG ENTRY\nEntry range: 68500 - 68800\nTarget 1: 70000\nTarget 2: 72000\nStop: 67800',
    },
    {
      title: isRtl ? 'رسالة إعلانية يتم استبعادها (Promo Spam)' : 'Promo Message (Filter Test)',
      type: 'TEXT' as TelegramMessageType,
      hasLinks: true,
      text: '🔥 50% DISCOUNT SPECIAL PROMO! Best signals in the world. Subscribe now @vip_trader_admin',
    },
    {
      title: isRtl ? 'صورة مع تعليق (Photo with caption)' : 'Chart Screenshot with Caption',
      type: 'PHOTO' as TelegramMessageType,
      hasLinks: false,
      text: '[Chart Image] XAUUSD H4 Breakout confirmed above 2650 resistance.',
    },
  ];

  const applyPreset = (preset: typeof samplePresets[0]) => {
    setMessageText(preset.text);
    setMessageType(preset.type);
    setHasLinks(preset.hasLinks);
    setTestResult(null);
  };

  const handleRunEvaluation = () => {
    const selectedSource = chats.find((c) => c.id === selectedSourceId);
    const sourceName = selectedSource?.title || 'Unknown Source';

    // Find rules matching this source
    const matchedRules = rules.filter(
      (r) =>
        r.isEnabled &&
        (r.sourceChatIds.includes(selectedSourceId) || r.sourceChatIds.includes('*'))
    );

    const evaluations = matchedRules.map((rule) => {
      // 1. Media filter
      const typeFilter = new MessageTypeFilter(
        rule.allowTextOnly,
        rule.allowPhotos,
        rule.allowVideos,
        rule.allowDocuments,
        rule.allowAudio,
        rule.allowVoice,
        rule.allowLinks,
        rule.allowAlbums
      );
      const mediaResult = typeFilter.evaluate(messageType, hasLinks);

      // 2. Keyword filter
      const kwFilter = new KeywordFilter(
        rule.includeKeywords,
        rule.excludeKeywords,
        rule.matchAllKeywords,
        rule.caseSensitiveKeywords
      );
      const kwResult = kwFilter.evaluate(messageText);

      // 3. Regex filter
      const regexFilter = new RegexFilter(rule.regexPattern, rule.regexFlags);
      const regexResult = regexFilter.evaluate(messageText);

      const willPass = mediaResult.passed && kwResult.passed && regexResult.passed;

      // 4. Transform preview
      let transformedText = messageText;
      if (willPass) {
        const transformer = new TextTransformer({
          replacements: rule.transformations,
          prefixText: rule.prefixText,
          suffixText: rule.suffixText,
          removeLinks: rule.removeLinks,
          trimExtraLines: rule.trimExtraLines,
          removeCustomSignatures: rule.removeCustomSignatures,
          appendSourceTimestamp: rule.appendSourceTimestamp,
          sourceChannelTitle: sourceName,
        });
        transformedText = transformer.transform(messageText);
      }

      return {
        rule,
        willPass,
        mediaResult,
        kwResult,
        regexResult,
        transformedText,
      };
    });

    setTestResult({
      sourceName,
      evaluations,
    });
  };

  const handleDispatch = () => {
    const selectedSource = chats.find((c) => c.id === selectedSourceId);
    const sourceName = selectedSource?.title || 'Forex Channel';

    onDispatchMessage({
      sourceChatId: selectedSourceId,
      sourceChatName: sourceName,
      text: messageText,
      messageType,
      hasLinks,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {isRtl ? 'محاكي واختبار معالجة الرسائل اللحظية' : 'Live Telegram Message Simulator'}
              </h3>
              <p className="text-xs text-slate-400">
                {isRtl
                  ? 'اختبر قواعد التصفية والتحويل على رسائل حقيقية وتأكد من النتائج قبل الإرسال'
                  : 'Test your rules, regex, and transformations on real sample messages'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              {isRtl ? 'نماذج جاهزة للاختبار السريع:' : 'Quick Presets:'}
            </label>
            <div className="flex flex-wrap gap-2">
              {samplePresets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Source Selection & Message Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isRtl ? 'مصدر الرسالة (القناة أو المجموعة):' : 'Source Chat:'}
              </label>
              <select
                value={selectedSourceId}
                onChange={(e) => setSelectedSourceId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {chats.map((chat) => (
                  <option key={chat.id} value={chat.id}>
                    {chat.title} ({chat.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isRtl ? 'نوع الرسالة:' : 'Message Media Type:'}
              </label>
              <div className="flex gap-2">
                <select
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value as TelegramMessageType)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="TEXT">Text only</option>
                  <option value="PHOTO">Photo</option>
                  <option value="VIDEO">Video</option>
                  <option value="DOCUMENT">Document</option>
                  <option value="ALBUM">Album (Grouped)</option>
                </select>

                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasLinks}
                    onChange={(e) => setHasLinks(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{isRtl ? 'روابط' : 'Links'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Textarea */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {isRtl ? 'نص الرسالة الواردة:' : 'Incoming Message Content:'}
            </label>
            <textarea
              rows={5}
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                setTestResult(null);
              }}
              className="w-full bg-slate-950 font-mono text-xs border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Enter message text..."
            />
          </div>

          {/* Test Evaluation Result */}
          {testResult && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center justify-between">
                <span>{isRtl ? 'نتائج الفحص ومحاكاة المحرك:' : 'Engine Evaluation Breakdown:'}</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {testResult.evaluations.length}{' '}
                  {isRtl ? 'قواعد مطابقة للمصدر' : 'matching rule(s)'}
                </span>
              </h4>

              {testResult.evaluations.length === 0 ? (
                <p className="text-xs text-amber-400/90 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  {isRtl
                    ? 'لا توجد قواعد نشطة تستمع إلى هذه القناة حالياً.'
                    : 'No active rules are assigned to monitor this source chat.'}
                </p>
              ) : (
                testResult.evaluations.map((item: any, i: number) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border text-xs ${
                      item.willPass
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-rose-950/20 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold mb-1.5">
                      <span className="text-white">{item.rule.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.willPass
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {item.willPass
                          ? isRtl ? 'مقبولة للتوجيه' : 'ACCEPTED'
                          : isRtl ? 'مستبعدة بالفلاتر' : 'FILTERED OUT'}
                      </span>
                    </div>

                    {!item.willPass && (
                      <div className="text-[11px] text-rose-300/90 space-y-0.5">
                        {!item.mediaResult.passed && <div>• {item.mediaResult.reason}</div>}
                        {!item.kwResult.passed && <div>• {item.kwResult.reason}</div>}
                        {!item.regexResult.passed && <div>• {item.regexResult.reason}</div>}
                      </div>
                    )}

                    {item.willPass && (
                      <div className="mt-2 space-y-1">
                        <div className="text-[10px] uppercase font-semibold text-emerald-400">
                          {isRtl ? 'معاينة النص بعد التعديل:' : 'Transformed Text Preview:'}
                        </div>
                        <pre className="p-2 rounded bg-black/40 border border-slate-800 text-slate-200 font-mono text-[11px] whitespace-pre-wrap">
                          {item.transformedText}
                        </pre>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" />
                          <span>
                            {isRtl ? 'الوجهات:' : 'Destinations:'}{' '}
                            {item.rule.destinationChatNames.join(', ')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handleRunEvaluation}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isRtl ? 'فحص ومطابقة القواعد' : 'Test Filters & Rules'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              {isRtl ? 'إغلاق' : 'Close'}
            </button>
            <button
              onClick={handleDispatch}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isRtl ? 'إرسال للمحرك الحقيقي' : 'Dispatch to Live Engine'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
