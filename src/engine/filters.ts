import { TelegramMessageType } from '../types';

export interface FilterResult {
  passed: boolean;
  reason?: string;
}

export class KeywordFilter {
  constructor(
    private includeKeywords: string[],
    private excludeKeywords: string[],
    private matchAll: boolean = false,
    private caseSensitive: boolean = false
  ) {}

  evaluate(text: string): FilterResult {
    const normalizedText = this.caseSensitive ? text : text.toLowerCase();

    // 1. Exclude keywords
    for (const kw of this.excludeKeywords) {
      const clean = kw.trim();
      if (!clean) continue;
      const target = this.caseSensitive ? clean : clean.toLowerCase();
      if (normalizedText.includes(target)) {
        return {
          passed: false,
          reason: `Excluded by keyword: "${clean}"`,
        };
      }
    }

    // 2. Include keywords
    const activeIncludes = this.includeKeywords
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (activeIncludes.length === 0) {
      return { passed: true };
    }

    if (this.matchAll) {
      const allPresent = activeIncludes.every((kw) => {
        const target = this.caseSensitive ? kw : kw.toLowerCase();
        return normalizedText.includes(target);
      });
      return allPresent
        ? { passed: true }
        : {
            passed: false,
            reason: `Did not match all required keywords (Match All enabled)`,
          };
    } else {
      const anyPresent = activeIncludes.some((kw) => {
        const target = this.caseSensitive ? kw : kw.toLowerCase();
        return normalizedText.includes(target);
      });
      return anyPresent
        ? { passed: true }
        : {
            passed: false,
            reason: `None of the required keywords were found in message`,
          };
    }
  }
}

export class RegexFilter {
  private regex: RegExp | null = null;
  private compileError: string | null = null;

  constructor(pattern: string, flags: string = 'i') {
    if (pattern && pattern.trim().length > 0) {
      try {
        this.regex = new RegExp(pattern, flags);
      } catch (e: any) {
        this.compileError = e.message || 'Invalid Regular Expression';
      }
    }
  }

  get isValid(): boolean {
    return this.compileError === null;
  }

  get error(): string | null {
    return this.compileError;
  }

  evaluate(text: string): FilterResult {
    if (!this.regex) {
      if (this.compileError) {
        return { passed: false, reason: `Regex error: ${this.compileError}` };
      }
      return { passed: true };
    }

    const matches = this.regex.test(text);
    return matches
      ? { passed: true }
      : {
          passed: false,
          reason: `Pattern "${this.regex.source}" did not match message content`,
        };
  }

  static validatePattern(pattern: string, flags: string = 'i'): { isValid: boolean; error?: string } {
    if (!pattern || !pattern.trim()) return { isValid: true };
    try {
      new RegExp(pattern, flags);
      return { isValid: true };
    } catch (e: any) {
      return { isValid: false, error: e.message };
    }
  }
}

export class MessageTypeFilter {
  constructor(
    private allowTextOnly: boolean,
    private allowPhotos: boolean,
    private allowVideos: boolean,
    private allowDocuments: boolean,
    private allowAudio: boolean,
    private allowVoice: boolean,
    private allowLinks: boolean,
    private allowAlbums: boolean
  ) {}

  evaluate(type: TelegramMessageType, hasLinks: boolean): FilterResult {
    if (hasLinks && !this.allowLinks) {
      return { passed: false, reason: 'Messages containing links or @mentions are disallowed' };
    }

    let allowed = false;
    switch (type) {
      case 'TEXT':
        allowed = this.allowTextOnly;
        break;
      case 'PHOTO':
        allowed = this.allowPhotos;
        break;
      case 'VIDEO':
        allowed = this.allowVideos;
        break;
      case 'DOCUMENT':
        allowed = this.allowDocuments;
        break;
      case 'AUDIO':
        allowed = this.allowAudio;
        break;
      case 'VOICE':
        allowed = this.allowVoice;
        break;
      case 'ALBUM':
        allowed = this.allowAlbums;
        break;
      default:
        allowed = false;
    }

    return allowed
      ? { passed: true }
      : { passed: false, reason: `Message media type "${type}" is rejected by rule settings` };
  }
}
