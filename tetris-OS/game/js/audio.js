/**
 * Audio system for Tetris
 */

class AudioSystem {
    /**
     * Create a new audio system
     */
    constructor() {
        this.sounds = {};
        this.isMuted = false;
        this.volume = 0.5;
        
        // Load all sounds
        this.loadSounds();
    }
    
    /**
     * Load all game sounds
     */
    loadSounds() {
        // Define sounds to load
        const soundsToLoad = {
            move: 'move.mp3',
            rotate: 'rotate.mp3',
            drop: 'drop.mp3',
            hardDrop: 'hard_drop.mp3',
            lineClear: 'line_clear.mp3',
            tetris: 'tetris.mp3',
            levelUp: 'level_up.mp3',
            gameOver: 'game_over.mp3'
        };
        
        // For MVP, we'll create audio elements but not actually load files
        // This allows the game to work without needing sound assets
        for (const [name, file] of Object.entries(soundsToLoad)) {
            this.createEmptyAudio(name);
        }
    }
    
    /**
     * Create an empty audio element (placeholder for actual sound files)
     * @param {string} name - Sound identifier
     */
    createEmptyAudio(name) {
        const audio = new Audio();
        audio.volume = this.volume;
        this.sounds[name] = audio;
    }
    
    /**
     * Play a sound
     * @param {string} name - Sound identifier
     */
    play(name) {
        if (this.isMuted || !this.sounds[name]) return;
        
        // Stop sound if already playing
        const sound = this.sounds[name];
        sound.currentTime = 0;
        
        // Play the sound
        const playPromise = sound.play();
        
        // Handle play promise (may fail if browser blocks autoplay)
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Audio play prevented:', error);
            });
        }
    }
    
    /**
     * Set the volume for all sounds
     * @param {number} volume - Volume level (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Update volume for all sounds
        for (const sound of Object.values(this.sounds)) {
            sound.volume = this.volume;
        }
    }
    
    /**
     * Mute or unmute all sounds
     * @param {boolean} muted - Mute state
     */
    setMuted(muted) {
        this.isMuted = muted;
    }
    
    /**
     * Toggle mute state
     * @returns {boolean} New mute state
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }
} 