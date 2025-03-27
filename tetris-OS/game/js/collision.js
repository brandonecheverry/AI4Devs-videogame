/**
 * Collision detection system for Tetris
 */

class CollisionSystem {
    /**
     * Check if the given piece at the specified position would collide with anything
     * @param {number[][]} grid - The game board grid
     * @param {Tetromino} piece - The tetromino to check
     * @param {number} offsetX - X offset to check (0 = current position)
     * @param {number} offsetY - Y offset to check (0 = current position)
     * @param {number[][]} [matrix] - Optional matrix to use instead of the piece's current matrix
     * @returns {boolean} True if collision detected, false otherwise
     */
    static checkCollision(grid, piece, offsetX = 0, offsetY = 0, matrix = null) {
        const pieceMatrix = matrix || piece.getMatrix();
        const newX = piece.x + offsetX;
        const newY = piece.y + offsetY;
        
        for (let y = 0; y < pieceMatrix.length; y++) {
            for (let x = 0; x < pieceMatrix[y].length; x++) {
                if (pieceMatrix[y][x] !== 0) {
                    const boardX = newX + x;
                    const boardY = newY + y;
                    
                    // Check board boundaries
                    if (
                        boardX < 0 ||               // Left boundary
                        boardX >= BOARD_WIDTH ||    // Right boundary
                        boardY >= BOARD_HEIGHT      // Bottom boundary
                    ) {
                        return true; // Collision detected
                    }
                    
                    // Skip checking above the board
                    if (boardY < 0) continue;
                    
                    // Check collision with existing blocks on the board
                    if (grid[boardY][boardX] !== 0) {
                        return true; // Collision detected
                    }
                }
            }
        }
        
        return false; // No collision
    }
    
    /**
     * Check if a rotation would be valid, including wall kicks
     * @param {number[][]} grid - The game board grid
     * @param {Tetromino} piece - The tetromino to check
     * @param {number} direction - 1 for clockwise, -1 for counterclockwise
     * @returns {Object|null} Object with valid position and rotation, or null if not possible
     */
    static checkRotation(grid, piece, direction = 1) {
        // Skip rotation for O piece
        if (piece.type === 'O') {
            return { matrix: piece.getMatrix(), x: 0, y: 0 };
        }
        
        const newMatrix = piece.rotate(direction);
        const rotationIndex = (piece.rotation + direction) % 4;
        const wallKicks = piece.getWallKickData(piece.rotation);
        
        // Try each wall kick offset
        for (const [kickX, kickY] of wallKicks) {
            if (!this.checkCollision(grid, piece, kickX, kickY, newMatrix)) {
                return {
                    matrix: newMatrix,
                    x: kickX,
                    y: kickY,
                    rotation: rotationIndex
                };
            }
        }
        
        // No valid rotation found
        return null;
    }
    
    /**
     * Find the drop position (where the piece would land if hard-dropped)
     * @param {number[][]} grid - The game board grid
     * @param {Tetromino} piece - The tetromino to check
     * @returns {number} The Y position where the piece would land
     */
    static findDropPosition(grid, piece) {
        let dropY = 0;
        
        while (!this.checkCollision(grid, piece, 0, dropY + 1)) {
            dropY++;
        }
        
        return dropY;
    }
    
    /**
     * Check if game over condition is met (piece cannot be placed at spawn position)
     * @param {number[][]} grid - The game board grid
     * @param {Tetromino} piece - The newly spawned tetromino
     * @returns {boolean} True if game over, false otherwise
     */
    static checkGameOver(grid, piece) {
        return this.checkCollision(grid, piece);
    }
} 