// High-performance sound utility with iOS silent mode compatibility
class SoundUtils {
  private masterVolume: number = 0.1; // Reduced from 0.2 to 0.1 (10% instead of 20%)
  private audioContextActivated: boolean = false;
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private preCalculatedAudio: Map<number, Map<string, HTMLAudioElement[]>> = new Map(); // Pre-calculated volume levels
  private currentVolumeLevel: number = 5; // Current volume level (0-50 for 0-100% in 2% increments)
  private currentIndex: Map<string, number> = new Map(); // Round-robin for HTML5 audio
  private lastVolumeTestTime: number = 0; // Prevent overlapping volume test sounds
  private volumeStabilityTimer: number | null = null; // Timer for volume stability
  private pendingVolumeLevel: number | null = null; // Pending volume level to generate
  private isGeneratingLevel: boolean = false; // Prevent overlapping level generation

  constructor() {
    console.log('🎵 SoundUtils constructor - initializing hybrid audio system with lazy volume loading...');
    this.configureMediaSession();
    this.initializeAudioContext();
    this.initializeRoundRobinIndices();
    this.generateVolumeLevel(5); // Generate default level (10%) immediately
    
    // Ensure default volume level is ready for immediate playback
    this.ensureDefaultVolumeReady();
  }

  // Ensure default volume level is ready for immediate playback
  private async ensureDefaultVolumeReady() {
    // Wait a bit for the initial generation to complete
    setTimeout(async () => {
      if (!this.preCalculatedAudio.has(this.currentVolumeLevel)) {
        console.log('🎵 ⚠️ Default volume level not ready, regenerating...');
        await this.generateVolumeLevel(this.currentVolumeLevel);
      } else {
        console.log('🎵 ✅ Default volume level ready for playback');
      }
    }, 100);
  }

  private initializeAudioContext() {
    try {
      // Create AudioContext (will be suspended on iOS until activated)
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🎵 🎼 AudioContext created, state:', this.audioContext.state);
      
      // Pre-generate all audio buffers
      this.generateAudioBuffers();
    } catch (error) {
      console.error('🎵 ❌ Failed to create AudioContext:', error);
    }
  }

  private initializeRoundRobinIndices() {
    // Initialize round-robin indices for all sound types
    const soundNames = ['digit', 'drip', 'complete', 'dud', 'lost', 'won'];
    soundNames.forEach(name => {
      this.currentIndex.set(name, 0);
    });
  }

