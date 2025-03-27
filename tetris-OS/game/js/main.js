/**
 * Main entry point for Tetris game
 */

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create audio element to fix audio on mobile
    createAudioContext();
    
    // Initialize and start the game
    const game = new Game();
    
    // Handle window resize for responsiveness
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Update high scores display
    const storage = new StorageSystem();
    storage.updateHighScoreDisplay();
});

/**
 * Create an audio context to enable audio on mobile devices
 */
function createAudioContext() {
    // Create an AudioContext instance
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
        const audioCtx = new AudioContext();
        
        // Add event listener to unmute audio on first user interaction
        document.addEventListener('click', function enableAudio() {
            // Resume the audio context
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            
            // Remove the click listener after enabling audio
            document.removeEventListener('click', enableAudio);
        }, { once: true });
    }
}

/**
 * Handle window resize to adjust for responsive layout
 */
function handleResize() {
    // Check if we need to show mobile controls
    const isMobile = window.innerWidth <= 768;
    const mobileControls = document.getElementById('mobile-controls');
    
    if (isMobile) {
        mobileControls.classList.remove('hidden');
    } else {
        mobileControls.classList.add('hidden');
    }
} 