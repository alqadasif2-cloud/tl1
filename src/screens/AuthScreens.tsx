import React, { useState } from 'react';
import {
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Send,
  Lock,
  Phone,
  User,
  LogOut,
  ExternalLink,
  Info,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { TelegramAuthState, AppScreenId } from '../types';
import { MtprotoClient } from '../services/mtprotoClient';

interface AuthScreensProps {
  auth: TelegramAuthState;
  onUpdateAuth: (updates: Partial<TelegramAuthState>) => void;
  onLogout: () => void;
  onNavigate: (screen: AppScreenId) => void;
  isRtl: boolean;
  onRefreshDialogs?: () => void;
}

export const ApiSetupScreen: React.FC<AuthScreensProps> = ({
  auth,
  onUpdateAuth,
  onNavigate,
  isRtl,
}) => {
  const [apiId, setApiId] = useState(auth.apiId ? String(auth.apiId) : '2040');
  const [apiHash, setApiHash] = useState(auth.apiHash || 'b18441a1ff607e10a989891a5462e627');

  const handleSave = () => {
    onUpdateAuth({
      apiId: parseInt(apiId) || 2040,
      apiHash: apiHash.trim() || 'b18441a1ff607e10a989891a5462e627',
    });
    onNavigate('login');
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
        >
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
        <h2 className="text-sm font-bold text-white">
          {isRtl ? 'إعداد مفاتيح Telegram API للمطورين' : 'Telegram Developer API Keys'}
        </h2>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <KeyRound className="w-5 h-5" />
          <h3 className="text-xs font-bold text-white">
            {isRtl ? 'مفاتيح Telegram MTProto الرسمية' : 'Official MTProto API Credentials'}
          </h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {isRtl
            ? 'تطبيق TForwarder Pro يتصل مباشرة ببروتوكول MTProto المشفر. يمكنك استخدام المفاتيح الافتراضية المدمجة أو استخراج مفاتيحك الخاصة مجاناً من my.telegram.org'
            : 'TForwarder connects directly via MTProto. You can use the pre-configured official keys or your personal keys from my.telegram.org.'}
        </p>

        <a
          href="https://my.telegram.org"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold"
        >
          <span>https://my.telegram.org</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div className="space-y-2 pt-2">
          <div>
            <label className="text-xs text-slate-300 block mb-1">API ID:</label>
            <input
              type="number"
              value={apiId}
              onChange={(e) => setApiId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              placeholder="e.g. 2040"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">API Hash:</label>
            <input
              type="text"
              value={apiHash}
              onChange={(e) => setApiHash(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              placeholder="e.g. b18441a1ff607e10a989891a5462e627"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full mt-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all"
        >
          {isRtl ? 'حفظ ومتابعة لتسجيل الدخول برقم الهاتف' : 'Save & Proceed to Phone Login'}
        </button>
      </div>
    </div>
  );
};

export const LoginScreen: React.FC<AuthScreensProps> = ({
  auth,
  onUpdateAuth,
  onNavigate,
  isRtl,
}) => {
  const [phone, setPhone] = useState(auth.phoneNumber || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSendCode = async () => {
    if (!phone || phone.trim().length < 8) {
      setErrorMsg(isRtl ? 'يرجى إدخال رقم هاتف صحيح مع رمز الدولة (مثال: +20... أو +966...)' : 'Please enter a valid phone number with country code');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await MtprotoClient.sendCode(phone.trim(), auth.apiId, auth.apiHash);
    setIsLoading(false);

    if (res.success) {
      onUpdateAuth({
        phoneNumber: phone.trim(),
        needsCode: true,
        needs2FA: false,
      });
      onNavigate('verification');
    } else {
      setErrorMsg(res.error || (isRtl ? 'فشل إرسال رمز تسجيل الدخول. تحقق من الرقم والشبكة.' : 'Failed to send login code.'));
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 mx-auto mb-3 shadow-lg shadow-blue-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Phone className="w-7 h-7 text-cyan-400" />
          </div>
        </div>
        <h2 className="text-base font-bold text-white">
          {isRtl ? 'تسجيل الدخول برقم الهاتف الشخصي' : 'Sign in with Telegram Phone'}
        </h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
          {isRtl
            ? 'أدخل رقم هاتفك الدولي المسجل في Telegram لاستقبال الرمز الرسمي مباشرة على تطبيقك'
            : 'Enter your phone number with country code to receive the official code on Telegram'}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div>
          <label className="text-xs text-slate-300 block mb-1">
            {isRtl ? 'رقم الهاتف الدولي:' : 'Phone Number (with country code):'}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
            placeholder="+20 10 1234 5678"
          />
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          onClick={handleSendCode}
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{isRtl ? 'جار الاتصال بـ Telegram MTProto...' : 'Connecting to Telegram...'}</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>{isRtl ? 'إرسال رمز تسجيل الدخول الرسمي' : 'Send Official Verification Code'}</span>
            </>
          )}
        </button>

        <div className="pt-2 text-center">
          <button
            onClick={() => onNavigate('api_setup')}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            {isRtl ? 'إعداد مفاتيح API ID / API Hash مخصصة' : 'Configure Custom API ID / Hash'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const VerificationScreen: React.FC<AuthScreensProps> = ({
  auth,
  onUpdateAuth,
  onNavigate,
  isRtl,
  onRefreshDialogs,
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!code || code.trim().length < 5) {
      setErrorMsg(isRtl ? 'يرجى إدخال رمز التحقق المكون من 5 أرقام' : 'Please enter the 5-digit verification code');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await MtprotoClient.signIn(code.trim());
    setIsLoading(false);

    if (res.success) {
      const statusRes = await MtprotoClient.getStatus();
      if (statusRes.state.user) {
        onUpdateAuth({
          isAuthorized: true,
          needsCode: false,
          needs2FA: false,
          userFirstName: statusRes.state.user.firstName,
          userLastName: statusRes.state.user.lastName,
          username: statusRes.state.user.username,
          phoneNumber: statusRes.state.user.phone || auth.phoneNumber,
        });
      }
      if (onRefreshDialogs) onRefreshDialogs();
      onNavigate('dashboard');
    } else if (res.requires2FA) {
      onUpdateAuth({ needs2FA: true, needsCode: false });
      onNavigate('two_step');
    } else {
      setErrorMsg(res.error || (isRtl ? 'رمز التحقق غير صحيح أو انتهت صلاحيته' : 'Invalid or expired code'));
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-0.5 mx-auto mb-3 shadow-lg">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-cyan-400" />
          </div>
        </div>
        <h2 className="text-base font-bold text-white">
          {isRtl ? 'أدخل رمز التحقق الرسمي' : 'Enter Verification Code'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {isRtl
            ? `أرسل تيليجرام الرمز الرسمي إلى جهازك على الرقم ${auth.phoneNumber || ''}`
            : `Telegram sent the official code to ${auth.phoneNumber || ''}`}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div>
          <label className="text-xs text-slate-300 block mb-1">
            {isRtl ? 'رمز التحقق (5 أرقام):' : '5-Digit Code:'}
          </label>
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isLoading}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-center text-xl text-white font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-cyan-500"
            placeholder="•••••"
          />
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{isRtl ? 'جار التحقق وتأكيد الجلسة...' : 'Verifying with MTProto...'}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isRtl ? 'تأكيد الرمز وتسجيل الدخول' : 'Confirm Code & Log In'}</span>
            </>
          )}
        </button>

        <button
          onClick={() => onNavigate('login')}
          className="w-full py-2 text-center text-xs text-slate-400 hover:text-white"
        >
          {isRtl ? '← تغيير رقم الهاتف' : '← Change phone number'}
        </button>
      </div>
    </div>
  );
};

export const TwoStepPasswordScreen: React.FC<AuthScreensProps> = ({
  auth,
  onUpdateAuth,
  onNavigate,
  isRtl,
  onRefreshDialogs,
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerify2FA = async () => {
    if (!password) {
      setErrorMsg(isRtl ? 'يرجى إدخال كلمة المرور السحابية' : 'Please enter cloud password');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await MtprotoClient.signIn2FA(password);
    setIsLoading(false);

    if (res.success) {
      const statusRes = await MtprotoClient.getStatus();
      if (statusRes.state.user) {
        onUpdateAuth({
          isAuthorized: true,
          needsCode: false,
          needs2FA: false,
          userFirstName: statusRes.state.user.firstName,
          userLastName: statusRes.state.user.lastName,
          username: statusRes.state.user.username,
          phoneNumber: statusRes.state.user.phone || auth.phoneNumber,
        });
      }
      if (onRefreshDialogs) onRefreshDialogs();
      onNavigate('dashboard');
    } else {
      setErrorMsg(res.error || (isRtl ? 'كلمة المرور غير صحيحة' : 'Incorrect 2FA password'));
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-indigo-600 p-0.5 mx-auto mb-3 shadow-lg">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>
        </div>
        <h2 className="text-base font-bold text-white">
          {isRtl ? 'كلمة مرور التحقق بخطوتين (2FA)' : 'Two-Step Verification Password'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {isRtl
            ? 'حسابك محمي بكلمة مرور سحابية إضافية. يرجى إدخالها لإتمام المصادقة المشفرة'
            : 'Your Telegram account has cloud password enabled. Enter it to finalize sign-in'}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div>
          <label className="text-xs text-slate-300 block mb-1">
            {isRtl ? 'كلمة المرور السحابية:' : '2FA Cloud Password:'}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="••••••••"
          />
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          onClick={handleVerify2FA}
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{isRtl ? 'جار التحقق عبر SRP...' : 'Checking 2FA password...'}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isRtl ? 'تأكيد كلمة المرور والدخول' : 'Confirm & Log In'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const AccountInfoScreen: React.FC<AuthScreensProps> = ({
  auth,
  onLogout,
  onNavigate,
  isRtl,
}) => {
  const handleLogout = async () => {
    if (window.confirm(isRtl ? 'هل تريد تسجيل الخروج من جلسة Telegram MTProto؟' : 'Log out from Telegram session?')) {
      await MtprotoClient.logout();
      onLogout();
      onNavigate('login');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
        >
          <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
        <h2 className="text-sm font-bold text-white">
          {isRtl ? 'معلومات حساب Telegram الشخصي' : 'Personal Telegram Account'}
        </h2>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center font-bold text-white text-base">
            {auth.userFirstName ? auth.userFirstName[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {auth.userFirstName} {auth.userLastName || ''}
            </h3>
            <p className="text-xs text-slate-400">@{auth.username || 'user'}</p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">{isRtl ? 'رقم الهاتف الشخصي:' : 'Phone Number:'}</span>
            <span className="font-mono text-white">{auth.phoneNumber}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">{isRtl ? 'نوع الجلسة:' : 'Connection Protocol:'}</span>
            <span className="text-emerald-400 font-semibold font-mono">Telegram MTProto v2.0 (TCP/TLS)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">{isRtl ? 'حالة التشفير:' : 'Encryption:'}</span>
            <span className="text-cyan-400 font-semibold">End-to-End MTProto Session Key</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">{isRtl ? 'صلاحيات الوصول:' : 'Channels & Dialogs:'}</span>
            <span className="text-indigo-400 font-semibold">{isRtl ? 'جميع القنوات المنضم إليها حسابك' : 'All personal joined channels'}</span>
          </div>
        </div>

        <div className="pt-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold hover:bg-rose-500/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isRtl ? 'تسجيل الخروج وإنهاء الجلسة المشفرة' : 'Log Out & Destroy Session'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