  private async generateVolumeLevel(level: number) {
    if (this.preCalculatedAudio.has(level)) {
      console.log(`🎵 📊 Volume level ${level} already exists, skipping generation`);
      return;
    }

    if (this.isGeneratingLevel) {
      console.log(`🎵 ⚠️ Already generating a volume level, skipping...`);
      return;
    }

    this.isGeneratingLevel = true;
    const volumePercent = level * 10; // 0%, 10%, 20%, etc.
    
    // Use exponential curve for much better volume progression
    // Level 0 = 0%, Level 1 = ~1%, Level 5 = ~16%, Level 10 = 100%
    const volumeDecimal = level === 0 ? 0 : Math.pow(level / 10, 2.5);
    
    console.log(`🎵 📊 Generating volume level ${level} (${volumePercent}% slider) with amplitude ${(volumeDecimal * 100).toFixed(1)}%...`);
    
    try {
      // Create audio elements for this specific volume level
      const levelAudioMap = new Map<string, HTMLAudioElement[]>();
      
      const sounds = {
        digit: this.createToneDataUrlWithVolume(800, 0.08, volumeDecimal),
        drip: this.createSweepDataUrlWithVolume(1200, 400, 0.15, volumeDecimal),
        complete: this.createToneDataUrlWithVolume(1200, 0.15, volumeDecimal),
        dud: this.createToneDataUrlWithVolume(200, 0.12, volumeDecimal),
        lost: this.createSequenceDataUrlWithVolume([400, 350, 300, 250], volumeDecimal),
        won: this.createSequenceDataUrlWithVolume([523, 659, 784, 1047], volumeDecimal)
      };

      // Create 2 instances of each sound for overlapping playback
      const poolSize = 2;
      
      for (const [name, dataUrl] of Object.entries(sounds)) {
        const audioPool: HTMLAudioElement[] = [];
        
        for (let i = 0; i < poolSize; i++) {
          const audio = new Audio();
          
          // Configure for iOS compatibility and silent mode - CRITICAL FOR SILENT MODE!
          audio.setAttribute('webkit-playsinline', 'true');
          audio.setAttribute('playsinline', 'true');
          audio.preload = 'auto';
          audio.volume = 1.0; // Always max volume since amplitude is controlled at generation level
          
          // iOS-specific attributes for silent mode audio
          audio.muted = false;
          audio.defaultMuted = false;
          
          // Set source and ensure it's loaded
          audio.src = dataUrl;
          audio.load();
          
          // Wait for audio to be ready
          await new Promise<void>((resolve) => {
            const timeout = setTimeout(() => {
              console.log(`🎵 ⚠️ Audio element ${i} for ${name} took too long to load, continuing anyway`);
              resolve();
            }, 2000);
            
            const onReady = () => {
              clearTimeout(timeout);
              audio.removeEventListener('canplaythrough', onReady);
              audio.removeEventListener('error', onError);
              resolve();
            };
            
            const onError = (e: Event) => {
              clearTimeout(timeout);
              audio.removeEventListener('canplaythrough', onReady);
              audio.removeEventListener('error', onError);
              console.error(`🎵 ❌ Audio element ${i} for ${name} failed to load:`, e);
              resolve(); // Continue anyway
            };
            
            if (audio.readyState >= 3) { // HAVE_FUTURE_DATA or better
              onReady();
            } else {
              audio.addEventListener('canplaythrough', onReady);
              audio.addEventListener('error', onError);
            }
          });
          
          audioPool.push(audio);
        }
        
        levelAudioMap.set(name, audioPool);
      }
      
      // Store this volume level
      this.preCalculatedAudio.set(level, levelAudioMap);
      
      // Clean up data URLs to prevent memory leaks
      Object.values(sounds).forEach(url => URL.revokeObjectURL(url));
      
      console.log(`🎵 ✅ Volume level ${level} (${volumePercent}% slider) generated with ${(volumeDecimal * 100).toFixed(1)}% amplitude`);
      
    } catch (error) {
      console.error(`🎵 ❌ Failed to generate volume level ${level}:`, error);
    } finally {
      this.isGeneratingLevel = false;
    }
  }

  private generateAudioBuffers() {
    if (!this.audioContext) return;

    console.log('🎵 🎼 Generating audio buffers...');
    
    const sounds = {
      digit: () => this.createToneBuffer(800, 0.08),
      drip: () => this.createSweepBuffer(1200, 400, 0.15),
      complete: () => this.createToneBuffer(1200, 0.15),
      dud: () => this.createToneBuffer(200, 0.12),
      lost: () => this.createSequenceBuffer([400, 350, 300, 250]),
      won: () => this.createSequenceBuffer([523, 659, 784, 1047])
    };

    for (const [name, generator] of Object.entries(sounds)) {
      try {
        const buffer = generator();
        this.audioBuffers.set(name, buffer);
        console.log(`🎵 🎼 Generated buffer for ${name}`);
      } catch (error) {
        console.error(`🎵 ❌ Failed to generate buffer for ${name}:`, error);
      }
    }
    
    console.log('🎵 ✅ All audio buffers generated and ready');
  }

  private createToneBuffer(frequency: number, duration: number): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');
    
