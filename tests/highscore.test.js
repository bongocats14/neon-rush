// High score system tests
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import HighScoreManager from '../src/js/highscore.js';

describe('HighScoreManager', () => {
    let manager;

    beforeEach(() => {
        // Clear localStorage mock before each test
        localStorage.clear();
        manager = new HighScoreManager();
    });

    describe('initialization', () => {
        it('should initialize with zero global score', () => {
            expect(manager.getGlobalHighScore()).toBe(0);
        });

        it('should initialize with zero car scores', () => {
            expect(manager.getCarHighScore('bmw')).toBe(0);
            expect(manager.getCarHighScore('supra')).toBe(0);
            expect(manager.getCarHighScore('corvette')).toBe(0);
        });

        it('should load existing scores from localStorage', () => {
            localStorage.setItem('neon_rush_highscores', JSON.stringify({
                global: 5000,
                cars: { bmw: 3000, supra: 5000, corvette: 4000 }
            }));

            const newManager = new HighScoreManager();

            expect(newManager.getGlobalHighScore()).toBe(5000);
            expect(newManager.getCarHighScore('supra')).toBe(5000);
        });
    });

    describe('submitScore', () => {
        it('should update global high score when higher', () => {
            const result = manager.submitScore(1000, 'bmw');

            expect(result.isNewGlobalRecord).toBe(true);
            expect(manager.getGlobalHighScore()).toBe(1000);
        });

        it('should not update global high score when lower', () => {
            manager.submitScore(5000, 'bmw');
            const result = manager.submitScore(3000, 'bmw');

            expect(result.isNewGlobalRecord).toBe(false);
            expect(manager.getGlobalHighScore()).toBe(5000);
        });

        it('should update car high score when higher', () => {
            const result = manager.submitScore(1000, 'bmw');

            expect(result.isNewCarRecord).toBe(true);
            expect(manager.getCarHighScore('bmw')).toBe(1000);
        });

        it('should not update car high score when lower', () => {
            manager.submitScore(5000, 'bmw');
            const result = manager.submitScore(3000, 'bmw');

            expect(result.isNewCarRecord).toBe(false);
            expect(manager.getCarHighScore('bmw')).toBe(5000);
        });

        it('should track scores per car independently', () => {
            manager.submitScore(1000, 'bmw');
            manager.submitScore(2000, 'supra');
            manager.submitScore(1500, 'corvette');

            expect(manager.getCarHighScore('bmw')).toBe(1000);
            expect(manager.getCarHighScore('supra')).toBe(2000);
            expect(manager.getCarHighScore('corvette')).toBe(1500);
        });

        it('should floor decimal scores', () => {
            manager.submitScore(1234.567, 'bmw');

            expect(manager.getGlobalHighScore()).toBe(1234);
        });

        it('should return previous scores in result', () => {
            manager.submitScore(1000, 'bmw');
            const result = manager.submitScore(2000, 'bmw');

            expect(result.previousGlobal).toBe(1000);
            expect(result.previousCar).toBe(1000);
        });

        it('should save to localStorage on new record', () => {
            manager.submitScore(1000, 'bmw');

            expect(localStorage.setItem).toHaveBeenCalled();
        });

        it('should not save to localStorage when not a new record', () => {
            manager.submitScore(5000, 'bmw');
            const callCountAfterFirst = localStorage.setItem.mock.calls.length;
            manager.submitScore(3000, 'bmw'); // Lower score, no new record

            // setItem should not be called again since 3000 < 5000
            expect(localStorage.setItem.mock.calls.length).toBe(callCountAfterFirst);
        });
    });

    describe('getAllScores', () => {
        it('should return all scores', () => {
            manager.submitScore(1000, 'bmw');
            manager.submitScore(2000, 'supra');

            const scores = manager.getAllScores();

            expect(scores.global).toBe(2000);
            expect(scores.cars.bmw).toBe(1000);
            expect(scores.cars.supra).toBe(2000);
        });

        it('should return copy of scores object', () => {
            const scores = manager.getAllScores();
            scores.global = 9999;

            expect(manager.getGlobalHighScore()).toBe(0);
        });
    });

    describe('resetScores', () => {
        it('should reset all scores to zero', () => {
            manager.submitScore(1000, 'bmw');
            manager.submitScore(2000, 'supra');

            manager.resetScores();

            expect(manager.getGlobalHighScore()).toBe(0);
            expect(manager.getCarHighScore('bmw')).toBe(0);
            expect(manager.getCarHighScore('supra')).toBe(0);
        });

        it('should save reset state to localStorage', () => {
            manager.resetScores();

            expect(localStorage.setItem).toHaveBeenCalled();
        });
    });

    describe('getLeaderboard', () => {
        it('should return sorted list of car scores', () => {
            manager.submitScore(1000, 'bmw');
            manager.submitScore(3000, 'supra');
            manager.submitScore(2000, 'corvette');

            const leaderboard = manager.getLeaderboard();

            expect(leaderboard[0].carId).toBe('supra');
            expect(leaderboard[0].score).toBe(3000);
            expect(leaderboard[1].carId).toBe('corvette');
            expect(leaderboard[2].carId).toBe('bmw');
        });

        it('should include all cars even with zero scores', () => {
            const leaderboard = manager.getLeaderboard();

            expect(leaderboard.length).toBe(3);
        });
    });

    describe('getCarHighScore', () => {
        it('should return 0 for unknown car', () => {
            expect(manager.getCarHighScore('unknown')).toBe(0);
        });

        it('should return 0 for null car', () => {
            expect(manager.getCarHighScore(null)).toBe(0);
        });
    });

    describe('localStorage error handling', () => {
        it('should handle localStorage parse errors gracefully', () => {
            // Store invalid JSON directly in mock store
            localStorage.store['neon_rush_highscores'] = 'invalid json';

            const newManager = new HighScoreManager();

            expect(newManager.getGlobalHighScore()).toBe(0);
        });

        it('should handle missing localStorage gracefully', () => {
            // When localStorage returns null (no stored data), should use defaults
            const newManager = new HighScoreManager();
            expect(newManager.getGlobalHighScore()).toBe(0);
        });
    });

    describe('persistence', () => {
        it('should persist scores across manager instances', () => {
            manager.submitScore(5000, 'bmw');

            const newManager = new HighScoreManager();

            expect(newManager.getGlobalHighScore()).toBe(5000);
            expect(newManager.getCarHighScore('bmw')).toBe(5000);
        });
    });
});
