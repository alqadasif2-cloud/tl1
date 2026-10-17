import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage } from 'telegram/events';
import * as fs from 'fs';
import * as path from 'path';

const SESSION_FILE_PATH = path.resolve(process.cwd(), '.session_mtproto.json');

// Default Telegram public client API ID/Hash if user has not entered their own
const DEFAULT_API_ID = 2040;
const DEFAULT_API_HASH = 'b18441a1ff607e10a989891a5462e627';

export interface TelegramDialogInfo {
  id: string;
  title: string;
  type: 'CHANNEL' | 'SUPERGROUP' | 'GROUP' | 'PRIVATE';
  username?: string;
  canPostMessages: boolean;
  memberCount: number;
  unreadCount: number;
}

export interface MtprotoAuthState {
  isAuthorized: boolean;
  phoneNumber?: string;
  phoneCodeHash?: string;
  apiId?: number;
  apiHash?: string;
  user?: {
    id: string;
    firstName: string;
    lastName?: string;
    username?: string;
    phone?: string;
  };
  step: 'IDLE' | 'WAITING_CODE' | 'WAITING_2FA' | 'LOGGED_IN';
  error?: string;
}

export class TelegramMtprotoManager {
  private static instance: TelegramMtprotoManager;
  private client: TelegramClient | null = null;
  private stringSession: StringSession = new StringSession('');
  private apiId: number = DEFAULT_API_ID;
  private apiHash: string = DEFAULT_API_HASH;
  private currentPhoneNumber: string = '';
  private currentPhoneCodeHash: string = '';
  private isForwardingRunning: boolean = false;
  private currentRules: any[] = [];
  private onMessageProcessedCallback: ((log: any) => void) | null = null;

  private authState: MtprotoAuthState = {
    isAuthorized: false,
    step: 'IDLE',
  };

  private constructor() {
    this.restoreSessionFromFile();
  }

  public static getInstance(): TelegramMtprotoManager {
    if (!TelegramMtprotoManager.instance) {
      TelegramMtprotoManager.instance = new TelegramMtprotoManager();
    }
    return TelegramMtprotoManager.instance;
  }

  private restoreSessionFromFile() {
    try {
      if (fs.existsSync(SESSION_FILE_PATH)) {
        const raw = fs.readFileSync(SESSION_FILE_PATH, 'utf-8');
        const data = JSON.parse(raw);
        if (data.sessionString) {
          this.stringSession = new StringSession(data.sessionString);
          this.apiId = data.apiId || DEFAULT_API_ID;
          this.apiHash = data.apiHash || DEFAULT_API_HASH;
          this.currentPhoneNumber = data.phoneNumber || '';
          this.initClientAndVerify();
        }
      }
    } catch (e) {
      console.error('[MTProto] Failed to restore session from file:', e);
    }
  }

  private saveSessionToFile() {
    try {
      const data = {
        sessionString: this.stringSession.save(),
        apiId: this.apiId,
        apiHash: this.apiHash,
        phoneNumber: this.currentPhoneNumber,
        user: this.authState.user,
      };
      fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('[MTProto] Failed to save session to file:', e);
    }
  }

  private async initClientAndVerify() {
    try {
      this.client = new TelegramClient(this.stringSession, this.apiId, this.apiHash, {
        connectionRetries: 5,
        useWSS: false,
      });

      await this.client.connect();

      if (await this.client.checkAuthorization()) {
        const me: any = await this.client.getMe();
        this.authState = {
          isAuthorized: true,
          step: 'LOGGED_IN',
          phoneNumber: this.currentPhoneNumber || me.phone,
          user: {
            id: String(me.id),
            firstName: me.firstName || '',
            lastName: me.lastName || '',
            username: me.username || '',
            phone: me.phone || this.currentPhoneNumber,
          },
        };
        console.log('[MTProto] Restored authorization for personal user:', me.firstName, me.username);
      }
    } catch (e: any) {
      console.error('[MTProto] Session verification error:', e.message);
    }
  }

