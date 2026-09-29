class BuzzerSoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private alarmOscillator: OscillatorNode | null = null;
  private alarmGain: GainNode | null = null;
  private isAlarmPlaying: boolean = false;
  private intervalId: number | null = null;

  constructor() {
    // Lazy initialize on first user gesture
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAlarm();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playBuzzerPulse(freq = 2400, duration = 0.15) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square'; // Classic piezo buzzer timbre
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  public startAlarmLoop() {
    if (this.isMuted || this.isAlarmPlaying) return;
    this.isAlarmPlaying = true;

    // Pulse buzzer every 400ms: alternate between high and low pitch (2800Hz / 2100Hz)
    let flip = false;
    this.intervalId = window.setInterval(() => {
      if (this.isMuted) return;
      this.playBuzzerPulse(flip ? 2800 : 2100, 0.22);
      flip = !flip;
    }, 380);
  }

  public stopAlarm() {
    this.isAlarmPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const buzzerSound = new BuzzerSoundService();
