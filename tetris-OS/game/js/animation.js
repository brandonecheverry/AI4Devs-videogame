/**
 * Animation system for Tetris
 */

class AnimationSystem {
    /**
     * Create a new animation system
     * @param {Renderer} renderer - The game renderer
     */
    constructor(renderer) {
        this.renderer = renderer;
        this.animations = [];
    }
    
    /**
     * Reset the animation system
     */
    reset() {
        this.animations = [];
    }
    
    /**
     * Add a line clear animation
     * @param {number[]} lines - Array of line indices to clear
     */
    addLineClearAnimation(lines) {
        this.animations.push({
            type: 'lineClear',
            lines: [...lines], // Clone array to avoid mutation issues
            startTime: performance.now(),
            duration: ANIMATION_DURATIONS.LINE_CLEAR
        });
    }
    
    /**
     * Add a level up animation
     * @param {number} level - The new level
     */
    addLevelUpAnimation(level) {
        this.animations.push({
            type: 'levelUp',
            level: level,
            startTime: performance.now(),
            duration: ANIMATION_DURATIONS.LEVEL_UP
        });
    }
    
    /**
     * Add a piece movement animation
     * @param {Tetromino} piece - The tetromino piece
     * @param {number} fromX - Starting X position
     * @param {number} fromY - Starting Y position
     * @param {number} toX - Ending X position
     * @param {number} toY - Ending Y position
     */
    addPieceMoveAnimation(piece, fromX, fromY, toX, toY) {
        this.animations.push({
            type: 'pieceMove',
            piece: piece,
            fromX: fromX,
            fromY: fromY,
            toX: toX,
            toY: toY,
            startTime: performance.now(),
            duration: ANIMATION_DURATIONS.PIECE_MOVEMENT
        });
    }
    
    /**
     * Add a piece rotation animation
     * @param {Tetromino} piece - The tetromino piece
     * @param {number[][]} fromMatrix - Starting matrix
     * @param {number[][]} toMatrix - Ending matrix
     */
    addPieceRotationAnimation(piece, fromMatrix, toMatrix) {
        this.animations.push({
            type: 'pieceRotation',
            piece: piece,
            fromMatrix: fromMatrix,
            toMatrix: toMatrix,
            startTime: performance.now(),
            duration: ANIMATION_DURATIONS.PIECE_ROTATION
        });
    }
    
    /**
     * Add a game over animation
     */
    addGameOverAnimation() {
        this.animations.push({
            type: 'gameOver',
            startTime: performance.now(),
            duration: ANIMATION_DURATIONS.GAME_OVER
        });
    }
    
    /**
     * Update all active animations
     * @param {number} currentTime - Current timestamp
     * @returns {boolean} True if any animations are still active
     */
    update(currentTime) {
        let active = false;
        
        for (let i = this.animations.length - 1; i >= 0; i--) {
            const anim = this.animations[i];
            const elapsed = currentTime - anim.startTime;
            const progress = Math.min(elapsed / anim.duration, 1);
            
            this.renderAnimation(anim, progress);
            
            if (progress >= 1) {
                this.animations.splice(i, 1);
            } else {
                active = true;
            }
        }
        
        return active;
    }
    
    /**
     * Render the specific animation based on type
     * @param {Object} anim - Animation object
     * @param {number} progress - Animation progress (0-1)
     */
    renderAnimation(anim, progress) {
        switch (anim.type) {
            case 'lineClear':
                this.renderer.renderLineClearAnimation(anim.lines, progress);
                break;
            case 'levelUp':
                this.renderer.renderLevelUpAnimation(anim.level, progress);
                break;
            case 'gameOver':
                this.renderGameOverAnimation(progress);
                break;
            // Other animation types can be added here
        }
    }
    
    /**
     * Render the game over animation
     * @param {number} progress - Animation progress (0-1)
     */
    renderGameOverAnimation(progress) {
        const ctx = this.renderer.gameCtx;
        const canvas = this.renderer.gameCanvas;
        
        // Fade to black effect
        ctx.fillStyle = `rgba(0, 0, 0, ${progress * 0.7})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Game over text
        if (progress > 0.5) {
            const textAlpha = (progress - 0.5) * 2; // 0 to 1 during second half
            
            ctx.font = 'bold 40px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
            ctx.fillText(
                'GAME OVER', 
                canvas.width / 2, 
                canvas.height / 2
            );
        }
    }
    
    /**
     * Check if there are any active animations of a specific type
     * @param {string} type - Animation type to check for
     * @returns {boolean} True if any animations of this type are active
     */
    hasActiveAnimationType(type) {
        return this.animations.some(anim => anim.type === type);
    }
    
    /**
     * Check if there are any active animations
     * @returns {boolean} True if any animations are active
     */
    hasActiveAnimations() {
        return this.animations.length > 0;
    }
} 