  public getAuthState(): MtprotoAuthState {
    return this.authState;
  }

  // 1. Send authentication code to personal phone number
  public async sendCode(phoneNumber: string, customApiId?: number, customApiHash?: string): Promise<{ success: boolean; error?: string }> {
    try {
      this.currentPhoneNumber = phoneNumber.trim();
      this.apiId = customApiId && customApiId > 0 ? customApiId : DEFAULT_API_ID;
      this.apiHash = customApiHash && customApiHash.trim().length > 0 ? customApiHash.trim() : DEFAULT_API_HASH;

      this.stringSession = new StringSession('');
      this.client = new TelegramClient(this.stringSession, this.apiId, this.apiHash, {
        connectionRetries: 5,
      });

      await this.client.connect();

      const res = await this.client.sendCode(
        {
          apiId: this.apiId,
          apiHash: this.apiHash,
        },
        this.currentPhoneNumber
      );

      this.currentPhoneCodeHash = res.phoneCodeHash;
      this.authState = {
        isAuthorized: false,
        step: 'WAITING_CODE',
        phoneNumber: this.currentPhoneNumber,
        phoneCodeHash: res.phoneCodeHash,
        apiId: this.apiId,
        apiHash: this.apiHash,
      };

      console.log('[MTProto] Login code successfully requested for:', this.currentPhoneNumber);
      return { success: true };
    } catch (e: any) {
      console.error('[MTProto] Error sending code:', e);
      this.authState.error = e.message || 'Failed to request code from Telegram';
      return { success: false, error: this.authState.error };
    }
  }

  // 2. Submit verification code received on user's Telegram/SMS
  public async signIn(phoneCode: string): Promise<{ success: boolean; requires2FA?: boolean; error?: string }> {
    try {
      if (!this.client) {
        throw new Error('Telegram client is not initialized. Please request code first.');
      }

      // Call signInUser with phoneCode function/string
      await (this.client as any).signInUser(
        {
          apiId: this.apiId,
          apiHash: this.apiHash,
        },
        {
          phoneNumber: this.currentPhoneNumber,
          phoneCodeHash: this.currentPhoneCodeHash,
          phoneCode: async () => phoneCode.trim(),
        }
      );

      const me: any = await this.client.getMe();
      this.authState = {
        isAuthorized: true,
        step: 'LOGGED_IN',
        phoneNumber: this.currentPhoneNumber,
        user: {
          id: String(me.id),
          firstName: me.firstName || '',
          lastName: me.lastName || '',
          username: me.username || '',
          phone: me.phone || this.currentPhoneNumber,
        },
      };

      this.saveSessionToFile();
      console.log('[MTProto] User signed in successfully:', me.firstName, me.username);
      return { success: true };
    } catch (e: any) {
      if (e.errorMessage === 'SESSION_PASSWORD_NEEDED' || e.message?.includes('2FA') || e.message?.includes('password')) {
        this.authState.step = 'WAITING_2FA';
        return { success: false, requires2FA: true };
      }
      console.error('[MTProto] Sign-in error:', e);
      return { success: false, error: e.message || 'Verification code failed' };
    }
  }

  // 3. Submit 2FA Cloud Password if enabled
  public async signIn2FA(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.client) {
        throw new Error('Telegram client is not initialized.');
      }

      await (this.client as any).signInWithPassword(
        {
          apiId: this.apiId,
          apiHash: this.apiHash,
        },
        {
          password: password.trim(),
        }
      );

      const me: any = await this.client.getMe();
      this.authState = {
        isAuthorized: true,
        step: 'LOGGED_IN',
        phoneNumber: this.currentPhoneNumber,
        user: {
          id: String(me.id),
          firstName: me.firstName || '',
          lastName: me.lastName || '',
          username: me.username || '',
          phone: me.phone || this.currentPhoneNumber,
        },
      };

