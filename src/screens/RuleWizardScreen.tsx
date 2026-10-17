import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Sparkles,
  Layers,
  Radio,
  Send,
  Plus,
  Trash2,
  AlertCircle,
  Code,
  FileText,
} from 'lucide-react';
import {
  ForwardingMode,
  ForwardingRule,
  ReplacementRule,
  TelegramChat,
  TelegramMessageType,
  AppScreenId,
} from '../types';
import { KeywordFilter, RegexFilter, MessageTypeFilter } from '../engine/filters';
import { TextTransformer } from '../engine/transform';

interface RuleWizardScreenProps {
  chats: TelegramChat[];
  onSaveRule: (rule: ForwardingRule) => void;
  onNavigate: (screen: AppScreenId) => void;
  isRtl: boolean;
  initialRule?: ForwardingRule | null;
}

export const RuleWizardScreen: React.FC<RuleWizardScreenProps> = ({
  chats,
  onSaveRule,
  onNavigate,
  isRtl,
  initialRule,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Wizard State
  const [ruleName, setRuleName] = useState<string>(
    initialRule?.name || (isRtl ? 'قاعدة توجيه جديدة' : 'New Forwarding Rule')
  );
  const [selectedSources, setSelectedSources] = useState<string[]>(
    initialRule?.sourceChatIds || [chats[0]?.id || '']
  );
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
    initialRule?.destinationChatIds || [chats[1]?.id || '']
  );

  // Step 4: Media types
  const [allowTextOnly, setAllowTextOnly] = useState(initialRule?.allowTextOnly ?? true);
  const [allowPhotos, setAllowPhotos] = useState(initialRule?.allowPhotos ?? true);
  const [allowVideos, setAllowVideos] = useState(initialRule?.allowVideos ?? false);
  const [allowDocuments, setAllowDocuments] = useState(initialRule?.allowDocuments ?? false);
  const [allowAudio, setAllowAudio] = useState(initialRule?.allowAudio ?? false);
  const [allowVoice, setAllowVoice] = useState(initialRule?.allowVoice ?? false);
  const [allowLinks, setAllowLinks] = useState(initialRule?.allowLinks ?? true);
  const [allowAlbums, setAllowAlbums] = useState(initialRule?.allowAlbums ?? true);

  // Step 5: Keywords & Regex
  const [includeKeywordsInput, setIncludeKeywordsInput] = useState<string>(
    initialRule?.includeKeywords.join(', ') || ''
  );
  const [excludeKeywordsInput, setExcludeKeywordsInput] = useState<string>(
    initialRule?.excludeKeywords.join(', ') || ''
  );
  const [matchAllKeywords, setMatchAllKeywords] = useState(initialRule?.matchAllKeywords ?? false);
  const [caseSensitiveKeywords, setCaseSensitiveKeywords] = useState(initialRule?.caseSensitiveKeywords ?? false);
  const [regexPattern, setRegexPattern] = useState(initialRule?.regexPattern || '');
  const [regexFlags, setRegexFlags] = useState(initialRule?.regexFlags || 'i');

  // Step 6: Transformations
  const [transformations, setTransformations] = useState<ReplacementRule[]>(
    initialRule?.transformations || [
      {
        id: '1',
        findText: 'GOLD',
        replaceWith: 'XAUUSD',
        type: 'EXACT_WORD',
        isCaseSensitive: false,
        isEnabled: true,
      },
    ]
  );
  const [prefixText, setPrefixText] = useState(initialRule?.prefixText || '');
  const [suffixText, setSuffixText] = useState(initialRule?.suffixText || '');
  const [removeLinks, setRemoveLinks] = useState(initialRule?.removeLinks ?? false);
  const [trimExtraLines, setTrimExtraLines] = useState(initialRule?.trimExtraLines ?? true);
  const [removeSignaturesInput, setRemoveSignaturesInput] = useState(
    initialRule?.removeCustomSignatures.join(', ') || ''
  );
  const [appendSourceTimestamp, setAppendSourceTimestamp] = useState(
    initialRule?.appendSourceTimestamp ?? false
  );

  // Step 7: Mode
  const [forwardingMode, setForwardingMode] = useState<ForwardingMode>(
    initialRule?.forwardingMode || 'COPY_CONTENT'
  );

  // Step 8: Live Test state
  const [testSampleText, setTestSampleText] = useState<string>(
    'GOLD BUY NOW\nEntry: 2650.50\nSL: 2640.00\nTP: 2675.00\nJoin: https://t.me/spamchannel'
  );
  const [testResult, setTestResult] = useState<any>(null);

  const stepsList = [
    { num: 1, title: isRtl ? 'اسم القاعدة' : 'Rule Name' },
    { num: 2, title: isRtl ? 'المصدر' : 'Source' },
    { num: 3, title: isRtl ? 'الوجهة' : 'Destination' },
    { num: 4, title: isRtl ? 'الوسائط' : 'Media' },
    { num: 5, title: isRtl ? 'الفلاتر' : 'Filters' },
    { num: 6, title: isRtl ? 'تعديل النص' : 'Transform' },
    { num: 7, title: isRtl ? 'الوضع' : 'Mode' },
    { num: 8, title: isRtl ? 'الاختبار' : 'Live Test' },
    { num: 9, title: isRtl ? 'المراجعة' : 'Review' },
    { num: 10, title: isRtl ? 'الحفظ' : 'Activate' },
  ];

  const handleAddTransformation = () => {
    setTransformations((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        findText: '',
        replaceWith: '',
        type: 'EXACT_WORD',
        isCaseSensitive: false,
        isEnabled: true,
      },
    ]);
  };

  const handleRemoveTransformation = (id: string) => {
    setTransformations((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateTransformation = (id: string, updates: Partial<ReplacementRule>) => {
    setTransformations((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const runLiveTest = () => {
    const incKws = includeKeywordsInput
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    const excKws = excludeKeywordsInput
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const kwFilter = new KeywordFilter(incKws, excKws, matchAllKeywords, caseSensitiveKeywords);
    const kwRes = kwFilter.evaluate(testSampleText);

    const rgFilter = new RegexFilter(regexPattern, regexFlags);
    const rgRes = rgFilter.evaluate(testSampleText);

    const willPass = kwRes.passed && rgRes.passed;

    let transformed = testSampleText;
    if (willPass) {
      const transformer = new TextTransformer({
        replacements: transformations,
        prefixText,
        suffixText,
        removeLinks,
        trimExtraLines,
        removeCustomSignatures: removeSignaturesInput.split(',').map((s) => s.trim()),
        appendSourceTimestamp,
        sourceChannelTitle: 'Forex Channel',
      });
      transformed = transformer.transform(testSampleText);
    }

    setTestResult({
      willPass,
      kwRes,
      rgRes,
      transformed,
    });
  };

  const handleSave = () => {
    const sourceNames = selectedSources
      .map((id) => chats.find((c) => c.id === id)?.title || id)
      .filter(Boolean);
    const destinationNames = selectedDestinations
      .map((id) => chats.find((c) => c.id === id)?.title || id)
      .filter(Boolean);

    const newRule: ForwardingRule = {
      id: initialRule?.id || `rule-${Date.now()}`,
      name: ruleName.trim() || (isRtl ? 'قاعدة توجيه' : 'Forwarding Rule'),
      isEnabled: true,
      sourceChatIds: selectedSources,
      destinationChatIds: selectedDestinations,
      sourceChatNames: sourceNames,
      destinationChatNames: destinationNames,
      includeKeywords: includeKeywordsInput
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 0),
      excludeKeywords: excludeKeywordsInput
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 0),
      matchAllKeywords,
      caseSensitiveKeywords,
      regexPattern: regexPattern.trim(),
      regexFlags,
      allowTextOnly,
      allowPhotos,
      allowVideos,
      allowDocuments,
      allowAudio,
      allowVoice,
      allowLinks,
      allowAlbums,
      transformations,
      prefixText,
      suffixText,
      removeLinks,
      trimExtraLines,
      removeCustomSignatures: removeSignaturesInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
      appendSourceTimestamp,
      forwardingMode,
      createdAt: initialRule?.createdAt || Date.now(),
      updatedAt: Date.now(),
      lastSuccessfulExecution: initialRule?.lastSuccessfulExecution || null,
      totalProcessedCount: initialRule?.totalProcessedCount || 0,
      totalForwardedCount: initialRule?.totalForwardedCount || 0,
      totalFailedCount: initialRule?.totalFailedCount || 0,
    };

    onSaveRule(newRule);
    onNavigate('rules');
  };

  return (
    <div className="p-4 space-y-4">
      {/* Top Bar with Step Progress */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (currentStep > 1) setCurrentStep((s) => s - 1);
            else onNavigate('rules');
          }}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
        >
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
        </button>

        <div className="text-center">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
            {isRtl ? `الخطوة ${currentStep} من 10` : `Step ${currentStep} of 10`}
          </span>
          <h2 className="text-sm font-bold text-white">
            {stepsList[currentStep - 1]?.title}
          </h2>
        </div>

        <button
          onClick={() => onNavigate('rules')}
          className="text-xs text-slate-400 hover:text-white font-medium"
        >
          {isRtl ? 'إلغاء' : 'Cancel'}
        </button>
      </div>

      {/* Progress Pills */}
      <div className="grid grid-cols-10 gap-1">
        {stepsList.map((step) => (
          <div
            key={step.num}
            onClick={() => setCurrentStep(step.num)}
            className={`h-1.5 rounded-full cursor-pointer transition-all ${
              step.num === currentStep
                ? 'bg-cyan-400 ring-2 ring-cyan-500/30'
                : step.num < currentStep
                ? 'bg-blue-600'
                : 'bg-slate-800'
            }`}
            title={step.title}
          />
        ))}
      </div>

      {/* Step Content Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl min-h-[360px] flex flex-col justify-between">
        {/* Step 1: Rule Name */}
        {currentStep === 1 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">
              {isRtl ? 'الخطوة 1: أدخل اسمًا مميزًا للقاعدة' : 'Step 1: Enter Rule Name'}
            </h3>
            <p className="text-xs text-slate-400">
              {isRtl
                ? 'اختر اسمًا يوضح الغرض من القاعدة، مثل: "توصيات الذهب فوركس" أو "صفقات الكريبتو"'
                : 'Choose a descriptive name for this forwarding rule.'}
            </p>
            <input
              type="text"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder={isRtl ? 'مثال: إشارات الذهب VIP' : 'e.g. Gold VIP Signals'}
            />
          </div>
        )}

        {/* Step 2: Source selection */}
        {currentStep === 2 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">
              {isRtl ? 'الخطوة 2: اختر القناة أو المجموعة المصدر' : 'Step 2: Select Source Chat(s)'}
            </h3>
            <p className="text-xs text-slate-400">
              {isRtl
                ? 'القنوات والمجموعات التي يستمع إليها حسابك لاستقبال الرسائل الجديدة'
                : 'Chats where incoming messages will be monitored in real-time.'}
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {chats.map((chat) => {
                const isSelected = selectedSources.includes(chat.id);
                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      if (isSelected) {
                        if (selectedSources.length > 1) {
                          setSelectedSources(selectedSources.filter((id) => id !== chat.id));
                        }
                      } else {
                        setSelectedSources([...selectedSources, chat.id]);
                      }
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs">{chat.title}</div>
                      <div className="text-[10px] text-slate-400">
                        {chat.type} • {chat.memberCount.toLocaleString()} {isRtl ? 'عضو' : 'members'}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Destination selection */}
        {currentStep === 3 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">
              {isRtl ? 'الخطوة 3: اختر وجهة إعادة التوجيه' : 'Step 3: Select Destination Chat(s)'}
            </h3>
            <p className="text-xs text-slate-400">
              {isRtl
                ? 'اختر القناة أو المجموعة التي تملك فيها صلاحية إرسال الرسائل'
                : 'Target chat where processed messages will be sent.'}
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {chats.map((chat) => {
                const isSelected = selectedDestinations.includes(chat.id);
                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      if (isSelected) {
                        if (selectedDestinations.length > 1) {
                          setSelectedDestinations(selectedDestinations.filter((id) => id !== chat.id));
                        }
                      } else {
                        setSelectedDestinations([...selectedDestinations, chat.id]);
                      }
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-600/15 border-cyan-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs flex items-center gap-1.5">
                        <span>{chat.title}</span>
                        {chat.canPostMessages && (
                          <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.2 rounded font-bold">
                            {isRtl ? 'صلاحية الإرسال متاحة' : 'Posting Allowed'}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">ID: {chat.id}</div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Allowed media types */}
        {currentStep === 4 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">
              {isRtl ? 'الخطوة 4: أنواع الرسائل والوسائط المقبولة' : 'Step 4: Permitted Message Types'}
            </h3>
            <p className="text-xs text-slate-400">
              {isRtl
                ? 'حدد الوسائط التي تسمح القاعدة بإعادة توجيهها واستبعد غير المرغوب به'
                : 'Toggle which media formats should be forwarded.'}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowTextOnly}
                  onChange={(e) => setAllowTextOnly(e.target.checked)}
                  className="rounded text-cyan-500"
                />
                <span>{isRtl ? 'رسائل نصية' : 'Text Messages'}</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowPhotos}
                  onChange={(e) => setAllowPhotos(e.target.checked)}
                  className="rounded text-cyan-500"
                />
                <span>{isRtl ? 'الصور' : 'Photos'}</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowVideos}
                  onChange={(e) => setAllowVideos(e.target.checked)}
                  className="rounded text-cyan-500"
                />
                <span>{isRtl ? 'الفيديوهات' : 'Videos'}</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDocuments}
                  onChange={(e) => setAllowDocuments(e.target.checked)}
                  className="rounded text-cyan-500"
                />
                <span>{isRtl ? 'الملفات والمستندات' : 'Documents'}</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowLinks}
                  onChange={(e) => setAllowLinks(e.target.checked)}
                  className="rounded text-cyan-500"
                />
                <span>{isRtl ? 'الرسائل الحاوية على روابط' : 'Messages with Links'}</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowAlbums}
                  onChange={(e) => setAllowAlbums(e.target.checked)}
                  className="rounded text-cyan-500"
                />
                <span>{isRtl ? 'ألبومات الصور المجمعة' : 'Grouped Albums'}</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 5: Keywords & Regex Filters */}
        {currentStep === 5 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">
              {isRtl ? 'الخطوة 5: الكلمات المفتاحية وفلاتر Regex' : 'Step 5: Keyword & Regex Filters'}
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isRtl ? 'كلمات التضمين (مفصولة بفاصلة):' : 'Include Keywords (comma-separated):'}
              </label>
              <input
                type="text"
                value={includeKeywordsInput}
                onChange={(e) => setIncludeKeywordsInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                placeholder="BUY, SELL, ENTRY, TP"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isRtl ? 'كلمات الاستبعاد (استبعاد الإعلانات):' : 'Exclude Keywords (e.g. ads/spam):'}
              </label>
              <input
                type="text"
                value={excludeKeywordsInput}
                onChange={(e) => setExcludeKeywordsInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                placeholder="SCAM, PROMO, DISCOUNT"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {isRtl ? 'تعبير نمطي Regular Expression (اختياري):' : 'Regex Pattern (Optional):'}
              </label>
              <input
                type="text"
                value={regexPattern}
                onChange={(e) => setRegexPattern(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-cyan-300 font-mono"
                placeholder="\\b(BUY|SELL)\\s+[A-Z0-9]+\\b"
              />
            </div>
          </div>
        )}

        {/* Step 6: Text Transformations */}
        {currentStep === 6 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isRtl ? 'الخطوة 6: قواعد تعديل النصوص' : 'Step 6: Text Transformation Pipeline'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isRtl ? 'استبدال كلمات أو عبارات قبل إرسالها للوجهة' : 'Replace terms or cleanup text'}
                </p>
              </div>
              <button
                onClick={handleAddTransformation}
                className="text-xs px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRtl ? 'إضافة استبدال' : 'Add Rule'}</span>
              </button>
            </div>

            {/* Replacements List */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {transformations.map((t) => (
                <div key={t.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={t.findText}
                    onChange={(e) => handleUpdateTransformation(t.id, { findText: e.target.value })}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    placeholder="Find (e.g. GOLD)"
                  />
                  <span className="text-slate-500 text-xs">→</span>
                  <input
                    type="text"
                    value={t.replaceWith}
                    onChange={(e) => handleUpdateTransformation(t.id, { replaceWith: e.target.value })}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-400"
                    placeholder="Replace (e.g. XAUUSD)"
                  />
                  <button
                    onClick={() => handleRemoveTransformation(t.id)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Prefix & Suffix */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">{isRtl ? 'ترويسة الرسالة (Prefix):' : 'Header / Prefix:'}</label>
                <input
                  type="text"
                  value={prefixText}
                  onChange={(e) => setPrefixText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                  placeholder="⚡ VIP SIGNAL"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">{isRtl ? 'تذييل الرسالة (Suffix):' : 'Footer / Suffix:'}</label>
                <input
                  type="text"
                  value={suffixText}
                  onChange={(e) => setSuffixText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                  placeholder="⚠️ Strict Risk Management"
                />
              </div>
            </div>

            <div className="flex gap-4 text-xs pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeLinks}
                  onChange={(e) => setRemoveLinks(e.target.checked)}
                  className="rounded text-cyan-500"
                />
                <span>{isRtl ? 'حذف الروابط تلقائياً' : 'Strip links automatically'}</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={appendSourceTimestamp}
                  onChange={(e) => setAppendSourceTimestamp(e.target.checked)}
                  className="rounded text-cyan-500"
                />
                <span>{isRtl ? 'إرفاق المصدر والوقت' : 'Append source and timestamp'}</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 7: Forwarding Mode */}
        {currentStep === 7 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">
              {isRtl ? 'الخطوة 7: اختر وضع إعادة التوجيه' : 'Step 7: Choose Forwarding Mode'}
            </h3>

            <div className="space-y-2">
              <label
                onClick={() => setForwardingMode('COPY_CONTENT')}
                className={`p-3 rounded-xl border block cursor-pointer transition-all ${
                  forwardingMode === 'COPY_CONTENT'
                    ? 'bg-blue-600/15 border-blue-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="font-bold text-xs">
                  {isRtl ? 'الوضع الثاني: إرسال نسخة من المحتوى كرسالة جديدة (موصى به)' : 'Copy Content as New Message (Recommended)'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {isRtl
                    ? 'يتيح تعديل النص، تغيير الكلمات، إضافة الترويسة والتذييل، وحذف الإعلانات.'
                    : 'Allows text modification, word replacement, custom prefix/suffix, and link removal.'}
                </div>
              </label>

              <label
                onClick={() => setForwardingMode('NATIVE_FORWARD')}
                className={`p-3 rounded-xl border block cursor-pointer transition-all ${
                  forwardingMode === 'NATIVE_FORWARD'
                    ? 'bg-blue-600/15 border-blue-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="font-bold text-xs">
                  {isRtl ? 'الوضع الأول: إعادة التوجيه الأصلية' : 'Native Telegram Forwarding'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {isRtl
                    ? 'إعادة توجيه تيليجرام الرسمية مع الاحتفاظ برابط واسم القناة الأصلية.'
                    : 'Preserves the original source channel tag and native forward attribution.'}
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Step 8: Live Test */}
        {currentStep === 8 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {isRtl ? 'الخطوة 8: اختبار القاعدة بنص تجريبي' : 'Step 8: Live Interactive Test'}
              </h3>
              <button
                onClick={runLiveTest}
                className="text-xs px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-1 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تشغيل الفحص' : 'Evaluate'}</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={testSampleText}
              onChange={(e) => setTestSampleText(e.target.value)}
              className="w-full bg-slate-950 font-mono text-xs border border-slate-700 rounded-lg p-2.5 text-slate-200"
              placeholder="Enter sample message..."
            />

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  testResult.willPass
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-rose-950/20 border-rose-500/30'
                }`}
              >
                <div className="font-bold mb-1 flex items-center justify-between">
                  <span>{isRtl ? 'نتيجة الفحص:' : 'Test Result:'}</span>
                  <span className={testResult.willPass ? 'text-emerald-400' : 'text-rose-400'}>
                    {testResult.willPass ? 'ACCEPTED' : 'REJECTED BY FILTERS'}
                  </span>
                </div>
                {testResult.willPass ? (
                  <pre className="p-2 rounded bg-black/40 text-slate-200 font-mono text-[11px] whitespace-pre-wrap">
                    {testResult.transformed}
                  </pre>
                ) : (
                  <div className="text-[11px] text-rose-300">
                    {!testResult.kwRes.passed && <div>• {testResult.kwRes.reason}</div>}
                    {!testResult.rgRes.passed && <div>• {testResult.rgRes.reason}</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 9: Review */}
        {currentStep === 9 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">
              {isRtl ? 'الخطوة 9: مراجعة إعدادات القاعدة' : 'Step 9: Review Summary'}
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">{isRtl ? 'اسم القاعدة:' : 'Rule Name:'}</span>
                <span className="font-bold text-white">{ruleName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">{isRtl ? 'المصادر:' : 'Sources:'}</span>
                <span className="text-cyan-400 font-medium">{selectedSources.length} selected</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">{isRtl ? 'الوجهات:' : 'Destinations:'}</span>
                <span className="text-indigo-400 font-medium">{selectedDestinations.length} selected</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">{isRtl ? 'وضع التوجيه:' : 'Mode:'}</span>
                <span className="font-mono text-emerald-400">{forwardingMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{isRtl ? 'قواعد الاستبدال:' : 'Transform Rules:'}</span>
                <span>{transformations.length} active</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 10: Activate */}
        {currentStep === 10 && (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              {isRtl ? 'القاعدة جاهزة للحفظ والتفعيل!' : 'Rule is Ready to Activate!'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isRtl
                ? 'سيتم حفظ القاعدة في قاعدة بيانات Room والبدء بمراقبة الرسائل الجديدة فورياً.'
                : 'The rule will be saved to local Room database and become active immediately.'}
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 mt-4">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep((s) => s - 1)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              <span>{isRtl ? 'السابق' : 'Previous'}</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 10 ? (
            <button
              onClick={() => setCurrentStep((s) => s + 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20"
            >
              <span>{isRtl ? 'التالي' : 'Next'}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30"
            >
              <Check className="w-4 h-4" />
              <span>{isRtl ? 'حفظ وتفعيل القاعدة الآن' : 'Save & Activate'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
