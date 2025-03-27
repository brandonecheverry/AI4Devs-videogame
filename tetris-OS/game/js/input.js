/**
 * Input handling system for Tetris
 */

class InputHandler {
    /**
     * Create new input handler
     * @param {HTMLElement} gameContainer - The game container element
     */
    constructor(gameContainer) {
        // Key state tracking
        this.keys = {};
        this.keyPressHandlers = {};
        this.keyDownHandlers = {};
        
        // Key repeat settings
        this.keyRepeatEnabled = {
            [KEY_BINDINGS.LEFT]: true,
            [KEY_BINDINGS.RIGHT]: true,
            [KEY_BINDINGS.DOWN]: true,
        };
        this.keyRepeatDelay = 150; // ms before key starts repeating
        this.keyRepeatRate = 50;   // ms between repeats
        this.keyLastRepeat = {};
        
        // Mobile controls
        this.isMobile = this.detectMobile();
        this.mobileControlsElement = document.getElementById('mobile-controls');
        
        // Initialization
        this.setupKeyboardControls();
        if (this.isMobile) {
            this.setupTouchControls();
        }
    }
    
    /**
     * Detect if the device is mobile
     * @returns {boolean} True if mobile device detected
     */
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
            window.innerWidth <= 768;
    }
    
    /**
     * Set up keyboard event listeners
     */
    setupKeyboardControls() {
        // Keydown event
        window.addEventListener('keydown', (e) => {
            // Prevent defaults for game control keys to avoid page scrolling etc.
            if (Object.values(KEY_BINDINGS).includes(e.key)) {
                e.preventDefault();
            }
            
            if (!this.keys[e.key]) {
                // Key was just pressed
                this.keys[e.key] = true;
                
                // Trigger key press handlers
                if (this.keyPressHandlers[e.key]) {
                    this.keyPressHandlers[e.key]();
                }
                
                // Set up key repeat
                if (this.keyRepeatEnabled[e.key]) {
                    this.keyLastRepeat[e.key] = Date.now() + this.keyRepeatDelay;
                }
            }
        });
        
        // Keyup event
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    /**
     * Set up touch controls for mobile devices
     */
    setupTouchControls() {
        // Show mobile controls
        this.mobileControlsElement.classList.remove('hidden');
        
        // Set up mobile button handlers
        document.getElementById('mobile-left').addEventListener('touchstart', () => {
            this.simulateKeyPress(KEY_BINDINGS.LEFT);
        });
        
        document.getElementById('mobile-right').addEventListener('touchstart', () => {
            this.simulateKeyPress(KEY_BINDINGS.RIGHT);
        });
        
        document.getElementById('mobile-rotate').addEventListener('touchstart', () => {
            this.simulateKeyPress(KEY_BINDINGS.ROTATE);
        });
        
        document.getElementById('mobile-drop').addEventListener('touchstart', () => {
            this.simulateKeyPress(KEY_BINDINGS.HARD_DROP);
        });
        
        document.getElementById('mobile-pause').addEventListener('touchstart', () => {
            this.simulateKeyPress(KEY_BINDINGS.PAUSE);
        });
        
        // Add touch hold handlers for movement keys
        this.setupTouchHold('mobile-left', KEY_BINDINGS.LEFT);
        this.setupTouchHold('mobile-right', KEY_BINDINGS.RIGHT);
        this.setupTouchHold('mobile-drop', KEY_BINDINGS.DOWN);
    }
    
    /**
     * Set up touch hold for continuous movement
     * @param {string} elementId - Element ID of the button
     * @param {string} key - The key to simulate
     */
    setupTouchHold(elementId, key) {
        const element = document.getElementById(elementId);
        let holdInterval = null;
        
        // Start holding on touch start
        element.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent default touch behavior
            
            // Initial key press
            this.simulateKeyPress(key);
            
            // Start repeating
            holdInterval = setInterval(() => {
                this.simulateKeyPress(key);
            }, this.keyRepeatRate);
        });
        
        // End holding on touch end or cancel
        const endHold = () => {
            if (holdInterval) {
                clearInterval(holdInterval);
                holdInterval = null;
            }
            this.keys[key] = false;
        };
        
        element.addEventListener('touchend', endHold);
        element.addEventListener('touchcancel', endHold);
    }
    
    /**
     * Simulate a key press programmatically
     * @param {string} key - The key to simulate
     */
    simulateKeyPress(key) {
        this.keys[key] = true;
        
        if (this.keyPressHandlers[key]) {
            this.keyPressHandlers[key]();
        }
        
        // For continuous keys, update repeat time
        if (this.keyRepeatEnabled[key]) {
            this.keyLastRepeat[key] = Date.now();
        }
    }
    
    /**
     * Register a handler for a key press event (fires once per press)
     * @param {string} key - The key to listen for
     * @param {Function} handler - The handler function to call
     */
    onKeyPress(key, handler) {
        this.keyPressHandlers[key] = handler;
    }
    
    /**
     * Register a handler for a key held down state (fires continuously)
     * @param {string} key - The key to listen for
     * @param {Function} handler - The handler function to call
     */
    onKeyDown(key, handler) {
        this.keyDownHandlers[key] = handler;
    }
    
    /**
     * Check if a key is currently pressed
     * @param {string} key - The key to check
     * @returns {boolean} True if key is pressed
     */
    isKeyDown(key) {
        return this.keys[key] === true;
    }
    
    /**
     * Update method to be called each frame, handles continuous key presses
     */
    update() {
        const now = Date.now();
        
        // Handle continuous key presses with repeat rate
        for (const key in this.keyDownHandlers) {
            if (this.isKeyDown(key)) {
                if (this.keyRepeatEnabled[key]) {
                    // Check if it's time to repeat
                    if (now >= this.keyLastRepeat[key]) {
                        this.keyDownHandlers[key]();
                        this.keyLastRepeat[key] = now + this.keyRepeatRate;
                    }
                } else {
                    // Non-repeating keys just fire continuously
                    this.keyDownHandlers[key]();
                }
            }
        }
    }
    
    /**
     * Reset input state (e.g., when game is reset or paused)
     */
    reset() {
        this.keys = {};
        this.keyLastRepeat = {};
    }
} 