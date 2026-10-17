import { ReplacementRule } from '../types';

export interface TransformationConfig {
  replacements: ReplacementRule[];
  prefixText: string;
  suffixText: string;
  removeLinks: boolean;
  trimExtraLines: boolean;
  removeCustomSignatures: string[];
  appendSourceTimestamp: boolean;
  sourceChannelTitle?: string;
}

export class TextTransformer {
  constructor(private config: TransformationConfig) {}

  transform(originalText: string): string {
    let result = originalText;

    // 1. Remove custom signatures
    if (this.config.removeCustomSignatures && this.config.removeCustomSignatures.length > 0) {
      for (const sig of this.config.removeCustomSignatures) {
        const cleanSig = sig.trim();
        if (cleanSig) {
          result = result.split(cleanSig).join('');
        }
      }
    }

    // 2. Remove URLs and channel mentions
    if (this.config.removeLinks) {
      const urlPattern = /(https?:\/\/[^\s]+|t\.me\/[^\s]+|@[a-zA-Z0-9_]{4,})/gi;
      result = result.replace(urlPattern, '');
    }

    // 3. Sequential replacement pipeline
    for (const rule of this.config.replacements) {
      if (!rule.isEnabled || !rule.findText) continue;

      switch (rule.type) {
        case 'EXACT_WORD': {
          // Word boundary replacement (supporting latin & arabic letters)
          const escaped = rule.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(^|\\s|[.,!?;:()""'])${escaped}($|\\s|[.,!?;:()""'])`, rule.isCaseSensitive ? 'g' : 'gi');
          result = result.replace(regex, `$1${rule.replaceWith}$2`);
          break;
        }
        case 'PHRASE': {
          if (rule.isCaseSensitive) {
            result = result.split(rule.findText).join(rule.replaceWith);
          } else {
            const escaped = rule.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escaped, 'gi');
            result = result.replace(regex, rule.replaceWith);
          }
          break;
        }
        case 'REGEX': {
          try {
            const regex = new RegExp(rule.findText, rule.isCaseSensitive ? 'g' : 'gi');
            result = result.replace(regex, rule.replaceWith);
          } catch (e) {
            // Ignore malformed regex during live typing
          }
          break;
        }
        case 'DELETE_MATCH': {
          const escaped = rule.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escaped, rule.isCaseSensitive ? 'g' : 'gi');
          result = result.replace(regex, '');
          break;
        }
      }
    }

    // 4. Clean extra lines
    if (this.config.trimExtraLines) {
      result = result.replace(/\n{3,}/g, '\n\n').trim();
    }

    // 5. Add prefix
    if (this.config.prefixText && this.config.prefixText.trim()) {
      result = `${this.config.prefixText.trim()}\n\n${result}`;
    }

    // 6. Add suffix
    if (this.config.suffixText && this.config.suffixText.trim()) {
      result = `${result}\n\n${this.config.suffixText.trim()}`;
    }

    // 7. Append Source & Timestamp
    if (this.config.appendSourceTimestamp) {
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const sourceTag = this.config.sourceChannelTitle ? `📢 ${this.config.sourceChannelTitle} | ` : '';
      result = `${result}\n\n— ${sourceTag}⏰ ${timeStr}`;
    }

    return result.trim();
  }
}
