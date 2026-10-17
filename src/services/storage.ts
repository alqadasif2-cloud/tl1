import {
  ForwardingRule,
  MessageProcessingLog,
  TelegramAuthState,
  TelegramChat,
} from '../types';

export const INITIAL_CHATS: TelegramChat[] = [
  {
    id: '-1001458920192',
    title: 'Forex Gold VIP Signals',
    type: 'CHANNEL',
    username: 'forex_gold_vip',
    canPostMessages: false,
    memberCount: 14250,
  },
  {
    id: '-1001982736411',
    title: 'My Trading Hub (Destination)',
    type: 'CHANNEL',
    username: 'my_trading_hub',
    canPostMessages: true,
    memberCount: 180,
  },
  {
    id: '-1001672391024',
    title: 'Crypto Market Alpha',
    type: 'SUPERGROUP',
    username: 'crypto_alpha_feed',
    canPostMessages: false,
    memberCount: 8900,
  },
  {
    id: '-1001889201882',
    title: 'Private Execution Channel',
    type: 'CHANNEL',
    username: undefined,
    canPostMessages: true,
    memberCount: 12,
  },
  {
    id: '-1001122334455',
    title: 'Breaking Financial News',
    type: 'CHANNEL',
    username: 'financial_breaking_news',
    canPostMessages: false,
    memberCount: 52000,
  },
];

export const INITIAL_RULES: ForwardingRule[] = [
  {
    id: 'rule-forex-1',
    name: 'توصيات الفوركس العامة (Forex Signals)',
    isEnabled: true,
    sourceChatIds: ['-1001458920192'],
    destinationChatIds: ['-1001982736411'],
    sourceChatNames: ['Forex Gold VIP Signals'],
    destinationChatNames: ['My Trading Hub (Destination)'],
    includeKeywords: [],
    excludeKeywords: ['SCAM', 'PROMO', 'AD', 'DISCOUNT'],
    matchAllKeywords: false,
    caseSensitiveKeywords: false,
    regexPattern: '',
    regexFlags: 'i',
    allowTextOnly: true,
    allowPhotos: true,
    allowVideos: false,
    allowDocuments: false,
    allowAudio: false,
    allowVoice: false,
    allowLinks: true,
    allowAlbums: true,
    transformations: [],
    prefixText: '',
    suffixText: '',
    removeLinks: false,
    trimExtraLines: true,
    removeCustomSignatures: ['Join our VIP group'],
    appendSourceTimestamp: false,
    forwardingMode: 'COPY_CONTENT',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 3600000,
    lastSuccessfulExecution: Date.now() - 120000,
    totalProcessedCount: 42,
    totalForwardedCount: 38,
    totalFailedCount: 0,
  },
  {
    id: 'rule-gold-filter',
    name: 'إشارات الذهب XAUUSD BUY/SELL',
    isEnabled: true,
    sourceChatIds: ['-1001458920192'],
    destinationChatIds: ['-1001889201882'],
    sourceChatNames: ['Forex Gold VIP Signals'],
    destinationChatNames: ['Private Execution Channel'],
    includeKeywords: ['BUY', 'SELL'],
    excludeKeywords: ['RECAP', 'CLOSED'],
    matchAllKeywords: false,
    caseSensitiveKeywords: false,
    regexPattern: '\\b(BUY|SELL)\\b.*\\b(GOLD|XAUUSD)\\b',
    regexFlags: 'i',
    allowTextOnly: true,
    allowPhotos: true,
    allowVideos: true,
    allowDocuments: true,
    allowAudio: false,
    allowVoice: false,
    allowLinks: false,
    allowAlbums: true,
    transformations: [
      {
        id: 'trans-1',
        findText: 'GOLD',
        replaceWith: 'XAUUSD',
        type: 'EXACT_WORD',
        isCaseSensitive: false,
        isEnabled: true,
      },
    ],
    prefixText: '⚡ [VERIFIED SIGNAL]',
    suffixText: '⚠️ Strict Risk Management (Max 1% risk)',
    removeLinks: true,
    trimExtraLines: true,
    removeCustomSignatures: ['t.me/free_signals'],
    appendSourceTimestamp: true,
    forwardingMode: 'COPY_CONTENT',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 7200000,
    lastSuccessfulExecution: Date.now() - 300000,
    totalProcessedCount: 29,
    totalForwardedCount: 26,
    totalFailedCount: 0,
  },
  {
    id: 'rule-crypto-alpha',
    name: 'تنبيهات الكريبتو الحصرية (Crypto Alpha)',
    isEnabled: false,
    sourceChatIds: ['-1001672391024'],
    destinationChatIds: ['-1001889201882'],
    sourceChatNames: ['Crypto Market Alpha'],
    destinationChatNames: ['Private Execution Channel'],
    includeKeywords: ['ENTRY', 'TARGET', 'LONG', 'SHORT'],
    excludeKeywords: ['AIRDROP', 'GIVEAWAY'],
    matchAllKeywords: false,
    caseSensitiveKeywords: false,
    regexPattern: '',
    regexFlags: 'i',
    allowTextOnly: true,
    allowPhotos: true,
    allowVideos: false,
    allowDocuments: false,
    allowAudio: false,
    allowVoice: false,
    allowLinks: false,
    allowAlbums: false,
    transformations: [],
    prefixText: '💎 CRYPTO ALERT',
    suffixText: '',
    removeLinks: true,
    trimExtraLines: true,
    removeCustomSignatures: [],
    appendSourceTimestamp: true,
    forwardingMode: 'NATIVE_FORWARD',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    lastSuccessfulExecution: null,
    totalProcessedCount: 15,
    totalForwardedCount: 12,
    totalFailedCount: 1,
  },
];

