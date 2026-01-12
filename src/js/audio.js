// Audio system using Web Audio API

class AudioManager {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.engineOscillator = null;
        this.engineGain = null;
        this.isInitialized = false;
        this.isMuted = false;

        // Volume levels
        this.masterVolume = 0.7;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.8;

        // Engine sound state
        this.currentEngineFreq = 100;
        this.targetEngineFreq = 100;
    }

    /**
     * Initialize audio context (must be called after user interaction)
     */
    async init() {
        if (this.isInitialized) return;

        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();

            // Create master gain
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(this.context.destination);

            // Create separate gains for music and sfx
            this.musicGain = this.context.createGain();
            this.musicGain.gain.value = this.musicVolume;
            this.musicGain.connect(this.masterGain);

            this.sfxGain = this.context.createGain();
            this.sfxGain.gain.value = this.sfxVolume;
            this.sfxGain.connect(this.masterGain);

            // Resume context if suspended
            if (this.context.state === 'suspended') {
                await this.context.resume();
            }

            this.isInitialized = true;
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }

    /**
     * Create a simple synth tone
     */
    createTone(frequency, type = 'sine', duration = 0.1, volume = 0.3) {
        if (!this.isInitialized || this.isMuted) return;

        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = type;
        osc.frequency.value = frequency;

        gain.gain.setValueAtTime(volume, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start();
        osc.stop(this.context.currentTime + duration);
    }

    /**
     * Play engine sound (continuous)
     */
    startEngine() {
        if (!this.isInitialized || this.engineOscillator) return;

        // Create multiple oscillators for richer sound
        this.engineOscillator = this.context.createOscillator();
        this.engineGain = this.context.createGain();

        // Low frequency oscillator for bass
        this.engineOscillator.type = 'sawtooth';
        this.engineOscillator.frequency.value = this.currentEngineFreq;

        // Filter for warmth
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500;

        this.engineGain.gain.value = 0.15;

        this.engineOscillator.connect(filter);
        filter.connect(this.engineGain);
        this.engineGain.connect(this.sfxGain);

        this.engineOscillator.start();
    }

    /**
     * Update engine sound based on speed
     */
    updateEngine(speed, isNitroActive = false) {
        if (!this.engineOscillator) return;

        // Map speed to frequency (50-200 Hz range)
        const baseFreq = 50 + (speed / 120) * 150;
        this.targetEngineFreq = isNitroActive ? baseFreq * 1.3 : baseFreq;

        // Smooth transition
        const currentTime = this.context.currentTime;
        this.engineOscillator.frequency.setTargetAtTime(
            this.targetEngineFreq,
            currentTime,
            0.1
        );

        // Adjust volume with speed
        const volume = 0.1 + (speed / 120) * 0.15;
        this.engineGain.gain.setTargetAtTime(volume, currentTime, 0.1);
    }

    /**
     * Stop engine sound
     */
    stopEngine() {
        if (this.engineOscillator) {
            this.engineOscillator.stop();
            this.engineOscillator = null;
            this.engineGain = null;
        }
    }

    /**
     * Play lane switch sound
     */
    playLaneSwitch() {
        if (!this.isInitialized || this.isMuted) return;

        // Quick whoosh sound
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.context.currentTime + 0.1);

        gain.gain.setValueAtTime(0.2, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start();
        osc.stop(this.context.currentTime + 0.1);
    }

    /**
     * Play nitro activation sound
     */
    playNitroActivate() {
        if (!this.isInitialized || this.isMuted) return;

        // Rising whoosh
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.context.currentTime + 0.3);

        gain.gain.setValueAtTime(0.3, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.5);

        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start();
        osc.stop(this.context.currentTime + 0.5);
    }

    /**
     * Play collision/crash sound
     */
    playCollision() {
        if (!this.isInitialized || this.isMuted) return;

        // Noise burst for crash
        const bufferSize = this.context.sampleRate * 0.3;
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
        }

        const noise = this.context.createBufferSource();
        noise.buffer = buffer;

        const gain = this.context.createGain();
        gain.gain.setValueAtTime(0.5, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.3);

        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start();
    }

    /**
     * Play powerup collection sound
     */
    playPowerupCollect(type) {
        if (!this.isInitialized || this.isMuted) return;

        // Ascending arpeggio
        const notes = [400, 500, 600, 800];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.createTone(freq, 'sine', 0.15, 0.25);
            }, i * 50);
        });
    }

    /**
     * Play nitro charge sound (quick blip)
     */
    playNitroCharge() {
        if (!this.isInitialized || this.isMuted) return;
        this.createTone(600, 'sine', 0.05, 0.1);
    }

    /**
     * Play menu select sound
     */
    playMenuSelect() {
        if (!this.isInitialized || this.isMuted) return;
        this.createTone(800, 'sine', 0.1, 0.2);
        setTimeout(() => this.createTone(1000, 'sine', 0.1, 0.2), 50);
    }

    /**
     * Play game over sound
     */
    playGameOver() {
        if (!this.isInitialized || this.isMuted) return;

        // Descending tones
        const notes = [400, 350, 300, 200];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.createTone(freq, 'triangle', 0.3, 0.3);
            }, i * 150);
        });
    }

    /**
     * Toggle mute
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : this.masterVolume;
        }
        return this.isMuted;
    }

    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain && !this.isMuted) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }

    /**
     * Clean up
     */
    dispose() {
        this.stopEngine();
        if (this.context) {
            this.context.close();
            this.context = null;
        }
        this.isInitialized = false;
    }
}

// Export singleton
export const audioManager = new AudioManager();
export default AudioManager;
