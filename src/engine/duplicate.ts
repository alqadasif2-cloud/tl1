export class DuplicateDetector {
  private processedMap = new Map<string, number>();

  private makeKey(sourceChatId: string, messageId: number, destinationChatId: string, ruleId: string): string {
    return `${sourceChatId}:${messageId}:${destinationChatId}:${ruleId}`;
  }

  private simpleHash(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash.toString(16);
  }

  isDuplicate(sourceChatId: string, messageId: number, destinationChatId: string, ruleId: string, text: string): boolean {
    const key = this.makeKey(sourceChatId, messageId, destinationChatId, ruleId);
    if (this.processedMap.has(key)) {
      return true;
    }

    // Check content hash duplicate within 5 minutes
    const contentKey = `hash:${destinationChatId}:${this.simpleHash(text)}`;
    const previousTime = this.processedMap.get(contentKey);
    if (previousTime && Date.now() - previousTime < 5 * 60 * 1000) {
      return true;
    }

    return false;
  }

  recordProcessed(sourceChatId: string, messageId: number, destinationChatId: string, ruleId: string, text: string) {
    const key = this.makeKey(sourceChatId, messageId, destinationChatId, ruleId);
    this.processedMap.set(key, Date.now());

    const contentKey = `hash:${destinationChatId}:${this.simpleHash(text)}`;
    this.processedMap.set(contentKey, Date.now());
  }

  clear() {
    this.processedMap.clear();
  }
}
