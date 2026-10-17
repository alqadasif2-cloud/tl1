import { TelegramChat } from '../types';

export interface MtprotoStatusResponse {
  success: boolean;
  state: {
    isAuthorized: boolean;
    phoneNumber?: string;
    phoneCodeHash?: string;
    step: 'IDLE' | 'WAITING_CODE' | 'WAITING_2FA' | 'LOGGED_IN';
    user?: {
      id: string;
      firstName: string;
      lastName?: string;
      username?: string;
      phone?: string;
    };
    error?: string;
  };
}

export const MtprotoClient = {
  async getStatus(): Promise<MtprotoStatusResponse> {
    try {
      const res = await fetch('/api/telegram/mtproto/status');
      return await res.json();
    } catch (e: any) {
      return { success: false, state: { isAuthorized: false, step: 'IDLE', error: e.message } };
    }
  },

  async sendCode(phoneNumber: string, apiId?: number, apiHash?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/telegram/mtproto/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, apiId, apiHash }),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async signIn(phoneCode: string): Promise<{ success: boolean; requires2FA?: boolean; error?: string }> {
    try {
      const res = await fetch('/api/telegram/mtproto/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneCode }),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async signIn2FA(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/telegram/mtproto/2fa-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async getDialogs(): Promise<{ success: boolean; dialogs: TelegramChat[]; error?: string }> {
    try {
      const res = await fetch('/api/telegram/mtproto/dialogs');
      const data = await res.json();
      if (data.success && Array.isArray(data.dialogs)) {
        return { success: true, dialogs: data.dialogs };
      }
      return { success: false, dialogs: [], error: data.error };
    } catch (e: any) {
      return { success: false, dialogs: [], error: e.message };
    }
  },

  async sendMessage(chatId: string, text: string): Promise<{ success: boolean; messageId?: number; error?: string }> {
    try {
      const res = await fetch('/api/telegram/mtproto/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, text }),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async startEngine(rules: any[]): Promise<{ success: boolean }> {
    try {
      const res = await fetch('/api/telegram/mtproto/engine/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules }),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async stopEngine(): Promise<{ success: boolean }> {
    try {
      const res = await fetch('/api/telegram/mtproto/engine/stop', {
        method: 'POST',
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async logout(): Promise<{ success: boolean }> {
    try {
      const res = await fetch('/api/telegram/mtproto/logout', {
        method: 'POST',
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },
};
