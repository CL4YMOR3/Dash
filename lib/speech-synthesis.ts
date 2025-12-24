// speech-synthesis.ts
// Simple wrapper for the Web Speech API's speech synthesis functionality

export type SpeechOptions = {
    rate?: number;  // 0.1 to 10
    pitch?: number;  // 0 to 2
    volume?: number;  // 0 to 1
    lang?: string;  // e.g., 'en-US'
  }
  
  const defaultOptions: SpeechOptions = {
    rate: 1,
    pitch: 1,
    volume: 1,
    lang: 'en-US'
  };
  
  class SpeechSynthesisService {
    private isSpeaking: boolean = false;
    private options: SpeechOptions;
    private utterance: SpeechSynthesisUtterance | null = null;
  
    constructor(options: SpeechOptions = {}) {
      this.options = { ...defaultOptions, ...options };
      
      // Check browser support
      if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported in this browser');
      }
    }
  
    /**
     * Speak the given text
     */
    private queue: string[] = [];
private isProcessingQueue: boolean = false;

speak(text: string): Promise<void> {
  if (!text) return Promise.resolve();
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve();
  }

  // Add the text to the queue
  this.queue.push(text);

  // Process the queue if not already processing
  if (!this.isProcessingQueue) {
    this.processQueue();
  }

  return Promise.resolve();
}

private processQueue(): void {
  if (this.queue.length === 0) {
    this.isProcessingQueue = false;
    return;
  }

  this.isProcessingQueue = true;
  const text = this.queue.shift()!;

  this.isSpeaking = true;
  this.utterance = new SpeechSynthesisUtterance(text);

  // Apply options
  this.utterance.rate = this.options.rate!;
  this.utterance.pitch = this.options.pitch!;
  this.utterance.volume = this.options.volume!;
  this.utterance.lang = this.options.lang!;

  // Set event handlers
  this.utterance.onend = () => {
    this.isSpeaking = false;
    this.utterance = null;
    this.processQueue(); // Process the next item in the queue
  };

  this.utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event);
    this.isSpeaking = false;
    this.utterance = null;
    this.processQueue(); // Process the next item in the queue
  };

  // Start speaking
  window.speechSynthesis.speak(this.utterance);
}
  
    /**
     * Cancel any ongoing speech
     */
    cancel(): void {
      if (this.isSpeaking) {
        window.speechSynthesis.cancel();
        this.isSpeaking = false;
        this.utterance = null;
      }
    }
  
    /**
     * Check if speech is currently being spoken
     */
    isCurrentlySpeaking(): boolean {
      return this.isSpeaking;
    }
  
    // Removed setEnabled method
  
    /**
     * Update speech options
     */
    updateOptions(options: SpeechOptions): void {
      this.options = { ...this.options, ...options };
    }
  }
  
  // Create singleton instance
  export const speechService = new SpeechSynthesisService();
  
  export default speechService;