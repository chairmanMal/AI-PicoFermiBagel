// Simple sound utility for audio feedback
class SoundUtils {
  private audioContext: AudioContext | null = null;
  private masterVolume: number = 0.2; // Default to 20% volume

  constructor() {
    // Initialize AudioContext on first use
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext) {
      this.initializeAudioContext();
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn('Failed to resume audio context:', error);
      }
    }
  }

  // Volume control methods
  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
  }

  getVolume(): number {
    return this.masterVolume;
  }

  // Play a simple beep sound for digit placement
  async playDigitPlaceSound() {
    try {
      await this.ensureAudioContext();
      
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Pleasant click sound: short, mid-frequency tone
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.type = 'sine';

      // Quick fade in/out for a clean click
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2 * this.masterVolume, this.audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.08);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.08);
    } catch (error) {
      console.warn('Failed to play digit place sound:', error);
    }
  }

  // Play a 'drip' sound for drag and drop placement
  async playDripSound() {
    try {
      await this.ensureAudioContext();
      
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Drip sound: starts high and drops down quickly
      oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.15);
      oscillator.type = 'sine';

      // Quick attack, then fade out like a water drop
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.25 * this.masterVolume, this.audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.02 * this.masterVolume, this.audioContext.currentTime + 0.15);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.15);
    } catch (error) {
      console.warn('Failed to play drip sound:', error);
    }
  }

  // Play a success sound for completing a guess
  async playGuessCompleteSound() {
    try {
      await this.ensureAudioContext();
      
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Higher pitch for completion
      oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3 * this.masterVolume, this.audioContext.currentTime + 0.02);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.15);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.15);
    } catch (error) {
      console.warn('Failed to play guess complete sound:', error);
    }
  }

  // Play a "dud" sound for redundant/invalid digit placement
  async playDudSound() {
    try {
      await this.ensureAudioContext();
      
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Low, buzzy sound for error
      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
      oscillator.type = 'sawtooth';

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.08 * this.masterVolume, this.audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.12);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.12);
    } catch (error) {
      console.warn('Failed to play dud sound:', error);
    }
  }

  // Play a "blupper" sound for game loss
  async playGameLostSound() {
    try {
      await this.ensureAudioContext();
      
      if (!this.audioContext) return;

      // Create a descending tone sequence
      const frequencies = [400, 350, 300, 250];
      let delay = 0;

      for (const freq of frequencies) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + delay);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(0.1 * this.masterVolume, this.audioContext.currentTime + delay + 0.02);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + delay + 0.15);

        oscillator.start(this.audioContext.currentTime + delay);
        oscillator.stop(this.audioContext.currentTime + delay + 0.15);

        delay += 0.12;
      }
    } catch (error) {
      console.warn('Failed to play game lost sound:', error);
    }
  }

  // Play a celebration sound for game win
  async playGameWonSound() {
    try {
      await this.ensureAudioContext();
      
      if (!this.audioContext) return;

      // Create an ascending celebratory sequence
      const frequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6
      let delay = 0;

      for (const freq of frequencies) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + delay);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(0.12 * this.masterVolume, this.audioContext.currentTime + delay + 0.02);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + delay + 0.2);

        oscillator.start(this.audioContext.currentTime + delay);
        oscillator.stop(this.audioContext.currentTime + delay + 0.2);

        delay += 0.15;
      }

      // Add a final flourish
      setTimeout(() => {
        if (this.audioContext) {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);

          oscillator.frequency.setValueAtTime(1047, this.audioContext.currentTime);
          oscillator.type = 'sine';

          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.15 * this.masterVolume, this.audioContext.currentTime + 0.02);
          gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.4);

          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.4);
        }
      }, 600);
    } catch (error) {
      console.warn('Failed to play game won sound:', error);
    }
  }
}

// Create a singleton instance
export const soundUtils = new SoundUtils(); 