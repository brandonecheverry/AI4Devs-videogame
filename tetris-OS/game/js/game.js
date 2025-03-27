/**
 * Main game logic for Tetris
 */
class Game {
    /**
     * Create a new game
     */
    constructor() {
        // Get DOM elements
        this.gameCanvas = document.getElementById('game-canvas');
        this.nextPieceCanvas = document.getElementById('next-piece-canvas');
        this.gameContainer = document.querySelector('.game-container');
        
        // Create game systems
        this.renderer = new Renderer(this.gameCanvas, this.nextPieceCanvas);
        this.board = new Board();
        this.tetrominoFactory = new TetrominoFactory();
        this.scorer = new ScoringSystem();
        this.input = new InputHandler(this.gameContainer);
        this.animation = new AnimationSystem(this.renderer);
        this.audio = new AudioSystem();
        this.storage = new StorageSystem();
        
        // Game state
        this.currentState = GAME_STATES.TITLE_SCREEN;
        this.currentPiece = null;
        this.nextPiece = null;
        this.lastDropTime = 0;
        this.lockDelayTime = 0;
        this.isPaused = false;
        this.isGameOver = false;
        
        // Set up input handlers
        this.setupInputHandlers();
        
        // Set up UI event listeners
        this.setupUIEventListeners();
        
        // Start render loop
        this.lastRenderTime = 0;
        this.loop(0);
    }
    
    /**
     * Set up keyboard and touch input handlers
     */
    setupInputHandlers() {
        // Movement controls
        this.input.onKeyDown(KEY_BINDINGS.LEFT, () => {
            if (this.currentState === GAME_STATES.PLAYING && !this.isPaused) {
                this.moveLeft();
            }
        });
        
        this.input.onKeyDown(KEY_BINDINGS.RIGHT, () => {
            if (this.currentState === GAME_STATES.PLAYING && !this.isPaused) {
                this.moveRight();
            }
        });
        
        this.input.onKeyDown(KEY_BINDINGS.DOWN, () => {
            if (this.currentState === GAME_STATES.PLAYING && !this.isPaused) {
                this.softDrop();
            }
        });
        
        // Rotation
        this.input.onKeyPress(KEY_BINDINGS.ROTATE, () => {
            if (this.currentState === GAME_STATES.PLAYING && !this.isPaused) {
                this.rotatePiece();
            }
        });
        
        // Hard drop
        this.input.onKeyPress(KEY_BINDINGS.HARD_DROP, () => {
            if (this.currentState === GAME_STATES.PLAYING && !this.isPaused) {
                this.hardDrop();
            }
        });
        
        // Pause
        this.input.onKeyPress(KEY_BINDINGS.PAUSE, () => {
            if (this.currentState === GAME_STATES.PLAYING) {
                this.togglePause();
            }
        });
        
        // Restart
        this.input.onKeyPress(KEY_BINDINGS.RESTART, () => {
            if (this.currentState === GAME_STATES.PLAYING || this.currentState === GAME_STATES.GAME_OVER) {
                this.restart();
            }
        });
    }
    
