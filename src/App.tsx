/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ForwardingRule,
  MessageProcessingLog,
  TelegramAuthState,
  TelegramChat,
  AppScreenId,
  TelegramMessageType,
} from './types';
import { StorageService } from './services/storage';
import { Header } from './components/Header';
import { PhoneFrame } from './components/PhoneFrame';
import { LiveSimulatorModal } from './components/LiveSimulatorModal';
import { DashboardScreen } from './screens/DashboardScreen';
import { RulesScreen } from './screens/RulesScreen';
import { RuleWizardScreen } from './screens/RuleWizardScreen';
import { SourcesScreen } from './screens/SourcesScreen';
import { LogsScreen } from './screens/LogsScreen';
import { ErrorDetailsScreen } from './screens/ErrorDetailsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { CodeExporterScreen } from './screens/CodeExporterScreen';
import { RealTelegramScreen } from './screens/RealTelegramScreen';
import { RealTelegramApi } from './services/realTelegramApi';
import {
  ApiSetupScreen,
  LoginScreen,
  VerificationScreen,
  TwoStepPasswordScreen,
  AccountInfoScreen,
} from './screens/AuthScreens';
import { MtprotoClient } from './services/mtprotoClient';
import { DuplicateDetector } from './engine/duplicate';
import { KeywordFilter, RegexFilter, MessageTypeFilter } from './engine/filters';
import { TextTransformer } from './engine/transform';
import {
  Layers,
  FileText,
  Radio,
  Settings,
  User,
  Code2,
  Home,
  Sparkles,
} from 'lucide-react';

