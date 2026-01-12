// High score persistence system

const STORAGE_KEY = 'neon_rush_highscores';

class HighScoreManager {
    constructor() {
        this.scores = this.loadScores();
    }

    /**
     * Load scores from localStorage
     */
    loadScores() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load high scores:', error);
        }
        return {
            global: 0,
            cars: {
                bmw: 0,
                supra: 0,
                corvette: 0
            }
        };
    }

    /**
     * Save scores to localStorage
     */
    saveScores() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.scores));
        } catch (error) {
            console.warn('Failed to save high scores:', error);
        }
    }

    /**
     * Get global high score
     */
    getGlobalHighScore() {
        return this.scores.global || 0;
    }

    /**
     * Get high score for specific car
     */
    getCarHighScore(carId) {
        return this.scores.cars?.[carId] || 0;
    }

    /**
     * Submit a new score
     * Returns object with isNewGlobalRecord and isNewCarRecord flags
     */
    submitScore(distance, carId) {
        const result = {
            distance: Math.floor(distance),
            isNewGlobalRecord: false,
            isNewCarRecord: false,
            previousGlobal: this.scores.global,
            previousCar: this.scores.cars?.[carId] || 0
        };

        // Check global record
        if (distance > this.scores.global) {
            this.scores.global = Math.floor(distance);
            result.isNewGlobalRecord = true;
        }

        // Check car-specific record
        if (carId && (!this.scores.cars[carId] || distance > this.scores.cars[carId])) {
            this.scores.cars[carId] = Math.floor(distance);
            result.isNewCarRecord = true;
        }

        // Save if new record
        if (result.isNewGlobalRecord || result.isNewCarRecord) {
            this.saveScores();
        }

        return result;
    }

    /**
     * Get all high scores
     */
    getAllScores() {
        return {
            global: this.scores.global,
            cars: { ...this.scores.cars }
        };
    }

    /**
     * Reset all scores
     */
    resetScores() {
        this.scores = {
            global: 0,
            cars: {
                bmw: 0,
                supra: 0,
                corvette: 0
            }
        };
        this.saveScores();
    }

    /**
     * Get leaderboard (sorted list of car scores)
     */
    getLeaderboard() {
        const entries = Object.entries(this.scores.cars)
            .map(([carId, score]) => ({ carId, score }))
            .sort((a, b) => b.score - a.score);
        return entries;
    }
}

// Export singleton
export const highScoreManager = new HighScoreManager();
export default HighScoreManager;
