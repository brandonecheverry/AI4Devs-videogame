/**
 * Rendering system for Tetris
 */

class Renderer {
    /**
     * Create a new renderer
     * @param {HTMLCanvasElement} gameCanvas - The main game canvas
     * @param {HTMLCanvasElement} nextPieceCanvas - The next piece preview canvas
     */
    constructor(gameCanvas, nextPieceCanvas) {
        // Main game canvas
        this.gameCanvas = gameCanvas;
        this.gameCtx = gameCanvas.getContext('2d');
        
        // Next piece preview canvas
        this.nextPieceCanvas = nextPieceCanvas;
        this.nextPieceCtx = nextPieceCanvas.getContext('2d');
        
        // Setup
        this.blockSize = CELL_SIZE;
        
        // Set canvas dimensions based on board size
        this.gameCanvas.width = BOARD_WIDTH * this.blockSize;
        this.gameCanvas.height = BOARD_HEIGHT * this.blockSize;
    }
    
    /**
     * Clear the game canvas
     */
    clearGameCanvas() {
        this.gameCtx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
    }
    
    /**
     * Clear the next piece canvas
     */
    clearNextPieceCanvas() {
        this.nextPieceCtx.clearRect(0, 0, this.nextPieceCanvas.width, this.nextPieceCanvas.height);
    }
    
    /**
     * Draw the grid lines on the game canvas
     */
    drawGrid() {
        const ctx = this.gameCtx;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 0.5;
        
        // Draw vertical lines
        for (let x = 0; x <= BOARD_WIDTH; x++) {
            ctx.beginPath();
            ctx.moveTo(x * this.blockSize, 0);
            ctx.lineTo(x * this.blockSize, BOARD_HEIGHT * this.blockSize);
            ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= BOARD_HEIGHT; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * this.blockSize);
            ctx.lineTo(BOARD_WIDTH * this.blockSize, y * this.blockSize);
            ctx.stroke();
        }
    }
    
    /**
     * Draw a single tetromino block
     * @param {CanvasRenderingContext2D} ctx - Canvas context to draw on
     * @param {number} x - X grid position
     * @param {number} y - Y grid position
     * @param {string} color - Block color (hex code)
     * @param {number} alpha - Opacity (0-1)
     */
    drawBlock(ctx, x, y, color, alpha = 1) {
        const blockSize = this.blockSize;
        
        ctx.globalAlpha = alpha;
        
        // Fill block
        ctx.fillStyle = color;
        ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        
        // Draw 3D effect
        // Top-left highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(x * blockSize, y * blockSize);
        ctx.lineTo((x + 1) * blockSize, y * blockSize);
        ctx.lineTo(x * blockSize, (y + 1) * blockSize);
        ctx.fill();
        
        // Bottom-right shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.moveTo((x + 1) * blockSize, y * blockSize);
        ctx.lineTo((x + 1) * blockSize, (y + 1) * blockSize);
        ctx.lineTo(x * blockSize, (y + 1) * blockSize);
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
        
        ctx.globalAlpha = 1;
    }
    
    /**
     * Draw the game board blocks
     * @param {number[][]} grid - Game board grid
     */
    drawBoard(grid) {
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                const blockId = grid[y][x];
                if (blockId !== 0) {
                    // Map the block ID to the tetromino type
                    let tetrominoType;
                    for (const [type, id] of Object.entries(TETROMINO_IDS)) {
                        if (id === blockId) {
                            tetrominoType = type;
                            break;
                        }
                    }
                    
                    if (tetrominoType) {
                        const color = TETROMINO_COLORS[tetrominoType];
                        this.drawBlock(this.gameCtx, x, y, color);
                    }
                }
            }
        }
    }
    
    /**
     * Draw the active tetromino piece
     * @param {Tetromino} piece - The active tetromino
     */
    drawPiece(piece) {
        const matrix = piece.getMatrix();
        
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] !== 0) {
                    const boardX = piece.x + x;
                    const boardY = piece.y + y;
                    
                    // Only draw if within visible board
                    if (boardY >= 0) {
                        this.drawBlock(this.gameCtx, boardX, boardY, piece.color);
                    }
                }
            }
        }
    }
    
    /**
     * Draw the ghost piece (landing position indicator)
     * @param {Tetromino} piece - The active tetromino
     * @param {number} ghostY - The ghost Y position
     */
    drawGhostPiece(piece, ghostY) {
        const matrix = piece.getMatrix();
        
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] !== 0) {
                    const boardX = piece.x + x;
                    const boardY = ghostY + y;
                    
                    // Only draw if within visible board
                    if (boardY >= 0 && boardY < BOARD_HEIGHT) {
                        this.drawBlock(this.gameCtx, boardX, boardY, piece.color, 0.3);
                    }
                }
            }
        }
    }
    
    /**
     * Draw the next piece preview
     * @param {Tetromino} piece - The next tetromino
     */
    drawNextPiece(piece) {
        this.clearNextPieceCanvas();
        
        const matrix = piece.getMatrix();
        const width = matrix[0].length;
        const height = matrix.length;
        
        // Center the piece in the preview canvas
        const offsetX = Math.floor((this.nextPieceCanvas.width / this.blockSize - width) / 2);
        const offsetY = Math.floor((this.nextPieceCanvas.height / this.blockSize - height) / 2);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (matrix[y][x] !== 0) {
                    this.drawBlock(this.nextPieceCtx, offsetX + x, offsetY + y, piece.color);
                }
            }
        }
    }
    
    /**
     * Render the line clear animation
     * @param {number[]} lines - Array of line indices to animate
     * @param {number} progress - Animation progress (0-1)
     */
    renderLineClearAnimation(lines, progress) {
        const ctx = this.gameCtx;
        const blockSize = this.blockSize;
        
        for (const lineY of lines) {
            // Flash white then fade out
            if (progress < 0.5) {
                ctx.fillStyle = `rgba(255, 255, 255, ${1 - progress * 2})`;
            } else {
                ctx.fillStyle = `rgba(255, 255, 255, 0)`;
            }
            
            ctx.fillRect(
                0, 
                lineY * blockSize, 
                BOARD_WIDTH * blockSize, 
                blockSize
            );
        }
    }
    
    /**
     * Render the level up animation
     * @param {number} level - The new level
     * @param {number} progress - Animation progress (0-1)
     */
    renderLevelUpAnimation(level, progress) {
        const ctx = this.gameCtx;
        
        if (progress < 0.2) {
            // Flash in
            ctx.fillStyle = `rgba(255, 255, 255, ${progress * 5})`;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        } else if (progress < 0.8) {
            // Hold
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            // Display level text
            ctx.font = 'bold 40px "Press Start 2P"';
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                `LEVEL ${level}!`, 
                ctx.canvas.width / 2, 
                ctx.canvas.height / 2
            );
        } else {
            // Flash out
            const alpha = (1 - progress) * 5;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
    }
    
    /**
     * Update game statistics display
     * @param {Object} stats - Game statistics object
     */
    updateStats(stats) {
        document.getElementById('score').textContent = stats.score;
        document.getElementById('level').textContent = stats.level;
        document.getElementById('lines').textContent = stats.lines;
    }
    
    /**
     * Update the final score display on game over
     * @param {number} score - Final score
     */
    updateFinalScore(score) {
        document.getElementById('final-score').textContent = score;
    }
} 