      this.saveSessionToFile();
      console.log('[MTProto] 2FA Sign-in successful for:', me.firstName);
      return { success: true };
    } catch (e: any) {
      console.error('[MTProto] 2FA error:', e);
      return { success: false, error: e.message || 'Two-step verification password incorrect' };
    }
  }

  // 4. Fetch Real Dialogs (Channels, Supergroups, Groups, Chats where the user is a member)
  public async getDialogs(limit: number = 100): Promise<{ success: boolean; dialogs: TelegramDialogInfo[]; error?: string }> {
    try {
      if (!this.client || !this.authState.isAuthorized) {
        return { success: false, dialogs: [], error: 'Not authorized. Please log in with your phone number.' };
      }

      const dialogs = await this.client.getDialogs({ limit });
      const result: TelegramDialogInfo[] = [];

      for (const d of dialogs) {
        if (!d.entity) continue;
        const entity: any = d.entity;
        const isChannel = d.isChannel || entity.className === 'Channel';
        const isGroup = d.isGroup || entity.className === 'Chat';
        const isUser = d.isUser || entity.className === 'User';

        let type: 'CHANNEL' | 'SUPERGROUP' | 'GROUP' | 'PRIVATE' = 'PRIVATE';
        if (isChannel) {
          type = entity.megagroup ? 'SUPERGROUP' : 'CHANNEL';
        } else if (isGroup) {
          type = 'GROUP';
        }

        const id = String(d.id);
        const title = d.title || (entity.firstName ? `${entity.firstName} ${entity.lastName || ''}`.trim() : 'Chat');
        const username = entity.username || undefined;
        const memberCount = entity.participantsCount || 0;
        const unreadCount = d.unreadCount || 0;

        // Can the user post? Channels require admin/creator rights; groups/chats usually allow members
        const canPost = isChannel ? Boolean(entity.adminRights || entity.creator) : true;

        result.push({
          id,
          title,
          type,
          username,
          canPostMessages: canPost,
          memberCount,
          unreadCount,
        });
      }

      return { success: true, dialogs: result };
    } catch (e: any) {
      console.error('[MTProto] Failed to get dialogs:', e);
      return { success: false, dialogs: [], error: e.message || 'Failed to fetch Telegram dialogs' };
    }
  }

  // 5. Send real message to any chat/channel
  public async sendMessage(chatId: string, text: string): Promise<{ success: boolean; messageId?: number; error?: string }> {
    try {
      if (!this.client || !this.authState.isAuthorized) {
        return { success: false, error: 'Not authorized' };
      }

      const entity = await this.client.getEntity(chatId);
      const res: any = await this.client.sendMessage(entity, { message: text });
      return { success: true, messageId: res.id };
    } catch (e: any) {
      console.error('[MTProto] sendMessage error:', e);
      return { success: false, error: e.message || 'Failed to send message' };
    }
  }

  // 6. Forward real message natively with author attribution
  public async forwardMessage(toChatId: string, fromChatId: string, messageId: number): Promise<{ success: boolean; messageId?: number; error?: string }> {
    try {
      if (!this.client || !this.authState.isAuthorized) {
        return { success: false, error: 'Not authorized' };
      }

      const toEntity = await this.client.getEntity(toChatId);
      const fromEntity = await this.client.getEntity(fromChatId);

      const res: any = await this.client.forwardMessages(toEntity, {
        messages: [messageId],
        fromPeer: fromEntity,
      });

      const forwardId = Array.isArray(res) ? res[0]?.id : res?.id;
      return { success: true, messageId: forwardId };
    } catch (e: any) {
      console.error('[MTProto] forwardMessage error:', e);
      return { success: false, error: e.message || 'Failed to forward message' };
    }
  }

  // 7. Start real-time background listener on the personal account
  public startForwardingEngine(rules: any[], onLog: (log: any) => void) {
    if (this.isForwardingRunning) {
      this.currentRules = rules;
      this.onMessageProcessedCallback = onLog;
      return;
    }

    if (!this.client || !this.authState.isAuthorized) {
      console.log('[MTProto Engine] Cannot start forwarding engine: not logged in.');
      return;
    }

    this.isForwardingRunning = true;
    this.currentRules = rules;
    this.onMessageProcessedCallback = onLog;

    this.client.addEventHandler(async (event: any) => {
      if (!this.isForwardingRunning) return;

      const message = event.message;
      if (!message) return;

      const sourceChatId = String(message.chatId || message.peerId?.channelId || message.peerId?.chatId || '');
      const text = message.message || message.text || '';
      const messageId = message.id;

      // Find matching active rules
      const matched = this.currentRules.filter(
        (r) => r.isEnabled && (r.sourceChatIds.includes(sourceChatId) || r.sourceChatIds.includes(`-100${sourceChatId}`) || r.sourceChatIds.includes('*'))
      );

      for (const rule of matched) {
        for (const destId of rule.destinationChatIds) {
          try {
            // Apply keyword & regex filters
            let passesKeywords = true;
            if (rule.includeKeywords && rule.includeKeywords.length > 0) {
              passesKeywords = rule.includeKeywords.some((kw: string) => text.toLowerCase().includes(kw.trim().toLowerCase()));
            }
            if (rule.excludeKeywords && rule.excludeKeywords.length > 0) {
              const excluded = rule.excludeKeywords.some((kw: string) => text.toLowerCase().includes(kw.trim().toLowerCase()));
              if (excluded) passesKeywords = false;
            }

            if (!passesKeywords) {
              if (this.onMessageProcessedCallback) {
                this.onMessageProcessedCallback({
                  id: `log-${Date.now()}`,
                  ruleId: rule.id,
                  ruleName: rule.name,
                  sourceChatId,
                  sourceChatName: sourceChatId,
                  sourceMessageId: messageId,
                  destinationChatId: destId,
                  destinationChatName: destId,
                  messageType: 'TEXT',
                  originalPreview: text,
                  processingStatus: 'FILTERED_OUT',
                  filterReason: 'Excluded by keywords',
                  attempts: 1,
                  createdAt: Date.now(),
                });
              }
              continue;
            }

            // Apply transformations
            let transformed = text;
            if (rule.transformations && rule.transformations.length > 0) {
              for (const t of rule.transformations) {
                if (t.findText) {
                  transformed = transformed.split(t.findText).join(t.replaceWith || '');
                }
              }
            }
            if (rule.prefixText) transformed = `${rule.prefixText}\n\n${transformed}`;
            if (rule.suffixText) transformed = `${transformed}\n\n${rule.suffixText}`;

            // Send or forward
            if (rule.forwardingMode === 'NATIVE_FORWARD') {
              await this.forwardMessage(destId, sourceChatId, messageId);
            } else {
              await this.sendMessage(destId, transformed);
            }

            if (this.onMessageProcessedCallback) {
              this.onMessageProcessedCallback({
                id: `log-${Date.now()}`,
                ruleId: rule.id,
                ruleName: rule.name,
                sourceChatId,
                sourceChatName: sourceChatId,
                sourceMessageId: messageId,
                destinationChatId: destId,
                destinationChatName: destId,
                messageType: 'TEXT',
                originalPreview: text,
                transformedPreview: transformed,
                processingStatus: 'SUCCESS',
                attempts: 1,
                createdAt: Date.now(),
                completedAt: Date.now(),
              });
            }
          } catch (err: any) {
            console.error('[MTProto Engine] Forward error:', err);
          }
        }
      }
    }, new NewMessage({}));

    console.log('[MTProto Engine] Background forwarding engine started with active rules:', rules.length);
  }

  public stopForwardingEngine() {
    this.isForwardingRunning = false;
    console.log('[MTProto Engine] Forwarding engine stopped.');
  }

  // 8. Logout
  public async logout() {
    try {
      if (this.client) {
        await this.client.disconnect();
      }
      this.client = null;
      this.stringSession = new StringSession('');
      this.authState = { isAuthorized: false, step: 'IDLE' };
      if (fs.existsSync(SESSION_FILE_PATH)) {
        fs.unlinkSync(SESSION_FILE_PATH);
      }
      console.log('[MTProto] User logged out.');
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}
