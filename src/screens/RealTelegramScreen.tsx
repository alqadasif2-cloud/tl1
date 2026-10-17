import React, { useState } from 'react';
import {
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Send,
  Radio,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Sparkles,
  Bot,
  AlertCircle,
  RefreshCw,
  Play,
  Square,
  MessageSquare,
} from 'lucide-react';
import { TelegramAuthState, AppScreenId } from '../types';
import { RealTelegramApi } from '../services/realTelegramApi';

interface RealTelegramScreenProps {
  auth: TelegramAuthState;
  onUpdateAuth: (updates: Partial<TelegramAuthState>) => void;
  onNavigate: (screen: AppScreenId) => void;
  isServiceActive: boolean;
  onToggleService: () => void;
  isRtl: boolean;
  onLogRealOperation: (log: any) => void;
}

export const RealTelegramScreen: React.FC<RealTelegramScreenProps> = ({
  auth,
  onUpdateAuth,
  onNavigate,
  isServiceActive,
  onToggleService,
  isRtl,
  onLogRealOperation,
}) => {
  const [botToken, setBotToken] = useState(auth.botToken || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);

  // Real Channel Test form
  const [testChannelId, setTestChannelId] = useState('');
  const [testMessageText, setTestMessageText] = useState(
    '🔥 تجربة إرسال حقيقية من TForwarder Pro إلى قناتك في تيليجرام!\nالوقت: ' + new Date().toLocaleTimeString()
  );
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string; messageId?: number } | null>(null);

  // Handle Verify Bot Token with real Telegram API
  const handleVerifyToken = async () => {
    if (!botToken.trim()) {
      setVerifyResult({
        success: false,
        message: isRtl ? 'يرجى إدخال رمز Bot Token' : 'Please enter your Bot Token',
      });
      return;
    }

    setIsVerifying(true);
    setVerifyResult(null);

    const api = new RealTelegramApi(botToken);
    const res = await api.getMe();

    setIsVerifying(false);
    if (res.success && res.bot) {
      setVerifyResult({
        success: true,
        message: isRtl
          ? `تم الاتصال بنجاح بـ Telegram API! البوت: @${res.bot.username} (${res.bot.first_name})`
          : `Connected successfully to Telegram API! Bot: @${res.bot.username} (${res.bot.first_name})`,
        data: res.bot,
      });

      onUpdateAuth({
        isAuthorized: true,
        botToken: botToken.trim(),
        connectionMode: 'BOT_API',
        username: res.bot.username,
        userFirstName: res.bot.first_name,
      });
    } else {
      setVerifyResult({
        success: false,
        message: res.error || (isRtl ? 'فشل التحقق من الرمز' : 'Invalid Bot Token'),
      });
    }
  };

  // Handle Send REAL Test Message
  const handleSendRealMessage = async () => {
    if (!botToken.trim()) {
      alert(isRtl ? 'يرجى ربط Bot Token أولاً' : 'Please connect a Bot Token first');
      return;
    }
    if (!testChannelId.trim()) {
      alert(isRtl ? 'يرجى إدخال معرف القناة (مثال: @my_channel أو -100...)' : 'Please enter target channel username or ID');
      return;
    }

    setIsSending(true);
    setSendResult(null);

    const api = new RealTelegramApi(botToken);
    const res = await api.sendMessage(testChannelId, testMessageText);

    setIsSending(false);
    if (res.success && res.messageId) {
      setSendResult({
        success: true,
        message: isRtl
          ? `تم إرسال الرسالة بنجاح إلى قناتك في تيليجرام! معرف الرسالة في سيرفر تيليجرام: #${res.messageId}`
          : `Real message sent successfully! Telegram Message ID: #${res.messageId}`,
        messageId: res.messageId,
      });

      onLogRealOperation({
        id: `real-log-${Date.now()}`,
        ruleId: 'manual-test',
        ruleName: isRtl ? 'اختبار إرسال حقيقي' : 'Real Test Dispatch',
        sourceChatId: 'local-app',
        sourceChatName: isRtl ? 'لوحة التحكم' : 'Control Center',
        sourceMessageId: 0,
        destinationChatId: testChannelId,
        destinationChatName: testChannelId,
        destinationMessageId: res.messageId,
        messageType: 'TEXT',
        originalPreview: testMessageText,
        transformedPreview: testMessageText,
        processingStatus: 'SUCCESS',
        attempts: 1,
        createdAt: Date.now(),
        completedAt: Date.now(),
      });
    } else {
      setSendResult({
        success: false,
        message: res.error || (isRtl ? 'فشل الإرسال. تأكد من إضافة البوت كمشرف (Admin) في القناة' : 'Failed. Ensure the bot is added as Admin in the channel'),
      });
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
          >
            <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>{isRtl ? 'الاتصال الفعلي المباشر بـ Telegram API' : 'Real Live Telegram Connection'}</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              {isRtl ? 'ربط حقيقي بالخادم الرسمي لتيليجرام لإرسال واستقبال الرسائل فعلياً' : 'Live real-time execution via official Telegram servers'}
            </p>
          </div>
        </div>
      </div>

      {/* Guide Banner: How to get real Bot in 30 seconds */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-blue-400 font-bold">
          <Sparkles className="w-4 h-4" />
          <span>{isRtl ? 'كيف تجعل التطبيق يعمل فعلياً في 3 خطوات سريعة:' : 'How to make this 100% functional in 3 steps:'}</span>
        </div>
        <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
          <li>
            {isRtl
              ? 'افتح تطبيق تيليجرام وابحث عن @BotFather وأرسل له الأمر /newbot وأدخل اسماً لمعرف البوت.'
              : 'Open Telegram, search for @BotFather, send /newbot and choose a name.'}
          </li>
          <li>
            {isRtl
              ? 'انسخ الرمز (HTTP API Token) الذي يعطيك إياه BotFather والصقه في الحقل أدناه.'
              : 'Copy the HTTP API Token from BotFather and paste it below.'}
          </li>
          <li>
            {isRtl
              ? 'أضف البوت كمشرف (Admin) في قناتك المصدر وقناتك الوجهة مع صلاحية إرسال الرسائل.'
              : 'Add your bot as an Administrator in your source and destination channels with posting permissions.'}
          </li>
        </ol>
      </div>

      {/* 1. Real Bot Token Input & Verification */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-cyan-400" />
          <span>{isRtl ? '1. إدخال رمز Bot Token الحقيقي:' : '1. Real Telegram Bot Token:'}</span>
        </h3>

        <div>
          <input
            type="text"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            placeholder="e.g. 7123456789:AAHk1_xyzABCDEF1234567890..."
            className="w-full bg-slate-950 font-mono text-xs border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <button
          onClick={handleVerifyToken}
          disabled={isVerifying}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
        >
          {isVerifying ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{isRtl ? 'جار التحقق من خوادم Telegram...' : 'Verifying with Telegram...'}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isRtl ? 'التحقق والربط الفعلي بـ Telegram' : 'Verify & Connect to Telegram'}</span>
            </>
          )}
        </button>

        {verifyResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              verifyResult.success
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
            }`}
          >
            {verifyResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            )}
            <div>
              <p className="font-semibold">{verifyResult.message}</p>
              {verifyResult.data && (
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  ID: {verifyResult.data.id} • Username: @{verifyResult.data.username}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Real Channel Test (Send a live message right now) */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>{isRtl ? '2. تجربة إرسال رسالة حقيقية فوراً إلى قناتك:' : '2. Send Real Live Test Message to Your Channel:'}</span>
        </h3>
        <p className="text-xs text-slate-400">
          {isRtl
            ? 'أدخل اسم قناتك أو مجموعتك لتجربة الإرسال المباشر وتأكيد وصول الرسالة على هاتفك فوراً.'
            : 'Enter your channel username or ID to send a live test message right now.'}
        </p>

        <div>
          <label className="text-xs text-slate-300 block mb-1">
            {isRtl ? 'معرف القناة أو الرابط (@channel_username أو -100123456789):' : 'Channel @username or ID:'}
          </label>
          <input
            type="text"
            value={testChannelId}
            onChange={(e) => setTestChannelId(e.target.value)}
            placeholder="@my_channel_name"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
          />
        </div>

        <div>
          <label className="text-xs text-slate-300 block mb-1">
            {isRtl ? 'نص الرسالة المراد إرسالها:' : 'Message Content:'}
          </label>
          <textarea
            rows={2}
            value={testMessageText}
            onChange={(e) => setTestMessageText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200"
          />
        </div>

        <button
          onClick={handleSendRealMessage}
          disabled={isSending}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
        >
          {isSending ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{isRtl ? 'جار الإرسال لسيرفر تيليجرام...' : 'Sending to Telegram Server...'}</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>{isRtl ? 'إرسال الرسالة الحقيقية الآن إلى تيليجرام' : 'Send Real Message Now'}</span>
            </>
          )}
        </button>

        {sendResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              sendResult.success
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
            }`}
          >
            {sendResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            )}
            <div>
              <p className="font-semibold">{sendResult.message}</p>
              {sendResult.success && (
                <p className="text-[11px] text-slate-400 mt-1">
                  {isRtl
                    ? 'افتح تطبيق تيليجرام الآن على هاتفك وستجد الرسالة قد ظهرت في القناة!'
                    : 'Check your Telegram app on your phone now — the message has been posted!'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Real Polling Loop Engine */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Radio className={`w-4 h-4 ${isServiceActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              <span>{isRtl ? '3. محرك المراقبة وإعادة التوجيه التلقائي المباشر:' : '3. Live Telegram Auto-Forwarding Poller:'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRtl
                ? 'عند تشغيل المحرك، يستمع التطبيق لحظياً إلى كل رسالة جديدة تصل لأي قناة مصدر ويطبق القواعد ويعيد إرسالها للوجهة مباشرة.'
                : 'Continuously listens for real incoming posts, executes transformation rules, and forwards them live.'}
            </p>
          </div>

          <button
            onClick={onToggleService}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 ${
              isServiceActive
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isServiceActive ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{isRtl ? 'إيقاف المحرك' : 'Stop Engine'}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRtl ? 'تشغيل المحرك الفعلي' : 'Start Engine'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
