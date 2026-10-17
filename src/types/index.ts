export type TelegramMessageType =
  | 'TEXT'
  | 'PHOTO'
  | 'VIDEO'
  | 'DOCUMENT'
  | 'AUDIO'
  | 'VOICE'
  | 'ALBUM';

export type ForwardingMode =
  | 'NATIVE_FORWARD'
  | 'COPY_CONTENT'
  | 'COPY_WITHOUT_AUTHOR';

export type ProcessingStatus =
  | 'SUCCESS'
  | 'FILTERED_OUT'
  | 'FAILED'
  | 'DUPLICATE_SKIPPED'
  | 'PENDING_RETRY';

export type ReplacementType =
  | 'EXACT_WORD'
  | 'PHRASE'
  | 'REGEX'
  | 'DELETE_MATCH';

export interface ReplacementRule {
  id: string;
  findText: string;
  replaceWith: string;
  type: ReplacementType;
  isCaseSensitive: boolean;
  isEnabled: boolean;
}

export interface ForwardingRule {
  id: string;
  name: string;
  isEnabled: boolean;
  sourceChatIds: string[];
  destinationChatIds: string[];
  sourceChatNames: string[];
  destinationChatNames: string[];
  
  // Keyword Filters
  includeKeywords: string[];
  excludeKeywords: string[];
  matchAllKeywords: boolean;
  caseSensitiveKeywords: boolean;
  regexPattern: string;
  regexFlags: string;

  // Media Types
  allowTextOnly: boolean;
  allowPhotos: boolean;
  allowVideos: boolean;
  allowDocuments: boolean;
  allowAudio: boolean;
  allowVoice: boolean;
  allowLinks: boolean;
  allowAlbums: boolean;

  // Transformations
  transformations: ReplacementRule[];
  prefixText: string;
  suffixText: string;
  removeLinks: boolean;
  trimExtraLines: boolean;
  removeCustomSignatures: string[];
  appendSourceTimestamp: boolean;

  // Mode & Metrics
  forwardingMode: ForwardingMode;
  createdAt: number;
  updatedAt: number;
  lastSuccessfulExecution: number | null;
  totalProcessedCount: number;
  totalForwardedCount: number;
  totalFailedCount: number;
}

export interface MessageProcessingLog {
  id: string;
  ruleId: string;
  ruleName: string;
  sourceChatId: string;
  sourceChatName: string;
  sourceMessageId: number;
  destinationChatId: string;
  destinationChatName: string;
  destinationMessageId?: number;
  messageType: TelegramMessageType;
  originalPreview: string;
  transformedPreview?: string;
  processingStatus: ProcessingStatus;
  errorCode?: string;
  errorMessage?: string;
  errorStackTrace?: string;
  filterReason?: string;
  attempts: number;
  createdAt: number;
  completedAt?: number;
}

export interface TelegramChat {
  id: string;
  title: string;
  type: 'CHANNEL' | 'SUPERGROUP' | 'GROUP' | 'PRIVATE';
  username?: string;
  canPostMessages: boolean;
  memberCount: number;
  photoUrl?: string;
}

export interface TelegramAuthState {
  isAuthorized: boolean;
  phoneNumber?: string;
  apiId?: number;
  apiHash?: string;
  botToken?: string;
  connectionMode?: 'BOT_API' | 'USER_MTPROTO';
  needsCode?: boolean;
  needs2FA?: boolean;
  userFirstName?: string;
  userLastName?: string;
  username?: string;
  error?: string;
}

export interface IncomingMessagePayload {
  messageId: number;
  sourceChatId: string;
  sourceChatName: string;
  text: string;
  messageType: TelegramMessageType;
  hasLinks: boolean;
  mediaFileId?: string;
  isAlbum?: boolean;
  timestamp: number;
}

export type AppScreenId =
  | 'splash'
  | 'api_setup'
  | 'login'
  | 'verification'
  | 'two_step'
  | 'dashboard'
  | 'sources'
  | 'destinations'
  | 'rules'
  | 'rule_wizard'
  | 'rule_editor'
  | 'filters'
  | 'transformations'
  | 'preview'
  | 'logs'
  | 'error_details'
  | 'settings'
  | 'account_info'
  | 'storage'
  | 'diagnostics'
  | 'code_exporter'
  | 'real_telegram';
