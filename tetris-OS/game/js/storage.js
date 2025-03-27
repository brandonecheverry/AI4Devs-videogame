/**
 * Storage system for Tetris high scores
 */
class StorageSystem {
    constructor() {
        this.highScores = this.loadHighScores();
    }
    
    /**
     * Load high scores from local storage
     * @returns {Array} Array of high score objects
     */
    loadHighScores() {
        try {
            const scores = localStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
            return scores ? JSON.parse(scores) : [];
        } catch (error) {
            console.error('Error loading high scores:', error);
            return [];
        }
    }
    
    /**
     * Save high scores to local storage
     */
    saveHighScores() {
        try {
            localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(this.highScores));
        } catch (error) {
            console.error('Error saving high scores:', error);
        }
    }
    
    /**
     * Add a new high score
     * @param {string} name - Player name
     * @param {number} score - Player score
     * @param {number} level - Player level
     * @param {number} lines - Lines cleared
     * @returns {boolean} True if score was high enough to be added
     */
    addHighScore(name, score, level, lines) {
        const newScore = {
            name: name || 'Anonymous',
            score,
            level,
            lines,
            date: new Date().toISOString()
        };
        
        // Add new score
        this.highScores.push(newScore);
        
        // Sort high scores (highest first)
        this.highScores.sort((a, b) => b.score - a.score);
        
        // Keep only top 10 scores
        if (this.highScores.length > 10) {
            this.highScores = this.highScores.slice(0, 10);
        }
        
        // Save to storage
        this.saveHighScores();
        
        // Return true if score was in top 10
        return this.isHighScore(score);
    }
    
    /**
     * Check if a score would be a high score
     * @param {number} score - Score to check
     * @returns {boolean} True if score is a high score
     */
    isHighScore(score) {
        return this.highScores.length < 10 || score > this.getLowestHighScore();
    }
    
    /**
     * Get the lowest high score
     * @returns {number} Lowest high score
     */
    getLowestHighScore() {
        if (this.highScores.length === 0) {
            return 0;
        }
        return this.highScores[this.highScores.length - 1].score;
    }
    
    /**
     * Get all high scores
     * @returns {Array} Array of high score objects
     */
    getHighScores() {
        return [...this.highScores];
    }
    
    /**
     * Update the high score display in the DOM
     */
    updateHighScoreDisplay() {
        const highScoresList = document.getElementById('high-scores-list');
        highScoresList.innerHTML = '';
        
        if (this.highScores.length === 0) {
            const noScores = document.createElement('div');
            noScores.textContent = 'No high scores yet!';
            noScores.className = 'no-scores';
            highScoresList.appendChild(noScores);
            return;
        }
        
        // Add each high score to the list
        this.highScores.forEach((score, index) => {
            const entry = document.createElement('div');
            entry.className = 'high-score-entry';
            
            const rank = document.createElement('div');
            rank.className = 'high-score-rank';
            rank.textContent = `${index + 1}.`;
            
            const name = document.createElement('div');
            name.className = 'high-score-name';
            name.textContent = score.name;
            
            const scoreValue = document.createElement('div');
            scoreValue.className = 'high-score-score';
            scoreValue.textContent = score.score;
            
            entry.appendChild(rank);
            entry.appendChild(name);
            entry.appendChild(scoreValue);
            
            highScoresList.appendChild(entry);
        });
    }
} 