    /**
     * Set up UI button event listeners
     */
    setupUIEventListeners() {
        // Title screen
        document.getElementById('start-button').addEventListener('click', () => {
            this.startGame();
        });
        
        // Game screen
        document.getElementById('pause-button').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restart-button').addEventListener('click', () => {
            this.restart();
        });
        
        document.getElementById('quit-button').addEventListener('click', () => {
            this.showTitleScreen();
        });
        
        // Pause screen
        document.getElementById('resume-button').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restart-from-pause-button').addEventListener('click', () => {
            this.restart();
        });
        
        document.getElementById('quit-from-pause-button').addEventListener('click', () => {
            this.showTitleScreen();
        });
        
        // Game over screen
        document.getElementById('submit-score-button').addEventListener('click', () => {
            this.submitHighScore();
        });
        
        document.getElementById('play-again-button').addEventListener('click', () => {
            this.restart();
        });
        
        document.getElementById('quit-from-game-over-button').addEventListener('click', () => {
            this.showTitleScreen();
        });
        
        // High scores modal
        document.getElementById('close-high-scores-button').addEventListener('click', () => {
            document.getElementById('high-scores-modal').classList.add('hidden');
        });
    }
    
    /**
     * Start the game
     */
    startGame() {
        // Hide title screen, show game screen
        document.getElementById('title-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        
        // Set up game
        this.board.reset();
        this.scorer.reset();
        this.animation.reset();
        this.input.reset();
        
        // Create initial pieces
        this.nextPiece = this.tetrominoFactory.getNext();
        this.spawnPiece();
        
        // Update game state
        this.currentState = GAME_STATES.PLAYING;
        this.isPaused = false;
        this.isGameOver = false;
        
        // Update UI
        this.renderer.updateStats(this.scorer.getStats());
    }
    
    /**
     * Show the title screen
     */
    showTitleScreen() {
        // Hide all screens
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('pause-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        
        // Show title screen
        document.getElementById('title-screen').classList.remove('hidden');
        
        // Update game state
        this.currentState = GAME_STATES.TITLE_SCREEN;
        this.isPaused = false;
    }
    
    /**
     * Toggle pause state
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            document.getElementById('pause-screen').classList.remove('hidden');
            this.currentState = GAME_STATES.PAUSED;
        } else {
            document.getElementById('pause-screen').classList.add('hidden');
            this.currentState = GAME_STATES.PLAYING;
        }
    }
    
    /**
     * Restart the game
     */
    restart() {
        // Hide all screens except game screen
        document.getElementById('pause-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        
        // Reset game systems
        this.board.reset();
        this.scorer.reset();
        this.animation.reset();
        this.input.reset();
        
        // Create initial pieces
        this.nextPiece = this.tetrominoFactory.getNext();
        this.spawnPiece();
        
        // Update game state
        this.currentState = GAME_STATES.PLAYING;
        this.isPaused = false;
        this.isGameOver = false;
        
        // Update UI
        this.renderer.updateStats(this.scorer.getStats());
    }
    
    /**
     * Spawn a new piece
     */
    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.tetrominoFactory.getNext();
        this.renderer.drawNextPiece(this.nextPiece);
        this.lockDelayTime = 0;
        
        // Check for game over
        if (CollisionSystem.checkGameOver(this.board.grid, this.currentPiece)) {
            this.gameOver();
        }
    }
    
    /**
     * Move the current piece left
     */
    moveLeft() {
        if (!this.currentPiece) return;
        
        if (this.board.moveLeft(this.currentPiece)) {
            this.audio.play('move');
            this.lockDelayTime = 0;
        }
    }
    
    /**
     * Move the current piece right
     */
    moveRight() {
        if (!this.currentPiece) return;
        
        if (this.board.moveRight(this.currentPiece)) {
            this.audio.play('move');
            this.lockDelayTime = 0;
        }
    }
    
    /**
     * Soft drop - move the current piece down faster
     */
    softDrop() {
        if (!this.currentPiece) return;
        
        if (this.board.moveDown(this.currentPiece)) {
            this.audio.play('move');
            this.scorer.addSoftDropPoints(1);
            this.renderer.updateStats(this.scorer.getStats());
            this.lastDropTime = performance.now();
        }
    }
    
    /**
     * Hard drop - move the current piece to the bottom instantly
     */
    hardDrop() {
        if (!this.currentPiece) return;
        
        const dropDistance = this.board.hardDrop(this.currentPiece);
        this.audio.play('hardDrop');
        this.scorer.addHardDropPoints(dropDistance);
        this.renderer.updateStats(this.scorer.getStats());
        
        // Lock piece immediately
        this.lockPiece();
    }
    
    /**
     * Rotate the current piece
     */
    rotatePiece() {
        if (!this.currentPiece) return;
        
        if (this.board.rotatePiece(this.currentPiece)) {
            this.audio.play('rotate');
            this.lockDelayTime = 0;
        }
    }
    
    /**
     * Lock the current piece into the board
     */
    lockPiece() {
        const completedLines = this.board.lockPiece(this.currentPiece);
        
        if (completedLines.length > 0) {
            // Add points for cleared lines
            const scoreResult = this.scorer.addLineClearPoints(completedLines.length);
            this.renderer.updateStats(this.scorer.getStats());
            
            // Play appropriate sound
            if (completedLines.length === 4) {
                this.audio.play('tetris');
            } else {
                this.audio.play('lineClear');
            }
            
            // Add line clear animation
            this.animation.addLineClearAnimation(completedLines);
            
            // Add level up animation if needed
            if (scoreResult.levelUp) {
                this.animation.addLevelUpAnimation(scoreResult.level);
                this.audio.play('levelUp');
            }
        } else {
            this.audio.play('drop');
        }
        
        // Spawn next piece
        this.spawnPiece();
    }
    
    /**
     * End the game
     */
    gameOver() {
        this.isGameOver = true;
        this.currentState = GAME_STATES.GAME_OVER;
        this.animation.addGameOverAnimation();
        this.audio.play('gameOver');
        
        // Update UI
        document.getElementById('final-score').textContent = this.scorer.score;
        
        // Show game over screen after animation
        setTimeout(() => {
            document.getElementById('game-over-screen').classList.remove('hidden');
        }, ANIMATION_DURATIONS.GAME_OVER);
    }
    
    /**
     * Submit high score
     */
    submitHighScore() {
        const name = document.getElementById('player-name').value.trim();
        const { score, level, lines } = this.scorer.getStats();
        
        // Add high score
        this.storage.addHighScore(name, score, level, lines);
        
        // Update high score display
        this.storage.updateHighScoreDisplay();
        
        // Show high scores modal
        document.getElementById('high-scores-modal').classList.remove('hidden');
    }
    
    /**
     * Update game state
     * @param {number} deltaTime - Time since last update
     */
    update(deltaTime) {
        // Skip updates if game is paused or over
        if (this.isPaused || this.isGameOver || this.currentState !== GAME_STATES.PLAYING) {
            return;
        }
        
        // Process input
        this.input.update();
        
        // Update animations
        const animationsActive = this.animation.update(performance.now());
        
        // Skip piece updates if animations are playing
        if (animationsActive) {
            return;
        }
        
        // Check if it's time to drop the piece
        const currentTime = performance.now();
        const dropInterval = this.scorer.getDropInterval();
        
        if (currentTime - this.lastDropTime > dropInterval) {
            if (this.currentPiece) {
                // Try to move down
                if (!this.board.moveDown(this.currentPiece)) {
                    // Piece can't move down, start lock delay
                    this.lockDelayTime += currentTime - this.lastDropTime;
                    
                    // Lock after 500ms delay
                    if (this.lockDelayTime >= 500) {
                        this.lockPiece();
                    }
                } else {
                    // Piece moved down, reset lock delay
                    this.lockDelayTime = 0;
                }
            }
            
            this.lastDropTime = currentTime;
        }
    }
    
    /**
     * Render the game
     */
    render() {
        // Clear canvases
        this.renderer.clearGameCanvas();
        
        // Draw grid
        this.renderer.drawGrid();
        
        // Draw board
        this.renderer.drawBoard(this.board.grid);
        
        // Draw current piece and ghost if game is active
        if (this.currentPiece && this.currentState === GAME_STATES.PLAYING && !this.isPaused) {
            // Draw ghost piece (landing position)
            const ghostY = this.board.getGhostPosition(this.currentPiece);
            this.renderer.drawGhostPiece(this.currentPiece, ghostY);
            
            // Draw active piece
            this.renderer.drawPiece(this.currentPiece);
        }
    }
    
    /**
     * Main game loop
     * @param {number} timestamp - Current time
     */
    loop(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - this.lastRenderTime;
        this.lastRenderTime = timestamp;
        
        // Update game state
        this.update(deltaTime);
        
        // Render game
        this.render();
        
        // Schedule next frame
        requestAnimationFrame(this.loop.bind(this));
    }
} 