    const sampleRate = this.audioContext.sampleRate;
    const samples = Math.floor(sampleRate * duration);
    const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < samples; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate);
      const envelope = Math.exp(-i / (sampleRate * 0.1)); // Fade out
      const amplitude = 0.25 * this.masterVolume; // Use masterVolume as amplitude multiplier
      channelData[i] = sample * envelope * amplitude;
    }
    
    return buffer;
  }

  private createSweepBuffer(startFreq: number, endFreq: number, duration: number): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');
    
    const sampleRate = this.audioContext.sampleRate;
    const samples = Math.floor(sampleRate * duration);
    const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < samples; i++) {
      const progress = i / samples;
      const frequency = startFreq + (endFreq - startFreq) * progress;
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate);
      const envelope = Math.exp(-progress * 5); // Exponential decay
      const amplitude = 0.25 * this.masterVolume; // Use masterVolume as amplitude multiplier
      channelData[i] = sample * envelope * amplitude;
    }
    
    return buffer;
  }

  private createSequenceBuffer(frequencies: number[]): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');
    
    const sampleRate = this.audioContext.sampleRate;
    const noteDuration = 0.15;
    const totalSamples = Math.floor(sampleRate * noteDuration * frequencies.length);
    const buffer = this.audioContext.createBuffer(1, totalSamples, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    const samplesPerNote = Math.floor(sampleRate * noteDuration);
    for (let noteIndex = 0; noteIndex < frequencies.length; noteIndex++) {
      const frequency = frequencies[noteIndex];
      for (let i = 0; i < samplesPerNote; i++) {
        const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate);
        const envelope = Math.exp(-i / (sampleRate * 0.05)); // Quick fade
        const amplitude = 0.15 * this.masterVolume; // Use masterVolume as amplitude multiplier
        const sampleIndex = noteIndex * samplesPerNote + i;
        if (sampleIndex < totalSamples) {
          channelData[sampleIndex] = sample * envelope * amplitude;
        }
      }
    }
    
    return buffer;
  }

  private configureMediaSession() {
    console.log('🎵 📱 Configuring Media Session for iOS compatibility...');
    
    try {
      // Configure Media Session API to indicate this is media content
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'PicoFermiBagel Game Audio',
          artist: 'Game Sounds',
          album: 'Interactive Audio',
        });
        
        // Set playback state to indicate active media
        navigator.mediaSession.playbackState = 'playing';
        
        console.log('🎵 📱 ✅ Media Session configured for iOS');
      } else {
        console.log('🎵 📱 ⚠️ Media Session API not available');
      }
    } catch (error) {
      console.error('🎵 📱 ❌ Failed to configure Media Session:', error);
    }
  }

  // Create a truly silent audio data URL for iOS activation
  private createSilentDataUrl(): string {
    // Create a minimal silent WAV file (1 sample at 0 amplitude)
    const sampleRate = 44100;
    const samples = 1; // Just one silent sample
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // WAV header for silent audio
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate complete silence (0 amplitude)
    for (let i = 0; i < samples; i++) {
      view.setInt16(44 + i * 2, 0, true); // Absolute silence
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  // Public method to activate audio when sound is enabled
  public async activateAudio() {
    if (this.audioContextActivated) {
      console.log('🎵 🎯 Audio already activated, skipping...');
      return;
    }

    console.log('🎵 🎯 Activating Web Audio API for iOS...');
    console.log('🎵 🔍 AudioContext state before activation:', this.audioContext?.state);
    
    try {
      // First, use silent HTML5 audio to unlock iOS audio context
      const silentDataUrl = this.createSilentDataUrl();
      const silentAudio = new Audio();
      silentAudio.src = silentDataUrl;
      silentAudio.volume = 0;
      silentAudio.muted = true;
      
      console.log('🎵 🔇 Playing silent activation sound for iOS...');
      
      // Use Promise.race to timeout the silent audio play
      try {
        await Promise.race([
          silentAudio.play(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Silent audio timeout')), 1000))
        ]);
        console.log('🎵 🔇 Silent audio played successfully');
      } catch (error) {
        console.log('🎵 🔇 Silent audio play failed or timed out, continuing anyway:', error);
      }
      
      silentAudio.pause();
      silentAudio.currentTime = 0;
      
      // Clean up the silent audio URL
      URL.revokeObjectURL(silentDataUrl);
      
      // Now resume the Web Audio API context
      if (this.audioContext) {
        console.log('🎵 🔍 AudioContext state after silent play:', this.audioContext.state);
        
        if (this.audioContext.state === 'suspended') {
          console.log('🎵 🔄 Resuming suspended AudioContext...');
          await this.audioContext.resume();
          console.log('🎵 ✅ AudioContext resumed, new state:', this.audioContext.state);
        } else {
          console.log('🎵 ✅ AudioContext already running, state:', this.audioContext.state);
        }
        
        // Set activation flag regardless of state - if AudioContext is running, we're good
        if (this.audioContext.state === 'running') {
          this.audioContextActivated = true;
          console.log('🎵 🎯 Web Audio API activated and ready for instant playback');
          
          // Test play a very quiet sound to verify it's working
          console.log('🎵 🧪 Testing audio with quiet test sound...');
          this.testAudioPlayback();
        } else {
          console.error('🎵 ❌ AudioContext failed to reach running state:', this.audioContext.state);
          // Try to force activation anyway since sometimes it works even in other states
          this.audioContextActivated = true;
          console.log('🎵 🔧 Force-activating audio despite AudioContext state');
        }
      } else {
        console.error('🎵 ❌ AudioContext is null');
      }
      
    } catch (error) {
      console.error('🎵 ❌ Failed to activate audio:', error);
      // Try to activate anyway - sometimes it works despite errors
      if (this.audioContext && this.audioContext.state === 'running') {
        this.audioContextActivated = true;
        console.log('🎵 🔧 Force-activating audio despite activation error');
      }
    }
  }

  // Test method to verify audio is working
  private testAudioPlayback() {
    if (!this.audioContext || !this.audioContextActivated) {
      console.log('🎵 🧪 Cannot test - audio not activated');
      return;
    }

    const buffer = this.audioBuffers.get('digit');
    if (!buffer) {
      console.log('🎵 🧪 Cannot test - no test buffer available');
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = 0.01; // Very quiet test
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
      console.log('🎵 🧪 ✅ Test sound played successfully');
      
    } catch (error) {
      console.error('🎵 🧪 ❌ Test sound failed:', error);
    }
  }

  // Volume control methods
  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume)); // Clamp to 0-100% range
    
    // Round to nearest 10% increment BEFORE any processing
    const roundedVolume = Math.round(this.masterVolume * 10) / 10;
    this.masterVolume = roundedVolume;
    
    // Convert to discrete volume level (0-10 for 0-100% in 10% increments)
    const newVolumeLevel = Math.round(this.masterVolume * 10);
    const oldVolumeLevel = this.currentVolumeLevel;
    
    // Clamp to available volume levels (0-10)
    const clampedVolumeLevel = Math.max(0, Math.min(10, newVolumeLevel));
    
    if (clampedVolumeLevel !== oldVolumeLevel) {
      console.log(`🎵 🔊 Volume level target: ${clampedVolumeLevel} (${clampedVolumeLevel * 10}%)`);
      
      // If the target level already exists, switch immediately
      if (this.preCalculatedAudio.has(clampedVolumeLevel)) {
        this.currentVolumeLevel = clampedVolumeLevel;
        console.log(`🎵 ⚡ Instant switch to existing level ${clampedVolumeLevel}`);
      } else {
        // Set pending level and start stability timer
        this.pendingVolumeLevel = clampedVolumeLevel;
        
        // Clear existing timer
        if (this.volumeStabilityTimer !== null) {
          clearTimeout(this.volumeStabilityTimer);
        }
        
        // Set timer to generate level after 1 second of stability
        this.volumeStabilityTimer = window.setTimeout(() => {
          if (this.pendingVolumeLevel !== null) {
            const levelToGenerate = this.pendingVolumeLevel;
            console.log(`🎵 ⏱️ Volume stable for 1s, generating level ${levelToGenerate}...`);
            
            this.generateVolumeLevel(levelToGenerate).then(() => {
              // Switch to the newly generated level
              if (this.preCalculatedAudio.has(levelToGenerate)) {
                this.currentVolumeLevel = levelToGenerate;
                console.log(`🎵 ✅ Switched to newly generated level ${levelToGenerate}`);
              }
            });
            
            this.pendingVolumeLevel = null;
          }
        }, 1000);
        
        console.log(`🎵 ⏱️ Starting 1s stability timer for level ${clampedVolumeLevel}`);
      }
    } else {
      console.log(`🎵 🔊 Volume level unchanged at ${clampedVolumeLevel} (${clampedVolumeLevel * 10}%)`);
    }
  }

  // Method for playing volume test sound with throttling
  playVolumeTestSound() {
    const now = Date.now();
    // Throttle volume test sounds to prevent crackling
    if (now - this.lastVolumeTestTime < 100) {
      return;
    }
    this.lastVolumeTestTime = now;
    
    // Calculate actual amplitude for logging
    const actualAmplitude = this.currentVolumeLevel === 0 ? 0 : Math.pow(this.currentVolumeLevel / 10, 2.5);
    
    console.log(`🎵 🔊 Playing volume test sound at level ${this.currentVolumeLevel} (${this.currentVolumeLevel * 10}% slider, ${(actualAmplitude * 100).toFixed(1)}% amplitude)`);
    this.playSound('digit');
  }

  getVolume(): number {
    return this.masterVolume;
  }

  private playSound(soundName: string) {
    console.log(`🎵 🎯 Attempting to play ${soundName} sound...`);
    console.log(`🎵 🔍 AudioContext state: ${this.audioContext?.state}`);
    console.log(`🎵 🔍 AudioContext activated: ${this.audioContextActivated}`);
    console.log(`🎵 🔍 Master volume: ${this.masterVolume}`);
    console.log(`🎵 🔍 Current volume level: ${this.currentVolumeLevel}`);
    
    // Ensure audio is activated before attempting to play
    if (!this.audioContextActivated && this.audioContext) {
      console.log('🎵 🎯 Auto-activating audio before playing sound...');
      this.activateAudio().catch(error => {
        console.error('🎵 ❌ Failed to auto-activate audio:', error);
      });
    }
    
    // Try HTML5 Audio first for iOS silent mode compatibility
    const levelAudioMap = this.preCalculatedAudio.get(this.currentVolumeLevel);
    if (levelAudioMap) {
      const audioPool = levelAudioMap.get(soundName);
      if (audioPool && audioPool.length > 0) {
        console.log(`🎵 ✅ Found audio pool for ${soundName}, size: ${audioPool.length}`);
        try {
          const currentIdx = this.currentIndex.get(soundName) || 0;
          const audio = audioPool[currentIdx];
          
          console.log(`🎵 🔍 Audio element ${currentIdx} ready state: ${audio.readyState}`);
          
          // Stop any currently playing instance to prevent overlaps
          if (!audio.paused) {
            console.log(`🎵 ⏸️ Stopping currently playing audio`);
            audio.pause();
          }
          
          // Reset audio to beginning for instant playback
          audio.currentTime = 0;
          
          // Keep volume at 1.0 for iOS silent mode compatibility - amplitude is controlled at generation level
          audio.volume = 1.0;
          
          // Update index for next play BEFORE playing to prevent race conditions
          this.currentIndex.set(soundName, (currentIdx + 1) % audioPool.length);
          
          // Play the sound immediately
          const playPromise = audio.play();
          console.log(`🎵 🎵 ${soundName} sound started via HTML5 Audio (index ${currentIdx})`);
          
          // Handle the promise in the background
          playPromise.then(() => {
            console.log(`🎵 ✅ ${soundName} HTML5 audio playback completed`);
          }).catch(error => {
            console.error(`🎵 ❌ HTML5 audio failed for ${soundName}:`, error);
            // Only fallback to Web Audio API if not regenerating
            if (!this.isGeneratingLevel) {
              this.playWithWebAudio(soundName);
            }
          });
          
          return; // Successfully triggered HTML5 audio
          
        } catch (error) {
          console.error(`🎵 ❌ HTML5 audio error for ${soundName}:`, error);
          // Fall through to Web Audio API only if not regenerating
          if (this.isGeneratingLevel) {
            console.log(`🎵 ⚠️ Skipping Web Audio fallback during regeneration`);
            return;
          }
        }
      }
    }
    
    // Fallback to Web Audio API (only if not regenerating)
    if (!this.isGeneratingLevel) {
      this.playWithWebAudio(soundName);
    } else {
      console.log(`🎵 ⚠️ Skipping audio playback during regeneration`);
    }
    
    // Final fallback: Try to create and play a simple audio element as last resort
    console.log(`🎵 🚨 Final fallback: Creating simple audio element for ${soundName}`);
    try {
      const fallbackAudio = new Audio();
      fallbackAudio.src = this.createToneDataUrlWithVolume(800, 0.08, 0.1); // Simple tone
      fallbackAudio.volume = 0.1;
      fallbackAudio.play().then(() => {
        console.log(`🎵 ✅ Fallback audio played successfully for ${soundName}`);
      }).catch(error => {
        console.error(`🎵 ❌ Fallback audio also failed for ${soundName}:`, error);
      });
    } catch (error) {
      console.error(`🎵 ❌ Failed to create fallback audio for ${soundName}:`, error);
    }
  }

  private playWithWebAudio(soundName: string) {
    console.log(`🎵 🎼 Falling back to Web Audio API for ${soundName}...`);
    
    if (!this.audioContext || !this.audioContextActivated) {
      console.warn(`🎵 ⚠️ Audio context not activated, cannot play ${soundName} sound`);
      return;
    }

    const buffer = this.audioBuffers.get(soundName);
    if (!buffer) {
      console.error(`🎵 ❌ Audio buffer ${soundName} not found`);
      return;
    }

    try {
      // Create buffer source and gain node for instant playback
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = 1.0; // Use full volume since amplitude is controlled at generation level
      
      // Connect: source -> gain -> destination
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Play immediately
      source.start();
      
      console.log(`🎵 🎼 ${soundName} sound started via Web Audio API`);
      
      // Add ended event listener to confirm playback
      source.onended = () => {
        console.log(`🎵 ✅ ${soundName} Web Audio playback completed`);
      };
      
    } catch (error) {
      console.error(`🎵 ❌ Failed to play ${soundName} with Web Audio:`, error);
    }
  }

  // Play a simple beep sound for digit placement
  playDigitPlaceSound() {
    this.playSound('digit');
  }

  // Play a 'drip' sound for drag and drop placement
  playDripSound() {
    this.playSound('drip');
  }

  // Play a success sound for completing a guess
  playGuessCompleteSound() {
    this.playSound('complete');
  }

  // Play a "dud" sound for redundant/invalid digit placement
  playDudSound() {
    this.playSound('dud');
  }

  // Play a "blupper" sound for game loss
  playGameLostSound() {
    this.playSound('lost');
  }

  // Play a celebration sound for game win
  playGameWonSound() {
    this.playCelebrationSound();
  }

  // Play simple celebration sound for game win
  playCelebrationSound() {
    if (!this.audioContext) {
      console.warn('🎵 AudioContext not available for celebration');
      return;
    }

    try {
      // Create simple celebration sequence
      const buffer = this.createCelebrationBuffer();
      
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      gainNode.gain.value = this.masterVolume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
      console.log('🎵 🎉 Playing celebration sound for game win');
    } catch (error) {
      console.error('🎵 Failed to play celebration sound:', error);
    }
  }

  // Create simple celebration buffer (ascending musical notes)
  private createCelebrationBuffer(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 3.0; // 3 seconds total
    const samples = Math.floor(sampleRate * duration);
    const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    // Victory fanfare notes (C major scale ascending)
    const notes = [
      { freq: 261.63, start: 0.0, duration: 0.4 }, // C4
      { freq: 329.63, start: 0.3, duration: 0.4 }, // E4
      { freq: 392.00, start: 0.6, duration: 0.4 }, // G4
      { freq: 523.25, start: 0.9, duration: 0.6 }, // C5
      { freq: 659.25, start: 1.4, duration: 0.6 }, // E5
      { freq: 783.99, start: 1.9, duration: 0.8 }, // G5
    ];
    
    for (let i = 0; i < samples; i++) {
      const time = i / sampleRate;
      let sound = 0;
      
      // Play each note at its scheduled time
      for (const note of notes) {
        if (time >= note.start && time < note.start + note.duration) {
          const noteTime = time - note.start;
          const envelope = Math.exp(-noteTime * 2); // Decay envelope
          const tone = Math.sin(2 * Math.PI * note.freq * noteTime);
          sound += tone * envelope * 0.3;
        }
      }
      
      const amplitude = 0.8 * this.masterVolume; // Loud and clear
      channelData[i] = sound * amplitude;
    }
    
    return buffer;
  }

  private createToneDataUrlWithVolume(frequency: number, duration: number, volume: number): string {
    // Create a simple sine wave as a data URL with specific volume
    const sampleRate = 44100;
    const samples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate sine wave with specific volume
    for (let i = 0; i < samples; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate);
      const envelope = Math.exp(-i / (sampleRate * 0.1)); // Fade out
      const amplitude = 0.25 * volume; // Use volume parameter as amplitude multiplier
      view.setInt16(44 + i * 2, sample * envelope * 32767 * amplitude, true);
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  private createSweepDataUrlWithVolume(startFreq: number, endFreq: number, duration: number, volume: number): string {
    // Create a frequency sweep (for drip sound) with specific volume
    const sampleRate = 44100;
    const samples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // WAV header (same as above)
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate frequency sweep with specific volume
    for (let i = 0; i < samples; i++) {
      const progress = i / samples;
      const frequency = startFreq + (endFreq - startFreq) * progress;
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate);
      const envelope = Math.exp(-progress * 5); // Exponential decay
      const amplitude = 0.25 * volume; // Use volume parameter as amplitude multiplier
      view.setInt16(44 + i * 2, sample * envelope * 32767 * amplitude, true);
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  private createSequenceDataUrlWithVolume(frequencies: number[], volume: number): string {
    // Create a sequence of tones with specific volume
    const sampleRate = 44100;
    const noteDuration = 0.15;
    const totalSamples = Math.floor(sampleRate * noteDuration * frequencies.length);
    const buffer = new ArrayBuffer(44 + totalSamples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + totalSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, totalSamples * 2, true);
    
    // Generate sequence with specific volume
    const samplesPerNote = Math.floor(sampleRate * noteDuration);
    for (let noteIndex = 0; noteIndex < frequencies.length; noteIndex++) {
      const frequency = frequencies[noteIndex];
      for (let i = 0; i < samplesPerNote; i++) {
        const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate);
        const envelope = Math.exp(-i / (sampleRate * 0.05)); // Quick fade
        const amplitude = 0.15 * volume; // Use volume parameter as amplitude multiplier
        const sampleIndex = noteIndex * samplesPerNote + i;
        if (sampleIndex < totalSamples) {
          view.setInt16(44 + sampleIndex * 2, sample * envelope * 32767 * amplitude, true);
        }
      }
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  // Public test method for debugging
  testSoundSystem() {
    console.log('🎵 🧪 Testing sound system...');
    this.debugSoundSystem();
    
    // Try to play a test sound
    console.log('🎵 🧪 Attempting to play test sound...');
    this.playDigitPlaceSound();
    
    // Check if audio context is ready
    if (this.audioContext) {
      console.log(`🎵 🧪 AudioContext state: ${this.audioContext.state}`);
      if (this.audioContext.state === 'suspended') {
        console.log('🎵 🧪 AudioContext is suspended, attempting to resume...');
        this.audioContext.resume().then(() => {
          console.log('🎵 🧪 AudioContext resumed successfully');
        }).catch(error => {
          console.error('🎵 🧪 Failed to resume AudioContext:', error);
        });
      }
    }
  }

  // Debug method to test sound system
  debugSoundSystem() {
    console.log('🎵 🔍 Sound System Debug Info:');
    console.log(`🎵   AudioContext state: ${this.audioContext?.state}`);
    console.log(`🎵   AudioContext activated: ${this.audioContextActivated}`);
    console.log(`🎵   Master volume: ${this.masterVolume}`);
    console.log(`🎵   Current volume level: ${this.currentVolumeLevel}`);
    console.log(`🎵   Pre-calculated audio levels: ${Array.from(this.preCalculatedAudio.keys()).join(', ')}`);
    
    const levelAudioMap = this.preCalculatedAudio.get(this.currentVolumeLevel);
    if (levelAudioMap) {
      console.log(`🎵   Available sounds for level ${this.currentVolumeLevel}: ${Array.from(levelAudioMap.keys()).join(', ')}`);
      const digitPool = levelAudioMap.get('digit');
      if (digitPool) {
        console.log(`🎵   Digit sound pool size: ${digitPool.length}`);
        console.log(`🎵   Digit sound ready states: ${digitPool.map(audio => audio.readyState).join(', ')}`);
      }
    } else {
      console.log(`🎵   ⚠️ No audio available for level ${this.currentVolumeLevel}`);
    }
  }
}

// Create a singleton instance
export const soundUtils = new SoundUtils();

// Expose to global scope for debugging
if (typeof window !== 'undefined') {
  (window as any).soundUtils = soundUtils;
  console.log('🎵 SoundUtils exposed to global scope as window.soundUtils');
}