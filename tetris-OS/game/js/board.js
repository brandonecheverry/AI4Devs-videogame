/**
 * Board management system for Tetris
 */

class Board {
    /**
     * Create a new game board
     */
    constructor() {
        this.reset();
    }
    
    /**
     * Reset the board to initial state
     */
    reset() {
        // Create empty grid
        this.grid = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
        this.dirty = true; // Mark for complete redraw
    }
    
    /**
     * Lock the current piece into the board
     * @param {Tetromino} piece - The active tetromino to lock
     * @returns {number[]} Array of indices of completed lines (if any)
     */
    lockPiece(piece) {
        const matrix = piece.getMatrix();
        
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] !== 0) {
                    const boardX = piece.x + x;
                    const boardY = piece.y + y;
                    
                    // Only lock if within board boundaries
                    if (
                        boardX >= 0 && 
                        boardX < BOARD_WIDTH &&
                        boardY >= 0 && 
                        boardY < BOARD_HEIGHT
                    ) {
                        this.grid[boardY][boardX] = piece.id;
                    }
                }
            }
        }
        
        this.dirty = true;
        return this.checkCompletedLines();
    }
    
    /**
     * Check and clear completed lines
     * @returns {number[]} Array of indices of completed lines
     */
    checkCompletedLines() {
        const completedLines = [];
        
        // Check each line from bottom to top
        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
            // If every cell in this row is filled (non-zero)
            if (this.grid[y].every(cell => cell !== 0)) {
                completedLines.push(y);
            }
        }
        
        // Clear the completed lines
        if (completedLines.length > 0) {
            this.clearLines(completedLines);
        }
        
        return completedLines;
    }
    
    /**
     * Clear the specified lines and shift blocks down
     * @param {number[]} lines - Array of line indices to clear
     */
    clearLines(lines) {
        // Sort lines in descending order to avoid shifting problems
        lines.sort((a, b) => b - a);
        
        // Remove each completed line
        for (const line of lines) {
            // Remove the completed line
            this.grid.splice(line, 1);
            // Add a new empty line at the top
            this.grid.unshift(Array(BOARD_WIDTH).fill(0));
        }
        
        this.dirty = true;
    }
    
    /**
     * Check if the position is valid for the given piece
     * @param {Tetromino} piece - The active tetromino
     * @param {number} offsetX - X offset from current position
     * @param {number} offsetY - Y offset from current position
     * @param {number[][]} [matrix] - Optional alternative matrix
     * @returns {boolean} True if position is valid, false otherwise
     */
    isValidPosition(piece, offsetX = 0, offsetY = 0, matrix = null) {
        return !CollisionSystem.checkCollision(
            this.grid, 
            piece, 
            offsetX, 
            offsetY, 
            matrix
        );
    }
    
    /**
     * Move the piece left if possible
     * @param {Tetromino} piece - The active tetromino
     * @returns {boolean} True if move was successful
     */
    moveLeft(piece) {
        if (this.isValidPosition(piece, -1, 0)) {
            piece.x--;
            return true;
        }
        return false;
    }
    
    /**
     * Move the piece right if possible
     * @param {Tetromino} piece - The active tetromino
     * @returns {boolean} True if move was successful
     */
    moveRight(piece) {
        if (this.isValidPosition(piece, 1, 0)) {
            piece.x++;
            return true;
        }
        return false;
    }
    
    /**
     * Move the piece down if possible
     * @param {Tetromino} piece - The active tetromino
     * @returns {boolean} True if move was successful, false if piece should lock
     */
    moveDown(piece) {
        if (this.isValidPosition(piece, 0, 1)) {
            piece.y++;
            return true;
        }
        return false;
    }
    
    /**
     * Perform hard drop of the piece
     * @param {Tetromino} piece - The active tetromino
     * @returns {number} Number of cells the piece dropped
     */
    hardDrop(piece) {
        const dropDistance = CollisionSystem.findDropPosition(this.grid, piece);
        piece.y += dropDistance;
        return dropDistance;
    }
    
    /**
     * Rotate the piece if possible
     * @param {Tetromino} piece - The active tetromino
     * @param {number} direction - 1 for clockwise, -1 for counterclockwise
     * @returns {boolean} True if rotation was successful
     */
    rotatePiece(piece, direction = 1) {
        const rotationResult = CollisionSystem.checkRotation(this.grid, piece, direction);
        
        if (rotationResult) {
            piece.shape = rotationResult.matrix;
            piece.x += rotationResult.x;
            piece.y += rotationResult.y;
            
            if (rotationResult.rotation !== undefined) {
                piece.rotation = rotationResult.rotation;
            } else {
                piece.rotation = (piece.rotation + direction) % 4;
                if (piece.rotation < 0) piece.rotation += 4;
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Calculate drop position for ghost piece
     * @param {Tetromino} piece - The active tetromino
     * @returns {number} The Y position where the piece would land
     */
    getGhostPosition(piece) {
        return piece.y + CollisionSystem.findDropPosition(this.grid, piece);
    }
} 