/**
 * Real Telegram Bot API Client
 * Connects directly to https://api.telegram.org with full CORS support.
 * Executes genuine Telegram operations: getMe, getChat, getUpdates, sendMessage, forwardMessage, copyMessage.
 */

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TelegramChatInfo {
  id: number | string;
  type: 'channel' | 'supergroup' | 'group' | 'private';
  title?: string;
  username?: string;
  description?: string;
}

export interface TelegramApiResponse<T> {
  ok: boolean;
  result?: T;
  error_code?: number;
  description?: string;
  parameters?: {
    retry_after?: number;
    migrate_to_chat_id?: number;
  };
}

export class RealTelegramApi {
  private baseUrl: string;

  constructor(private botToken: string) {
    this.baseUrl = `https://api.telegram.org/bot${botToken.trim()}`;
  }

  // 1. Verify Bot Token and retrieve bot profile
  async getMe(): Promise<{ success: boolean; bot?: TelegramUser; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/getMe`);
      const data: TelegramApiResponse<TelegramUser> = await res.json();
      if (data.ok && data.result) {
        return { success: true, bot: data.result };
      }
      return { success: false, error: data.description || 'Invalid Bot Token' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error connecting to Telegram' };
    }
  }

  // 2. Verify channel/chat existence and bot access
  async getChat(chatId: string): Promise<{ success: boolean; chat?: TelegramChatInfo; error?: string }> {
    try {
      const formattedChatId = chatId.trim().startsWith('@') || chatId.trim().startsWith('-')
        ? chatId.trim()
        : `@${chatId.trim()}`;

      const res = await fetch(`${this.baseUrl}/getChat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: formattedChatId }),
      });
      const data: TelegramApiResponse<TelegramChatInfo> = await res.json();
      if (data.ok && data.result) {
        return { success: true, chat: data.result };
      }
      return { success: false, error: data.description || 'Chat not found or bot lacks access' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to verify Telegram chat' };
    }
  }

  // 3. Send real text message to a channel/group/chat
  async sendMessage(
    chatId: string,
    text: string,
    options?: { parseMode?: 'Markdown' | 'HTML'; disableWebPagePreview?: boolean }
  ): Promise<{ success: boolean; messageId?: number; error?: string; raw?: any }> {
    try {
      const formattedChatId = chatId.trim().startsWith('@') || chatId.trim().startsWith('-')
        ? chatId.trim()
        : `@${chatId.trim()}`;

      const body: any = {
        chat_id: formattedChatId,
        text: text,
      };
      if (options?.parseMode) body.parse_mode = options.parseMode;
      if (options?.disableWebPagePreview) body.disable_web_page_preview = true;

      const res = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data: TelegramApiResponse<any> = await res.json();

      if (data.ok && data.result) {
        return { success: true, messageId: data.result.message_id, raw: data.result };
      }
      return { success: false, error: data.description || 'Failed to send message', raw: data };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error sending to Telegram' };
    }
  }

  // 4. Native Forward message with original attribution
  async forwardMessage(
    toChatId: string,
    fromChatId: string,
    messageId: number
  ): Promise<{ success: boolean; messageId?: number; error?: string }> {
    try {
      const formattedTo = toChatId.trim().startsWith('@') || toChatId.trim().startsWith('-')
        ? toChatId.trim()
        : `@${toChatId.trim()}`;
      const formattedFrom = fromChatId.trim().startsWith('@') || fromChatId.trim().startsWith('-')
        ? fromChatId.trim()
        : `@${fromChatId.trim()}`;

      const res = await fetch(`${this.baseUrl}/forwardMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: formattedTo,
          from_chat_id: formattedFrom,
          message_id: messageId,
        }),
      });
      const data: TelegramApiResponse<any> = await res.json();

      if (data.ok && data.result) {
        return { success: true, messageId: data.result.message_id };
      }
      return { success: false, error: data.description || 'Failed to forward message natively' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error forwarding on Telegram' };
    }
  }

  // 5. Copy message as new message with optional caption / modified text
  async copyMessage(
    toChatId: string,
    fromChatId: string,
    messageId: number,
    customCaption?: string
  ): Promise<{ success: boolean; messageId?: number; error?: string }> {
    try {
      const formattedTo = toChatId.trim().startsWith('@') || toChatId.trim().startsWith('-')
        ? toChatId.trim()
        : `@${toChatId.trim()}`;
      const formattedFrom = fromChatId.trim().startsWith('@') || fromChatId.trim().startsWith('-')
        ? fromChatId.trim()
        : `@${fromChatId.trim()}`;

      const body: any = {
        chat_id: formattedTo,
        from_chat_id: formattedFrom,
        message_id: messageId,
      };
      if (customCaption !== undefined) {
        body.caption = customCaption;
      }

      const res = await fetch(`${this.baseUrl}/copyMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data: TelegramApiResponse<any> = await res.json();

      if (data.ok && data.result) {
        return { success: true, messageId: data.result.message_id };
      }
      return { success: false, error: data.description || 'Failed to copy message' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error copying on Telegram' };
    }
  }

  // 6. Real-time Long Polling for incoming Telegram channel posts & messages
  async getUpdates(
    offset: number = 0,
    timeout: number = 25,
    signal?: AbortSignal
  ): Promise<{ success: boolean; updates: any[]; nextOffset: number; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/getUpdates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offset,
          timeout,
          allowed_updates: ['channel_post', 'message', 'edited_channel_post', 'edited_message'],
        }),
        signal,
      });

      const data: TelegramApiResponse<any[]> = await res.json();
      if (data.ok && Array.isArray(data.result)) {
        const nextOffset = data.result.length > 0
          ? Math.max(...data.result.map((u: any) => u.update_id)) + 1
          : offset;
        return { success: true, updates: data.result, nextOffset };
      }
      return { success: false, updates: [], nextOffset: offset, error: data.description };
    } catch (e: any) {
      if (e.name === 'AbortError') {
        return { success: true, updates: [], nextOffset: offset };
      }
      return { success: false, updates: [], nextOffset: offset, error: e.message };
    }
  }
}