const duplicateDetector = new DuplicateDetector();

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [viewMode, setViewMode] = useState<'phone' | 'desktop'>('phone');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Core state from storage
  const [rules, setRules] = useState<ForwardingRule[]>(() => StorageService.getRules());
  const [logs, setLogs] = useState<MessageProcessingLog[]>(() => StorageService.getLogs());
  const [chats, setChats] = useState<TelegramChat[]>(() => StorageService.getChats());
  const [auth, setAuth] = useState<TelegramAuthState>(() => StorageService.getAuth());
  const [isServiceActive, setIsServiceActive] = useState<boolean>(() =>
    StorageService.isServiceActive()
  );

  const [currentScreen, setCurrentScreen] = useState<AppScreenId>('dashboard');
  const [selectedLog, setSelectedLog] = useState<MessageProcessingLog | null>(null);
  const [editingRule, setEditingRule] = useState<ForwardingRule | null>(null);

  // Sync to local storage
  useEffect(() => {
    StorageService.saveRules(rules);
  }, [rules]);

  useEffect(() => {
    StorageService.saveLogs(logs);
  }, [logs]);

  useEffect(() => {
    StorageService.saveChats(chats);
  }, [chats]);

  useEffect(() => {
    StorageService.saveAuth(auth);
  }, [auth]);

  useEffect(() => {
    StorageService.setServiceActive(isServiceActive);
  }, [isServiceActive]);

  // Verify MTProto status on mount
  useEffect(() => {
    const checkStatus = async () => {
      const res = await MtprotoClient.getStatus();
      if (res.success && res.state.isAuthorized && res.state.user) {
        setAuth((prev) => ({
          ...prev,
          isAuthorized: true,
          connectionMode: 'USER_MTPROTO',
          phoneNumber: res.state.user?.phone || prev.phoneNumber,
          userFirstName: res.state.user?.firstName || prev.userFirstName,
          userLastName: res.state.user?.lastName || prev.userLastName,
          username: res.state.user?.username || prev.username,
        }));
      }
    };
    checkStatus();
  }, []);

  const handleSyncDialogs = async () => {
    const res = await MtprotoClient.getDialogs();
    if (res.success && res.dialogs.length > 0) {
      setChats(res.dialogs);
      StorageService.saveChats(res.dialogs);
    }
  };

  // Sync active rules with server MTProto background engine
  useEffect(() => {
    if (isServiceActive) {
      MtprotoClient.startEngine(rules);
    } else {
      MtprotoClient.stopEngine();
    }
  }, [isServiceActive, rules]);

  // Real Telegram Live Long-Polling Effect (for Bot API if configured)
  useEffect(() => {
    if (!isServiceActive || !auth.botToken || !auth.botToken.trim()) {
      return;
    }

    const abortController = new AbortController();
    let isRunning = true;
    let offset = 0;

    const api = new RealTelegramApi(auth.botToken);

    const poll = async () => {
      while (isRunning && !abortController.signal.aborted) {
        try {
          const res = await api.getUpdates(offset, 15, abortController.signal);
          if (res.success && res.updates && res.updates.length > 0) {
            offset = res.nextOffset;
            for (const update of res.updates) {
              const msg = update.channel_post || update.message || update.edited_channel_post;
              if (msg && (msg.text || msg.caption)) {
                const text = msg.text || msg.caption || '';
                const sourceChatId = String(msg.chat.id);
                const sourceChatName = msg.chat.title || msg.chat.username || sourceChatId;

                handleDispatchMessage({
                  sourceChatId,
                  sourceChatName,
                  text,
                  messageType: msg.photo ? 'PHOTO' : msg.video ? 'VIDEO' : msg.document ? 'DOCUMENT' : 'TEXT',
                  hasLinks: /(https?:\/\/[^\s]+|t\.me\/[^\s]+|@[a-zA-Z0-9_]{4,})/i.test(text),
                });
              }
            }
          }
        } catch (e) {
          // Wait briefly before reconnecting
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    };

    poll();

    return () => {
      isRunning = false;
      abortController.abort();
    };
  }, [isServiceActive, auth.botToken, rules]);

  // Real message processing pipeline
  const handleDispatchMessage = async (msg: {
    sourceChatId: string;
    sourceChatName: string;
    text: string;
    messageType: TelegramMessageType;
    hasLinks: boolean;
  }) => {
    if (!isServiceActive) {
      alert(
        lang === 'ar'
          ? 'المحرك متوقف حالياً! يرجى تشغيل محرك المراقبة أولاً من الشريط العلوي.'
          : 'Forwarding engine is stopped! Start the service from top bar first.'
      );
      return;
    }

    const matchedRules = rules.filter(
      (r) =>
        r.isEnabled &&
        (r.sourceChatIds.includes(msg.sourceChatId) || r.sourceChatIds.includes('*'))
    );

    if (matchedRules.length === 0) {
      // Record a log that no rule matched this source
      const logId = `log-${Date.now()}`;
      const unhandledLog: MessageProcessingLog = {
        id: logId,
        ruleId: 'none',
        ruleName: lang === 'ar' ? 'لا توجد قاعدة مطابقة' : 'No Matching Rule',
        sourceChatId: msg.sourceChatId,
        sourceChatName: msg.sourceChatName,
        sourceMessageId: Math.floor(10000 + Math.random() * 90000),
        destinationChatId: 'none',
        destinationChatName: '—',
        messageType: msg.messageType,
        originalPreview: msg.text,
        processingStatus: 'FILTERED_OUT',
        filterReason:
          lang === 'ar'
            ? 'القناة المصدر غير مدرجة ضمن أي قاعدة توجيه نشطة حالياً.'
            : 'Source chat is not targeted by any active rule.',
        attempts: 1,
        createdAt: Date.now(),
      };
      setLogs((prev) => [unhandledLog, ...prev]);
      return;
    }

    const newLogs: MessageProcessingLog[] = [];
    const updatedRules = [...rules];

    for (const rule of matchedRules) {
      const destIds = rule.destinationChatIds;
      const destNames = rule.destinationChatNames;

      for (let i = 0; i < destIds.length; i++) {
        const destId = destIds[i];
        const destName = destNames[i] || destId;
        const logId = `log-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const sourceMsgId = Math.floor(10000 + Math.random() * 90000);

        // 1. Duplicate check
        const isDuplicate = duplicateDetector.isDuplicate(
          msg.sourceChatId,
          sourceMsgId,
          destId,
          rule.id,
          msg.text
        );

        if (isDuplicate) {
          newLogs.push({
            id: logId,
            ruleId: rule.id,
            ruleName: rule.name,
            sourceChatId: msg.sourceChatId,
            sourceChatName: msg.sourceChatName,
            sourceMessageId: sourceMsgId,
            destinationChatId: destId,
            destinationChatName: destName,
            messageType: msg.messageType,
            originalPreview: msg.text,
            processingStatus: 'DUPLICATE_SKIPPED',
            filterReason: 'Already processed for this destination (duplicate skipped)',
            attempts: 1,
            createdAt: Date.now(),
          });
          continue;
        }

        // 2. Media filter
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
        const typeRes = typeFilter.evaluate(msg.messageType, msg.hasLinks);
        if (!typeRes.passed) {
          newLogs.push({
            id: logId,
            ruleId: rule.id,
            ruleName: rule.name,
            sourceChatId: msg.sourceChatId,
            sourceChatName: msg.sourceChatName,
            sourceMessageId: sourceMsgId,
            destinationChatId: destId,
            destinationChatName: destName,
            messageType: msg.messageType,
            originalPreview: msg.text,
            processingStatus: 'FILTERED_OUT',
            filterReason: typeRes.reason,
            attempts: 1,
            createdAt: Date.now(),
          });
          continue;
        }

        // 3. Keyword filter
        const kwFilter = new KeywordFilter(
          rule.includeKeywords,
          rule.excludeKeywords,
          rule.matchAllKeywords,
          rule.caseSensitiveKeywords
        );
        const kwRes = kwFilter.evaluate(msg.text);
        if (!kwRes.passed) {
          newLogs.push({
            id: logId,
            ruleId: rule.id,
            ruleName: rule.name,
            sourceChatId: msg.sourceChatId,
            sourceChatName: msg.sourceChatName,
            sourceMessageId: sourceMsgId,
            destinationChatId: destId,
            destinationChatName: destName,
            messageType: msg.messageType,
            originalPreview: msg.text,
            processingStatus: 'FILTERED_OUT',
            filterReason: kwRes.reason,
            attempts: 1,
            createdAt: Date.now(),
          });
          continue;
        }

        // 4. Regex filter
        if (rule.regexPattern && rule.regexPattern.trim()) {
          const rgFilter = new RegexFilter(rule.regexPattern, rule.regexFlags);
          const rgRes = rgFilter.evaluate(msg.text);
          if (!rgRes.passed) {
            newLogs.push({
              id: logId,
              ruleId: rule.id,
              ruleName: rule.name,
              sourceChatId: msg.sourceChatId,
              sourceChatName: msg.sourceChatName,
              sourceMessageId: sourceMsgId,
              destinationChatId: destId,
              destinationChatName: destName,
              messageType: msg.messageType,
              originalPreview: msg.text,
              processingStatus: 'FILTERED_OUT',
              filterReason: rgRes.reason,
              attempts: 1,
              createdAt: Date.now(),
            });
            continue;
          }
        }

        // 5. Transformation
        const transformer = new TextTransformer({
          replacements: rule.transformations,
          prefixText: rule.prefixText,
          suffixText: rule.suffixText,
          removeLinks: rule.removeLinks,
          trimExtraLines: rule.trimExtraLines,
          removeCustomSignatures: rule.removeCustomSignatures,
          appendSourceTimestamp: rule.appendSourceTimestamp,
          sourceChannelTitle: msg.sourceChatName,
        });
        const transformedText = transformer.transform(msg.text);

        // 6. Send to real Telegram servers if Bot Token is connected!
        let destMsgId = Math.floor(1000 + Math.random() * 9000);
        let realTelegramError: string | undefined = undefined;

        if (auth.botToken && auth.botToken.trim()) {
          try {
            const api = new RealTelegramApi(auth.botToken);
            if (rule.forwardingMode === 'NATIVE_FORWARD') {
              const res = await api.forwardMessage(destId, msg.sourceChatId, sourceMsgId);
              if (res.success && res.messageId) {
                destMsgId = res.messageId;
              } else {
                realTelegramError = res.error;
              }
            } else {
              const res = await api.sendMessage(destId, transformedText);
              if (res.success && res.messageId) {
                destMsgId = res.messageId;
              } else {
                realTelegramError = res.error;
              }
            }
          } catch (e: any) {
            realTelegramError = e.message;
          }
        }

        duplicateDetector.recordProcessed(
          msg.sourceChatId,
          sourceMsgId,
          destId,
          rule.id,
          msg.text
        );

        if (realTelegramError) {
          newLogs.push({
            id: logId,
            ruleId: rule.id,
            ruleName: rule.name,
            sourceChatId: msg.sourceChatId,
            sourceChatName: msg.sourceChatName,
            sourceMessageId: sourceMsgId,
            destinationChatId: destId,
            destinationChatName: destName,
            messageType: msg.messageType,
            originalPreview: msg.text,
            transformedPreview: transformedText,
            processingStatus: 'FAILED',
            errorCode: 'TELEGRAM_API_ERROR',
            errorMessage: realTelegramError,
            attempts: 1,
            createdAt: Date.now(),
          });
          continue;
        }

        newLogs.push({
          id: logId,
          ruleId: rule.id,
          ruleName: rule.name,
          sourceChatId: msg.sourceChatId,
          sourceChatName: msg.sourceChatName,
          sourceMessageId: sourceMsgId,
          destinationChatId: destId,
          destinationChatName: destName,
          destinationMessageId: destMsgId,
          messageType: msg.messageType,
          originalPreview: msg.text,
          transformedPreview: transformedText,
          processingStatus: 'SUCCESS',
          attempts: 1,
          createdAt: Date.now(),
          completedAt: Date.now() + 200,
        });

        // Update metrics on rule
        const ruleIdx = updatedRules.findIndex((r) => r.id === rule.id);
        if (ruleIdx !== -1) {
          updatedRules[ruleIdx] = {
            ...updatedRules[ruleIdx],
            totalProcessedCount: updatedRules[ruleIdx].totalProcessedCount + 1,
            totalForwardedCount: updatedRules[ruleIdx].totalForwardedCount + 1,
            lastSuccessfulExecution: Date.now(),
          };
        }
      }
    }

    setLogs((prev) => [...newLogs, ...prev]);
    setRules(updatedRules);
  };

  const handleToggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isEnabled: !r.isEnabled } : r))
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    if (window.confirm(lang === 'ar' ? 'هل تريد بالتأكيد حذف هذه القاعدة؟' : 'Delete this rule?')) {
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
    }
  };

  const handleSaveRule = (newRule: ForwardingRule) => {
    setRules((prev) => {
      const idx = prev.findIndex((r) => r.id === newRule.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = newRule;
        return next;
      }
      return [newRule, ...prev];
    });
    setEditingRule(null);
  };

  const handleAddChat = (chat: TelegramChat) => {
    setChats((prev) => [chat, ...prev]);
  };

  const isRtl = lang === 'ar';
  const activeRulesCount = rules.filter((r) => r.isEnabled).length;

  // Screen content renderer
  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <DashboardScreen
            rules={rules}
            logs={logs}
            auth={auth}
            isServiceActive={isServiceActive}
            onToggleService={() => setIsServiceActive(!isServiceActive)}
            onNavigate={setCurrentScreen}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            onSelectLog={(log) => {
              setSelectedLog(log);
              setCurrentScreen('error_details');
            }}
            isRtl={isRtl}
          />
        );
      case 'rules':
        return (
          <RulesScreen
            rules={rules}
            onToggleRule={handleToggleRule}
            onDeleteRule={handleDeleteRule}
            onEditRule={(rule) => {
              setEditingRule(rule);
              setCurrentScreen('rule_wizard');
            }}
            onNavigate={setCurrentScreen}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            isRtl={isRtl}
          />
        );
      case 'rule_wizard':
        return (
          <RuleWizardScreen
            chats={chats}
            onSaveRule={handleSaveRule}
            onNavigate={setCurrentScreen}
            isRtl={isRtl}
            initialRule={editingRule}
          />
        );
      case 'sources':
      case 'destinations':
        return (
          <SourcesScreen
            chats={chats}
            onAddChat={handleAddChat}
            onNavigate={setCurrentScreen}
            isRtl={isRtl}
            onSyncRealDialogs={handleSyncDialogs}
          />
        );
      case 'logs':
        return (
          <LogsScreen
            logs={logs}
            onClearLogs={() => setLogs([])}
            onSelectLog={(log) => {
              setSelectedLog(log);
              setCurrentScreen('error_details');
            }}
            onNavigate={setCurrentScreen}
            isRtl={isRtl}
          />
        );
      case 'error_details':
        return (
          <ErrorDetailsScreen
            log={selectedLog}
            onNavigate={setCurrentScreen}
            onRetry={(log) => {
              setIsSimulatorOpen(true);
            }}
            isRtl={isRtl}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            isServiceActive={isServiceActive}
            onToggleService={() => setIsServiceActive(!isServiceActive)}
            lang={lang}
            onToggleLang={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            onNavigate={setCurrentScreen}
            onClearLogs={() => setLogs([])}
            isRtl={isRtl}
          />
        );
      case 'code_exporter':
        return <CodeExporterScreen onNavigate={setCurrentScreen} isRtl={isRtl} />;
      case 'api_setup':
        return (
          <ApiSetupScreen
            auth={auth}
            onUpdateAuth={(u) => setAuth((prev) => ({ ...prev, ...u }))}
            onLogout={() => setAuth({ isAuthorized: false })}
            onNavigate={setCurrentScreen}
            isRtl={isRtl}
          />
        );
      case 'login':
        return (
          <LoginScreen
            auth={auth}
            onUpdateAuth={(u) => setAuth((prev) => ({ ...prev, ...u }))}
            onLogout={() => setAuth({ isAuthorized: false })}
            onNavigate={setCurrentScreen}
            isRtl={isRtl}
          />
        );
      case 'verification':
        return (
          <VerificationScreen
            auth={auth}
            onUpdateAuth={(u) => setAuth((prev) => ({ ...prev, ...u }))}
            onLogout={() => setAuth({ isAuthorized: false })}
            onNavigate={setCurrentScreen}
            isRtl={isRtl}
            onRefreshDialogs={handleSyncDialogs}
          />
        );
      case 'two_step':
        return (
          <TwoStepPasswordScreen
            auth={auth}
            onUpdateAuth={(u) => setAuth((prev) => ({ ...prev, ...u }))}
            onLogout={() => setAuth({ isAuthorized: false })}
            onNavigate={setCurrentScreen}
            isRtl={isRtl}
            onRefreshDialogs={handleSyncDialogs}
          />
        );
      case 'account_info':
        return (
          <AccountInfoScreen
            auth={auth}
            onUpdateAuth={(u) => setAuth((prev) => ({ ...prev, ...u }))}
            onLogout={() => setAuth({ isAuthorized: false })}
            onNavigate={setCurrentScreen}
            isRtl={isRtl}
          />
        );
      case 'real_telegram':
        return (
          <RealTelegramScreen
            auth={auth}
            onUpdateAuth={(u) => setAuth((prev) => ({ ...prev, ...u }))}
            onNavigate={setCurrentScreen}
            isServiceActive={isServiceActive}
            onToggleService={() => setIsServiceActive(!isServiceActive)}
            isRtl={isRtl}
            onLogRealOperation={(log) => setLogs((prev) => [log, ...prev])}
          />
        );
      default:
        return (
          <DashboardScreen
            rules={rules}
            logs={logs}
            auth={auth}
            isServiceActive={isServiceActive}
            onToggleService={() => setIsServiceActive(!isServiceActive)}
            onNavigate={setCurrentScreen}
            onOpenSimulator={() => setIsSimulatorOpen(true)}
            onSelectLog={(log) => {
              setSelectedLog(log);
              setCurrentScreen('error_details');
            }}
            isRtl={isRtl}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-200 flex flex-col font-sans selection:bg-blue-600/30">
      {/* Top Navigation Bar */}
      <Header
        isServiceActive={isServiceActive}
        onToggleService={() => setIsServiceActive(!isServiceActive)}
        lang={lang}
        onToggleLang={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === 'phone' ? 'desktop' : 'phone')}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenCodeExporter={() => setCurrentScreen('code_exporter')}
        onOpenRealTelegram={() => setCurrentScreen('real_telegram')}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col justify-center items-center py-4 px-2 sm:px-4">
        {viewMode === 'phone' ? (
          <div className="w-full flex justify-center">
            <PhoneFrame
              isServiceActive={isServiceActive}
              activeRulesCount={activeRulesCount}
            >
              {renderScreen()}
            </PhoneFrame>
          </div>
        ) : (
          <div className="w-full max-w-5xl bg-slate-950/70 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
            <div className="flex gap-2 mb-6 border-b border-slate-800 pb-4 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setCurrentScreen('dashboard')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
                  currentScreen === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>{isRtl ? 'لوحة التحكم' : 'Dashboard'}</span>
              </button>

              <button
                onClick={() => setCurrentScreen('rules')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
                  currentScreen === 'rules' || currentScreen === 'rule_wizard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{isRtl ? 'قواعد التوجيه' : 'Rules'}</span>
              </button>

              <button
                onClick={() => setCurrentScreen('sources')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
                  currentScreen === 'sources'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>{isRtl ? 'المصادر والوجهات' : 'Chats'}</span>
              </button>

              <button
                onClick={() => setCurrentScreen('logs')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
                  currentScreen === 'logs' || currentScreen === 'error_details'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{isRtl ? 'سجل العمليات' : 'Logs'}</span>
              </button>

              <button
                onClick={() => setCurrentScreen('settings')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
                  currentScreen === 'settings'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>{isRtl ? 'الإعدادات' : 'Settings'}</span>
              </button>

              <button
                onClick={() => setCurrentScreen('real_telegram')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
                  currentScreen === 'real_telegram'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-emerald-400 hover:bg-slate-800'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>{isRtl ? 'اتصال Telegram الفعلي' : 'Real Telegram API'}</span>
              </button>

              <button
                onClick={() => setCurrentScreen('code_exporter')}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors ml-auto ${
                  currentScreen === 'code_exporter'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-900 text-cyan-400 hover:bg-slate-800'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>{isRtl ? 'كود Android & APK' : 'Android Kotlin APK'}</span>
              </button>
            </div>

            {renderScreen()}
          </div>
        )}
      </main>

      {/* Floating Bottom Quick Bar in Phone Mode */}
      {viewMode === 'phone' && (
        <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl px-3 py-2 shadow-xl flex items-center gap-4 text-slate-400">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors ${
              currentScreen === 'dashboard' ? 'text-cyan-400' : 'hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>{isRtl ? 'الرئيسية' : 'Home'}</span>
          </button>

          <button
            onClick={() => setCurrentScreen('rules')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors ${
              currentScreen === 'rules' || currentScreen === 'rule_wizard'
                ? 'text-cyan-400'
                : 'hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isRtl ? 'القواعد' : 'Rules'}</span>
          </button>

          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isRtl ? 'اختبار' : 'Test'}</span>
          </button>

          <button
            onClick={() => setCurrentScreen('logs')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors ${
              currentScreen === 'logs' || currentScreen === 'error_details'
                ? 'text-cyan-400'
                : 'hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isRtl ? 'السجل' : 'Logs'}</span>
          </button>

          <button
            onClick={() => setCurrentScreen('settings')}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors ${
              currentScreen === 'settings' ? 'text-cyan-400' : 'hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{isRtl ? 'ضبط' : 'Setup'}</span>
          </button>
        </nav>
      )}

      {/* Live Message Dispatcher Modal */}
      <LiveSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        rules={rules}
        chats={chats}
        isRtl={isRtl}
        onDispatchMessage={handleDispatchMessage}
      />
    </div>
  );
}
