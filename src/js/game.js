// Game state and core loop

export const GAME_STATES = {
    MENU: 'menu',
    CAR_SELECT: 'car_select',
    PLAYING: 'playing',
    GAME_OVER: 'game_over'
};

export const LANES = {
    LEFT: -1,
    CENTER: 0,
    RIGHT: 1
};

export const LANE_WIDTH = 4;
export const ROAD_WIDTH = LANE_WIDTH * 3;

export const DIFFICULTY = {
    initialSpeed: 30,
    maxSpeed: 120,
    speedIncreaseRate: 0.5,
    initialSpawnInterval: 2000,
    minSpawnInterval: 500,
    spawnDecreaseRate: 50,
    difficultyRampTime: 120000
};

class Game {
    constructor() {
        this.state = GAME_STATES.MENU;
        this.score = 0;
        this.distance = 0;
        this.speed = DIFFICULTY.initialSpeed;
        this.currentLane = LANES.CENTER;
        this.targetLane = LANES.CENTER;
        this.selectedCar = null;
        this.isNitroActive = false;
        this.nitroAmount = 0;
        this.maxNitro = 100;
        this.nitroBoostMultiplier = 1.5;

        // Power-up states
        this.hasShield = false;
        this.shieldTimer = 0;
        this.isSlowMo = false;
        this.slowMoTimer = 0;
        this.scoreMultiplier = 1;
        this.multiplierTimer = 0;

        // Timing
        this.gameTime = 0;
        this.lastSpawnTime = 0;
        this.deltaTime = 0;

        // Callbacks
        this.onStateChange = null;
        this.onScoreUpdate = null;
        this.onSpeedUpdate = null;
        this.onNitroUpdate = null;
        this.onPowerupChange = null;
        this.onGameOver = null;
    }

    setState(newState) {
        const oldState = this.state;
        this.state = newState;
        if (this.onStateChange) {
            this.onStateChange(newState, oldState);
        }
    }

    selectCar(carId) {
        this.selectedCar = carId;
    }

    startGame() {
        this.score = 0;
        this.distance = 0;
        this.speed = DIFFICULTY.initialSpeed;
        this.currentLane = LANES.CENTER;
        this.targetLane = LANES.CENTER;
        this.isNitroActive = false;
        this.nitroAmount = 0;
        this.hasShield = false;
        this.shieldTimer = 0;
        this.isSlowMo = false;
        this.slowMoTimer = 0;
        this.scoreMultiplier = 1;
        this.multiplierTimer = 0;
        this.gameTime = 0;
        this.lastSpawnTime = 0;
        this.setState(GAME_STATES.PLAYING);
    }

    update(deltaTime) {
        if (this.state !== GAME_STATES.PLAYING) return;

        // Apply slow-mo effect
        const effectiveDelta = this.isSlowMo ? deltaTime * 0.5 : deltaTime;
        this.deltaTime = effectiveDelta;
        this.gameTime += effectiveDelta * 1000;

        // Update speed based on difficulty
        this.updateDifficulty();

        // Update distance and score
        const distanceThisFrame = this.speed * effectiveDelta;
        this.distance += distanceThisFrame;
        this.score += Math.floor(distanceThisFrame * this.scoreMultiplier);

        if (this.onScoreUpdate) {
            this.onScoreUpdate(this.score, Math.floor(this.distance));
        }

        // Update power-up timers
        this.updatePowerups(effectiveDelta);

        // Update nitro
        if (this.isNitroActive && this.nitroAmount > 0) {
            this.nitroAmount = Math.max(0, this.nitroAmount - 30 * effectiveDelta);
            if (this.nitroAmount <= 0) {
                this.deactivateNitro();
            }
        }

        if (this.onNitroUpdate) {
            this.onNitroUpdate(this.nitroAmount, this.maxNitro);
        }
    }

    updateDifficulty() {
        const progress = Math.min(this.gameTime / DIFFICULTY.difficultyRampTime, 1);

        // Increase speed over time
        const speedRange = DIFFICULTY.maxSpeed - DIFFICULTY.initialSpeed;
        const targetSpeed = DIFFICULTY.initialSpeed + speedRange * progress;

        // Apply nitro boost
        const nitroMultiplier = this.isNitroActive ? this.nitroBoostMultiplier : 1;
        this.speed = targetSpeed * nitroMultiplier;

        if (this.onSpeedUpdate) {
            this.onSpeedUpdate(this.speed);
        }
    }

