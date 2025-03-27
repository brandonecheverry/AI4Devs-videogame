/**
 * Tetromino definitions and rotation system
 */

// Tetromino shapes defined in a 4×4 grid
const TETROMINO_SHAPES = {
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ]
};

// Color definitions for each tetromino type
const TETROMINO_COLORS = {
    I: '#00FFFF', // Cyan
    O: '#FFFF00', // Yellow
    T: '#800080', // Purple
    S: '#00FF00', // Green
    Z: '#FF0000', // Red
    J: '#0000FF', // Blue
    L: '#FF7F00'  // Orange
};

// Numerical IDs for each tetromino type (used in the board grid)
const TETROMINO_IDS = {
    I: 1,
    O: 2,
    T: 3,
    S: 4,
    Z: 5,
    J: 6,
    L: 7
};

// Super Rotation System (SRS) wall kick data
// Format: [test1, test2, test3, test4, test5] where each test is [x, y]
// representing the position adjustment to try
const WALL_KICK_DATA = {
    // Wall kick data for J, L, S, T, Z tetrominos
    JLSTZ: [
        [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]], // 0->1
        [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],     // 1->2
        [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],    // 2->3
        [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]]   // 3->0
    ],
    // Wall kick data for I tetromino
    I: [
        [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],   // 0->1
        [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],   // 1->2
        [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],   // 2->3
        [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]]    // 3->0
    ]
};

/**
 * Tetromino class - represents a tetromino piece
 */
class Tetromino {
    /**
     * Create a new tetromino
     * @param {string} type - The tetromino type (I, O, T, etc.)
     */
    constructor(type) {
        this.type = type;
        this.shape = TETROMINO_SHAPES[type];
        this.color = TETROMINO_COLORS[type];
        this.id = TETROMINO_IDS[type];
        this.rotation = 0; // 0, 1, 2, or 3 (0 = spawn orientation)
        
        // Starting position (centered at top)
        this.x = Math.floor((BOARD_WIDTH - this.shape[0].length) / 2);
        this.y = 0;
    }
    
    /**
     * Get the matrix for the current rotation state
     * @returns {number[][]} The shape matrix
     */
    getMatrix() {
        return this.shape;
    }
    
    /**
     * Rotate the tetromino
     * @param {number} direction - 1 for clockwise, -1 for counterclockwise
     * @returns {number[][]} The new rotated matrix
     */
    rotate(direction = 1) {
        const matrix = this.getMatrix();
        const n = matrix.length;
        const rotated = Array(n).fill().map(() => Array(n).fill(0));
        
        if (direction === 1) {
            // Clockwise rotation
            for (let y = 0; y < n; y++) {
                for (let x = 0; x < n; x++) {
                    rotated[x][n - 1 - y] = matrix[y][x];
                }
            }
        } else {
            // Counter-clockwise rotation
            for (let y = 0; y < n; y++) {
                for (let x = 0; x < n; x++) {
                    rotated[n - 1 - x][y] = matrix[y][x];
                }
            }
        }
        
        return rotated;
    }
    
    /**
     * Get wall kick data for this tetromino type
     * @param {number} rotationIndex - Current rotation index 
     * @returns {number[][]} Array of [x, y] offsets to try
     */
    getWallKickData(rotationIndex) {
        const dataSet = this.type === 'I' ? WALL_KICK_DATA.I : WALL_KICK_DATA.JLSTZ;
        return dataSet[rotationIndex];
    }
    
    /**
     * Create a ghost piece (for showing landing position)
     * @returns {Tetromino} A copy of this tetromino
     */
    createGhost() {
        const ghost = new Tetromino(this.type);
        ghost.x = this.x;
        ghost.y = this.y;
        ghost.rotation = this.rotation;
        ghost.shape = this.shape;
        return ghost;
    }
}

/**
 * Factory for creating random tetrominos
 */
class TetrominoFactory {
    constructor() {
        this.types = Object.keys(TETROMINO_SHAPES);
        this.bag = [];
        this.refillBag();
    }
    
    /**
     * Refill the bag with one of each tetromino type (7-bag randomization)
     */
    refillBag() {
        this.bag = [...this.types];
        // Fisher-Yates shuffle
        for (let i = this.bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
        }
    }
    
    /**
     * Get the next tetromino from the bag
     * @returns {Tetromino} A new random tetromino
     */
    getNext() {
        if (this.bag.length === 0) {
            this.refillBag();
        }
        const type = this.bag.pop();
        return new Tetromino(type);
    }
} 