export const INITIAL_LOGS: MessageProcessingLog[] = [
  {
    id: 'log-1',
    ruleId: 'rule-gold-filter',
    ruleName: 'إشارات الذهب XAUUSD BUY/SELL',
    sourceChatId: '-1001458920192',
    sourceChatName: 'Forex Gold VIP Signals',
    sourceMessageId: 89412,
    destinationChatId: '-1001889201882',
    destinationChatName: 'Private Execution Channel',
    destinationMessageId: 5412,
    messageType: 'TEXT',
    originalPreview: 'GOLD BUY NOW\nEntry: 2650.50\nSL: 2640.00\nTP1: 2665.00\nTP2: 2675.00\nJoin: https://t.me/spamlink',
    transformedPreview: '⚡ [VERIFIED SIGNAL]\n\nXAUUSD BUY NOW\nEntry: 2650.50\nSL: 2640.00\nTP1: 2665.00\nTP2: 2675.00\n\n⚠️ Strict Risk Management (Max 1% risk)\n\n— 📢 Forex Gold VIP Signals | ⏰ 2026-10-16 18:30',
    processingStatus: 'SUCCESS',
    attempts: 1,
    createdAt: Date.now() - 300000,
    completedAt: Date.now() - 299500,
  },
  {
    id: 'log-2',
    ruleId: 'rule-forex-1',
    ruleName: 'توصيات الفوركس العامة (Forex Signals)',
    sourceChatId: '-1001458920192',
    sourceChatName: 'Forex Gold VIP Signals',
    sourceMessageId: 89411,
    destinationChatId: '-1001982736411',
    destinationChatName: 'My Trading Hub (Destination)',
    messageType: 'TEXT',
    originalPreview: 'SPECIAL WEEKEND PROMO: 50% DISCOUNT on VIP memberships! DM @admin for details.',
    processingStatus: 'FILTERED_OUT',
    filterReason: 'Excluded by keyword: "PROMO"',
    attempts: 1,
    createdAt: Date.now() - 650000,
  },
  {
    id: 'log-3',
    ruleId: 'rule-gold-filter',
    ruleName: 'إشارات الذهب XAUUSD BUY/SELL',
    sourceChatId: '-1001458920192',
    sourceChatName: 'Forex Gold VIP Signals',
    sourceMessageId: 89410,
    destinationChatId: '-1001889201882',
    destinationChatName: 'Private Execution Channel',
    messageType: 'TEXT',
    originalPreview: 'Weekly market sentiment analysis: US Dollar index strengthening ahead of FOMC.',
    processingStatus: 'FILTERED_OUT',
    filterReason: 'Pattern "\\b(BUY|SELL)\\b.*\\b(GOLD|XAUUSD)\\b" did not match message content',
    attempts: 1,
    createdAt: Date.now() - 980000,
  },
  {
    id: 'log-4',
    ruleId: 'rule-crypto-alpha',
    ruleName: 'تنبيهات الكريبتو الحصرية (Crypto Alpha)',
    sourceChatId: '-1001672391024',
    sourceChatName: 'Crypto Market Alpha',
    sourceMessageId: 10423,
    destinationChatId: '-1001889201882',
    destinationChatName: 'Private Execution Channel',
    messageType: 'PHOTO',
    originalPreview: '[Chart Image] BTC/USDT Bull flag forming on 4H timeframe',
    processingStatus: 'FAILED',
    errorCode: 'FLOOD_WAIT_30',
    errorMessage: 'Telegram API rate limit reached (FLOOD_WAIT_30). Engine will back off and retry after wait duration.',
    errorStackTrace: 'org.telegram.tgnet.TelegramException: FLOOD_WAIT_30: Too Many Requests\n  at com.example.tforwarder.telegram.TelegramClient.forwardMessage(TelegramClient.kt:142)\n  at com.example.tforwarder.forwarding.MessageProcessor.processIncomingMessage(MessageProcessor.kt:98)',
    attempts: 2,
    createdAt: Date.now() - 1450000,
  },
];

