// Game logic tests
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import Game, { GAME_STATES, LANES, DIFFICULTY } from '../src/js/game.js';

describe('Game', () => {
    let game;

    beforeEach(() => {
        game = new Game();
    });

    describe('initialization', () => {
        it('should start in MENU state', () => {
            expect(game.state).toBe(GAME_STATES.MENU);
        });

        it('should initialize with zero score', () => {
            expect(game.score).toBe(0);
        });

        it('should initialize in center lane', () => {
            expect(game.currentLane).toBe(LANES.CENTER);
            expect(game.targetLane).toBe(LANES.CENTER);
        });

        it('should have initial speed set', () => {
            expect(game.speed).toBe(DIFFICULTY.initialSpeed);
        });

        it('should have no nitro initially', () => {
            expect(game.nitroAmount).toBe(0);
            expect(game.isNitroActive).toBe(false);
        });
    });

    describe('state management', () => {
        it('should change state correctly', () => {
            game.setState(GAME_STATES.CAR_SELECT);
            expect(game.state).toBe(GAME_STATES.CAR_SELECT);
        });

        it('should call onStateChange callback', () => {
            const callback = jest.fn();
            game.onStateChange = callback;

            game.setState(GAME_STATES.PLAYING);

            expect(callback).toHaveBeenCalledWith(GAME_STATES.PLAYING, GAME_STATES.MENU);
        });
    });

    describe('startGame', () => {
        it('should reset game values', () => {
            game.score = 1000;
            game.distance = 500;
            game.nitroAmount = 50;

            game.startGame();

            expect(game.score).toBe(0);
            expect(game.distance).toBe(0);
            expect(game.nitroAmount).toBe(0);
            expect(game.state).toBe(GAME_STATES.PLAYING);
        });

        it('should reset lane to center', () => {
            game.targetLane = LANES.LEFT;
            game.startGame();
            expect(game.targetLane).toBe(LANES.CENTER);
        });

        it('should reset powerup states', () => {
            game.hasShield = true;
            game.isSlowMo = true;
            game.scoreMultiplier = 2;

            game.startGame();

            expect(game.hasShield).toBe(false);
            expect(game.isSlowMo).toBe(false);
            expect(game.scoreMultiplier).toBe(1);
        });
    });

    describe('lane movement', () => {
        beforeEach(() => {
            game.startGame();
        });

        it('should move left from center', () => {
            game.moveLeft();
            expect(game.targetLane).toBe(LANES.LEFT);
        });

        it('should move right from center', () => {
            game.moveRight();
            expect(game.targetLane).toBe(LANES.RIGHT);
        });

        it('should not move left past left lane', () => {
            game.targetLane = LANES.LEFT;
            game.moveLeft();
            expect(game.targetLane).toBe(LANES.LEFT);
        });

        it('should not move right past right lane', () => {
            game.targetLane = LANES.RIGHT;
            game.moveRight();
            expect(game.targetLane).toBe(LANES.RIGHT);
        });

        it('should not move when not playing', () => {
            game.setState(GAME_STATES.MENU);
            game.moveLeft();
            expect(game.targetLane).toBe(LANES.CENTER);
        });
    });

    describe('nitro system', () => {
        beforeEach(() => {
            game.startGame();
        });

        it('should add nitro', () => {
            game.addNitro(50);
            expect(game.nitroAmount).toBe(50);
        });

        it('should not exceed max nitro', () => {
            game.addNitro(150);
            expect(game.nitroAmount).toBe(game.maxNitro);
        });

        it('should activate nitro with sufficient amount', () => {
            game.addNitro(50);
            game.activateNitro();
            expect(game.isNitroActive).toBe(true);
        });

        it('should not activate nitro with insufficient amount', () => {
            game.addNitro(20);
            game.activateNitro();
            expect(game.isNitroActive).toBe(false);
        });

        it('should deactivate nitro', () => {
            game.addNitro(50);
            game.activateNitro();
            game.deactivateNitro();
            expect(game.isNitroActive).toBe(false);
        });
    });

    describe('powerups', () => {
        beforeEach(() => {
            game.startGame();
        });

        it('should activate shield', () => {
            const callback = jest.fn();
            game.onPowerupChange = callback;

            game.activateShield(5000);

            expect(game.hasShield).toBe(true);
            expect(game.shieldTimer).toBe(5000);
            expect(callback).toHaveBeenCalledWith('shield', true);
        });

        it('should activate slow-mo', () => {
            game.activateSlowMo(3000);
            expect(game.isSlowMo).toBe(true);
            expect(game.slowMoTimer).toBe(3000);
        });

        it('should activate multiplier', () => {
            game.activateMultiplier(10000);
            expect(game.scoreMultiplier).toBe(2);
            expect(game.multiplierTimer).toBe(10000);
        });
    });

    describe('collision handling', () => {
        beforeEach(() => {
            game.startGame();
        });

        it('should absorb collision with shield', () => {
            game.activateShield(5000);
            const result = game.handleCollision();

            expect(result).toBe(false);
            expect(game.hasShield).toBe(false);
            expect(game.state).toBe(GAME_STATES.PLAYING);
        });

        it('should trigger game over without shield', () => {
            const callback = jest.fn();
            game.onGameOver = callback;

            const result = game.handleCollision();

            expect(result).toBe(true);
            expect(game.state).toBe(GAME_STATES.GAME_OVER);
            expect(callback).toHaveBeenCalled();
        });
    });

    describe('update', () => {
        beforeEach(() => {
            game.startGame();
        });

        it('should increase distance over time', () => {
            game.update(0.1);
            expect(game.distance).toBeGreaterThan(0);
        });

        it('should increase score over time', () => {
            game.update(0.1);
            expect(game.score).toBeGreaterThan(0);
        });

        it('should not update when not playing', () => {
            game.setState(GAME_STATES.MENU);
            const initialScore = game.score;
            game.update(0.1);
            expect(game.score).toBe(initialScore);
        });

        it('should decrease powerup timers', () => {
            game.activateShield(1000);
            game.update(0.5);
            expect(game.shieldTimer).toBeLessThan(1000);
        });

        it('should deactivate powerups when timer expires', () => {
            const callback = jest.fn();
            game.onPowerupChange = callback;

            game.activateShield(100);
            game.update(0.2); // 200ms

            expect(game.hasShield).toBe(false);
            expect(callback).toHaveBeenCalledWith('shield', false);
        });
    });

    describe('difficulty scaling', () => {
        beforeEach(() => {
            game.startGame();
        });

        it('should have spawn interval based on game time', () => {
            const initialInterval = game.getSpawnInterval();
            game.gameTime = DIFFICULTY.difficultyRampTime / 2;
            const laterInterval = game.getSpawnInterval();

            expect(laterInterval).toBeLessThan(initialInterval);
        });

        it('should spawn obstacles based on interval', () => {
            // First spawn happens at gameTime 0, lastSpawnTime 0, so interval check passes
            game.gameTime = game.getSpawnInterval() + 100;
            expect(game.shouldSpawnObstacle()).toBe(true);

            // After spawning, lastSpawnTime is updated, so immediate re-check should fail
            expect(game.shouldSpawnObstacle()).toBe(false);
        });
    });

    describe('reset', () => {
        it('should reset all game state', () => {
            game.startGame();
            game.score = 1000;
            game.distance = 500;
            game.addNitro(50);
            game.activateShield();
            game.targetLane = LANES.LEFT;

            game.reset();

            expect(game.state).toBe(GAME_STATES.MENU);
            expect(game.score).toBe(0);
            expect(game.distance).toBe(0);
            expect(game.nitroAmount).toBe(0);
            expect(game.hasShield).toBe(false);
            expect(game.targetLane).toBe(LANES.CENTER);
        });
    });
});