    updatePowerups(deltaTime) {
        // Shield timer
        if (this.hasShield) {
            this.shieldTimer -= deltaTime * 1000;
            if (this.shieldTimer <= 0) {
                this.hasShield = false;
                if (this.onPowerupChange) {
                    this.onPowerupChange('shield', false);
                }
            }
        }

        // Slow-mo timer
        if (this.isSlowMo) {
            this.slowMoTimer -= deltaTime * 1000;
            if (this.slowMoTimer <= 0) {
                this.isSlowMo = false;
                if (this.onPowerupChange) {
                    this.onPowerupChange('slowmo', false);
                }
            }
        }

        // Multiplier timer
        if (this.scoreMultiplier > 1) {
            this.multiplierTimer -= deltaTime * 1000;
            if (this.multiplierTimer <= 0) {
                this.scoreMultiplier = 1;
                if (this.onPowerupChange) {
                    this.onPowerupChange('multiplier', false);
                }
            }
        }
    }

    getSpawnInterval() {
        const progress = Math.min(this.gameTime / DIFFICULTY.difficultyRampTime, 1);
        const intervalRange = DIFFICULTY.initialSpawnInterval - DIFFICULTY.minSpawnInterval;
        return DIFFICULTY.initialSpawnInterval - intervalRange * progress;
    }

    shouldSpawnObstacle() {
        const interval = this.getSpawnInterval();
        if (this.gameTime - this.lastSpawnTime >= interval) {
            this.lastSpawnTime = this.gameTime;
            return true;
        }
        return false;
    }

    moveLeft() {
        if (this.state !== GAME_STATES.PLAYING) return;
        if (this.targetLane > LANES.LEFT) {
            this.targetLane--;
        }
    }

    moveRight() {
        if (this.state !== GAME_STATES.PLAYING) return;
        if (this.targetLane < LANES.RIGHT) {
            this.targetLane++;
        }
    }

    activateNitro() {
        if (this.state !== GAME_STATES.PLAYING) return;
        if (this.nitroAmount >= 30 && !this.isNitroActive) {
            this.isNitroActive = true;
        }
    }

    deactivateNitro() {
        this.isNitroActive = false;
    }

    addNitro(amount) {
        this.nitroAmount = Math.min(this.maxNitro, this.nitroAmount + amount);
    }

    activateShield(duration = 5000) {
        this.hasShield = true;
        this.shieldTimer = duration;
        if (this.onPowerupChange) {
            this.onPowerupChange('shield', true);
        }
    }

    activateSlowMo(duration = 3000) {
        this.isSlowMo = true;
        this.slowMoTimer = duration;
        if (this.onPowerupChange) {
            this.onPowerupChange('slowmo', true);
        }
    }

    activateMultiplier(duration = 10000) {
        this.scoreMultiplier = 2;
        this.multiplierTimer = duration;
        if (this.onPowerupChange) {
            this.onPowerupChange('multiplier', true);
        }
    }

    handleCollision() {
        if (this.hasShield) {
            this.hasShield = false;
            this.shieldTimer = 0;
            if (this.onPowerupChange) {
                this.onPowerupChange('shield', false);
            }
            return false; // Collision absorbed by shield
        }

        // Game over
        this.setState(GAME_STATES.GAME_OVER);
        if (this.onGameOver) {
            this.onGameOver(this.score, Math.floor(this.distance));
        }
        return true;
    }

    getLanePosition(lane) {
        return lane * LANE_WIDTH;
    }

    reset() {
        this.state = GAME_STATES.MENU;
        this.score = 0;
        this.distance = 0;
        this.speed = DIFFICULTY.initialSpeed;
        this.currentLane = LANES.CENTER;
        this.targetLane = LANES.CENTER;
        this.selectedCar = null;
        this.isNitroActive = false;
        this.nitroAmount = 0;
        this.hasShield = false;
        this.isSlowMo = false;
        this.scoreMultiplier = 1;
        this.gameTime = 0;
    }
}

// Export singleton instance
export const game = new Game();
export default Game;
