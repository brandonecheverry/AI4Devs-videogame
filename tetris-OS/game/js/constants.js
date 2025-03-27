/**
 * Game constants and configuration
 */

// Board dimensions
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 30;

// Game settings
const INITIAL_LEVEL = 1;
const LINES_PER_LEVEL = 10;

// Speed settings (in milliseconds)
const SPEED_CURVE = {
    1: 1000,   // Level 1: 1 cell per second
    2: 900,
    3: 800,
    4: 700,
    5: 600,
    6: 500,
    7: 400,
    8: 300,
    9: 200,
    10: 100,  // Level 10: 10 cells per second
    // Faster levels
    11: 90,
    12: 80,
    13: 70,
    14: 60,
    15: 50,
    16: 40,
    17: 30,
    18: 20,
    19: 15,
    20: 10    // Level 20: 100 cells per second (insane)
};

// Calculate drop interval based on level
function getDropInterval(level) {
    if (level > 20) level = 20; // Cap at level 20
    return SPEED_CURVE[level] || SPEED_CURVE[20];
}

// Scoring system
const SCORE_VALUES = {
    SOFT_DROP: 1,         // Per cell
    HARD_DROP: 2,         // Per cell
    SINGLE_LINE: 100,
    DOUBLE_LINE: 300,
    TRIPLE_LINE: 500,
    TETRIS: 800           // Four lines
};

// Animation durations (in milliseconds)
const ANIMATION_DURATIONS = {
    LINE_CLEAR: 200,
    LEVEL_UP: 500,
    GAME_OVER: 1000,
    PIECE_ROTATION: 50,
    PIECE_MOVEMENT: 30
};

// Key bindings
const KEY_BINDINGS = {
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    DOWN: 'ArrowDown',
    HARD_DROP: 'ArrowUp',
    ROTATE: 'z',
    PAUSE: 'p',
    RESTART: 'r',
    QUIT: 'Escape'
};

// Game states
const GAME_STATES = {
    TITLE_SCREEN: 'titleScreen',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

// Local storage keys
const STORAGE_KEYS = {
    HIGH_SCORES: 'tetris_high_scores'
}; 