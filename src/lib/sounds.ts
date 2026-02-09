/**
 * Sound Manager - Web Audio API based sound system
 * Uses oscillator-generated tones for UI feedback sounds
 * No external audio files required
 */

type SoundType = "hover" | "click" | "toggle" | "navigate";

interface SoundConfig {
  frequency: number;
  duration: number;
  volume: number;
  type: OscillatorType;
  attack: number;
  decay: number;
}

// Sound configurations - subtle, short UI sounds
const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  hover: {
    frequency: 800,
    duration: 0.04,
    volume: 0.08,
    type: "sine",
    attack: 0.005,
    decay: 0.035,
  },
  click: {
    frequency: 600,
    duration: 0.06,
    volume: 0.12,
    type: "sine",
    attack: 0.002,
    decay: 0.058,
  },
  toggle: {
    frequency: 520,
    duration: 0.08,
    volume: 0.1,
    type: "triangle",
    attack: 0.005,
    decay: 0.075,
  },
  navigate: {
    frequency: 440,
    duration: 0.1,
    volume: 0.1,
    type: "sine",
    attack: 0.01,
    decay: 0.09,
  },
};

class SoundManager {
  private static instance: SoundManager | null = null;
  private audioContext: AudioContext | null = null;
  private initialized = false;
  private unlocked = false;

  private constructor() {}

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Initialize audio context on first user interaction
   * Required for Safari and Chrome autoplay policy
   */
  private async initAudioContext(): Promise<boolean> {
    if (this.audioContext && this.unlocked) {
      return true;
    }

    try {
      // Create or resume audio context
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)();
      }

      // Unlock for Safari - play silent buffer
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      // Create and play silent buffer to unlock audio
      if (!this.unlocked) {
        const buffer = this.audioContext.createBuffer(1, 1, 22050);
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(0);
        this.unlocked = true;
      }

      this.initialized = true;
      return true;
    } catch {
      console.warn("SoundManager: Failed to initialize audio context");
      return false;
    }
  }

  /**
   * Play a UI sound
   */
  async play(type: SoundType): Promise<void> {
    // Skip if we're on server
    if (typeof window === "undefined") return;

    // Check for reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Initialize audio context if needed
    const ready = await this.initAudioContext();
    if (!ready || !this.audioContext) return;

    const config = SOUND_CONFIGS[type];

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = config.type;
      oscillator.frequency.setValueAtTime(
        config.frequency,
        this.audioContext.currentTime
      );

      // ADSR envelope for smooth sound
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(config.volume, now + config.attack);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        now + config.attack + config.decay
      );

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start(now);
      oscillator.stop(now + config.duration);

      // Cleanup
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };
    } catch {
      // Silently fail - sound is non-critical
    }
  }

  /**
   * Check if audio is available and initialized
   */
  isReady(): boolean {
    return this.initialized && this.unlocked;
  }
}

// Export singleton accessor
export function getSoundManager(): SoundManager {
  return SoundManager.getInstance();
}

// Convenience functions for direct sound playing
export async function playHoverSound(): Promise<void> {
  return getSoundManager().play("hover");
}

export async function playClickSound(): Promise<void> {
  return getSoundManager().play("click");
}

export async function playToggleSound(): Promise<void> {
  return getSoundManager().play("toggle");
}

export async function playNavigateSound(): Promise<void> {
  return getSoundManager().play("navigate");
}