const STORAGE_KEYS = {
  RULES: 'tforwarder_rules',
  LOGS: 'tforwarder_logs',
  CHATS: 'tforwarder_chats',
  AUTH: 'tforwarder_auth',
  SERVICE_ACTIVE: 'tforwarder_service_active',
  THEME: 'tforwarder_theme',
  LANG: 'tforwarder_lang',
};

export const StorageService = {
  getRules(): ForwardingRule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RULES);
      return data ? JSON.parse(data) : INITIAL_RULES;
    } catch {
      return INITIAL_RULES;
    }
  },

  saveRules(rules: ForwardingRule[]) {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
  },

  getLogs(): MessageProcessingLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      return data ? JSON.parse(data) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  },

  saveLogs(logs: MessageProcessingLog[]) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(0, 300))); // Keep last 300
  },

  getChats(): TelegramChat[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHATS);
      return data ? JSON.parse(data) : INITIAL_CHATS;
    } catch {
      return INITIAL_CHATS;
    }
  },

  saveChats(chats: TelegramChat[]) {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  },

  getAuth(): TelegramAuthState {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH);
      return data
        ? JSON.parse(data)
        : {
            isAuthorized: true,
            phoneNumber: '+971 50 123 4567',
            apiId: 20491823,
            apiHash: '7a9c8f1e2b4d6e0a8c2f1e4b6d8a0c2e',
            userFirstName: 'Eslam',
            userLastName: 'Developer',
            username: 'eslam_tg',
          };
    } catch {
      return { isAuthorized: false };
    }
  },

  saveAuth(auth: TelegramAuthState) {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(auth));
  },

  isServiceActive(): boolean {
    const val = localStorage.getItem(STORAGE_KEYS.SERVICE_ACTIVE);
    return val !== null ? val === 'true' : true;
  },

  setServiceActive(active: boolean) {
    localStorage.setItem(STORAGE_KEYS.SERVICE_ACTIVE, String(active));
  },

  clearLogs() {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
  },

  clearAllData() {
    localStorage.clear();
  },
};
