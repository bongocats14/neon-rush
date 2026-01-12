// UI and menu management

import { GAME_STATES } from './game.js';
import { CARS } from './cars.js';
import { highScoreManager } from './highscore.js';

class UIManager {
    constructor() {
        // Cache DOM elements
        this.elements = {
            // Menus
            mainMenu: document.getElementById('main-menu'),
            carSelect: document.getElementById('car-select'),
            gameOver: document.getElementById('game-over'),

            // HUD
            hud: document.getElementById('hud'),
            carName: document.getElementById('car-name'),
            speed: document.getElementById('speed'),
            score: document.getElementById('score'),
            nitroFill: document.getElementById('nitro-fill'),

            // Power-up indicators
            powerupIndicators: document.getElementById('powerup-indicators'),
            shieldIndicator: document.getElementById('shield-indicator'),
            slowmoIndicator: document.getElementById('slowmo-indicator'),
            multiplierIndicator: document.getElementById('multiplier-indicator'),

            // Menu elements
            startBtn: document.getElementById('start-btn'),
            restartBtn: document.getElementById('restart-btn'),
            menuBtn: document.getElementById('menu-btn'),
            menuHighScore: document.getElementById('menu-high-score'),

            // Game over elements
            distanceValue: document.getElementById('distance-value'),
            highScoreValue: document.getElementById('high-score-value'),
            newRecord: document.getElementById('new-record'),

            // Car cards
            carCards: document.querySelectorAll('.car-card')
        };

        this.selectedCar = null;
        this.callbacks = {};
    }

    /**
     * Initialize UI with callbacks
     */
    init(callbacks) {
        this.callbacks = callbacks;
        this.setupEventListeners();
        this.updateHighScoreDisplay();
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Start button
        this.elements.startBtn?.addEventListener('click', () => {
            this.callbacks.onStart?.();
        });

        // Restart button
        this.elements.restartBtn?.addEventListener('click', () => {
            this.callbacks.onRestart?.();
        });

        // Menu button
        this.elements.menuBtn?.addEventListener('click', () => {
            this.callbacks.onMenu?.();
        });

        // Car selection
        this.elements.carCards.forEach(card => {
            card.addEventListener('click', () => {
                const carId = card.dataset.car;
                this.selectCar(carId);
                this.callbacks.onCarSelect?.(carId);
            });
        });

        // Keyboard shortcuts for car selection
        document.addEventListener('keydown', (e) => {
            if (this.isCarSelectVisible()) {
                if (e.key === '1') this.selectCarAndStart('bmw');
                if (e.key === '2') this.selectCarAndStart('supra');
                if (e.key === '3') this.selectCarAndStart('corvette');
            }
        });
    }

    /**
     * Check if car select screen is visible
     */
    isCarSelectVisible() {
        return !this.elements.carSelect.classList.contains('hidden');
    }

    /**
     * Select a car and trigger callback
     */
    selectCar(carId) {
        // Update UI
        this.elements.carCards.forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.car === carId) {
                card.classList.add('selected');
            }
        });
        this.selectedCar = carId;
    }

    /**
     * Select car and start game
     */
    selectCarAndStart(carId) {
        this.selectCar(carId);
        this.callbacks.onCarSelect?.(carId);
    }

    /**
     * Show a specific screen
     */
    showScreen(state) {
        // Hide all menus
        this.elements.mainMenu?.classList.add('hidden');
        this.elements.carSelect?.classList.add('hidden');
        this.elements.gameOver?.classList.add('hidden');
        this.elements.hud?.classList.add('hidden');
        this.elements.powerupIndicators?.classList.add('hidden');

        switch (state) {
            case GAME_STATES.MENU:
                this.elements.mainMenu?.classList.remove('hidden');
                this.updateHighScoreDisplay();
                break;

            case GAME_STATES.CAR_SELECT:
                this.elements.carSelect?.classList.remove('hidden');
                break;

            case GAME_STATES.PLAYING:
                this.elements.hud?.classList.remove('hidden');
                this.elements.powerupIndicators?.classList.remove('hidden');
                break;

            case GAME_STATES.GAME_OVER:
                this.elements.gameOver?.classList.remove('hidden');
                break;
        }
    }

    /**
     * Update HUD with game data
     */
    updateHUD(data) {
        if (data.carName !== undefined && this.elements.carName) {
            this.elements.carName.textContent = data.carName;
        }

        if (data.speed !== undefined && this.elements.speed) {
            this.elements.speed.innerHTML = `${Math.floor(data.speed)} <span>MPH</span>`;
        }

        if (data.score !== undefined && this.elements.score) {
            this.elements.score.textContent = Math.floor(data.score).toLocaleString();
        }

        if (data.nitro !== undefined && this.elements.nitroFill) {
            const percent = (data.nitro / data.maxNitro) * 100;
            this.elements.nitroFill.style.width = `${percent}%`;
        }
    }

    /**
     * Update power-up indicator visibility
     */
    updatePowerupIndicator(type, active) {
        let element = null;

        switch (type) {
            case 'shield':
                element = this.elements.shieldIndicator;
                break;
            case 'slowmo':
                element = this.elements.slowmoIndicator;
                break;
            case 'multiplier':
                element = this.elements.multiplierIndicator;
                break;
        }

        if (element) {
            if (active) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }
    }

    /**
     * Show game over screen with results
     */
    showGameOver(distance, carId) {
        const result = highScoreManager.submitScore(distance, carId);

        if (this.elements.distanceValue) {
            this.elements.distanceValue.textContent = Math.floor(distance).toLocaleString();
        }

        if (this.elements.highScoreValue) {
            this.elements.highScoreValue.textContent = highScoreManager.getGlobalHighScore().toLocaleString();
        }

        if (this.elements.newRecord) {
            if (result.isNewGlobalRecord) {
                this.elements.newRecord.classList.remove('hidden');
            } else {
                this.elements.newRecord.classList.add('hidden');
            }
        }

        this.showScreen(GAME_STATES.GAME_OVER);
    }

    /**
     * Update high score display on main menu
     */
    updateHighScoreDisplay() {
        if (this.elements.menuHighScore) {
            this.elements.menuHighScore.textContent = highScoreManager.getGlobalHighScore().toLocaleString();
        }
    }

    /**
     * Add screen shake class to container
     */
    triggerScreenShake() {
        const container = document.getElementById('game-container');
        if (container) {
            container.classList.add('screen-shake');
            setTimeout(() => {
                container.classList.remove('screen-shake');
            }, 500);
        }
    }

    /**
     * Get selected car ID
     */
    getSelectedCar() {
        return this.selectedCar;
    }

    /**
     * Reset UI state
     */
    reset() {
        this.selectedCar = null;
        this.elements.carCards.forEach(card => card.classList.remove('selected'));

        // Hide all powerup indicators
        this.elements.shieldIndicator?.classList.add('hidden');
        this.elements.slowmoIndicator?.classList.add('hidden');
        this.elements.multiplierIndicator?.classList.add('hidden');
    }
}

// Export singleton
export const uiManager = new UIManager();
export default UIManager;
