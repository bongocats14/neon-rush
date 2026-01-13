// Main game entry point

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { game, GAME_STATES, LANE_WIDTH } from './game.js';
import { CARS, getCarById } from './cars.js';
import { obstacleManager, OBSTACLE_TYPES } from './obstacles.js';
import { powerupManager, POWERUP_TYPES } from './powerups.js';
import { checkLaneCollision, checkPowerupCollision } from './collision.js';
import { audioManager } from './audio.js';
import { highScoreManager } from './highscore.js';
import { uiManager } from './ui.js';
import RoadManager from './road.js';
import Player from './player.js';

// Three.js components
let scene, camera, renderer, composer;
let roadManager, player;
let clock;

// Game object meshes
const obstacleMeshes = new Map();
const powerupMeshes = new Map();
const nitroZoneMeshes = new Map();

// Colors
const NEON_COLORS = {
    cyan: 0x00ffff,
    magenta: 0xff00ff,
    orange: 0xff6600,
    purple: 0x8b00ff,
    red: 0xff0040,
    blue: 0x00bfff
};

/**
 * Initialize Three.js scene
 */
function initThree() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1.5, 0);
    camera.lookAt(0, 1, 100); // Look toward positive z where obstacles spawn

    // Renderer
    const canvas = document.getElementById('game-canvas');
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Post-processing for bloom/glow effect
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.8,  // strength
        0.4,  // radius
        0.85  // threshold
    );
    composer.addPass(bloomPass);

    // Clock for delta time
    clock = new THREE.Clock();

    // Handle resize
    window.addEventListener('resize', onWindowResize);
}

/**
 * Handle window resize
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Initialize game systems
 */
function initGame() {
    // Create road
    roadManager = new RoadManager(scene);
    roadManager.create();

    // Create player
    player = new Player(scene, camera);

    // Initialize UI
    uiManager.init({
        onStart: () => {
            audioManager.init();
            audioManager.playMenuSelect();
            game.setState(GAME_STATES.CAR_SELECT);
            uiManager.showScreen(GAME_STATES.CAR_SELECT);
        },
        onCarSelect: (carId) => {
            audioManager.playMenuSelect();
            game.selectCar(carId);
            startGame(carId);
        },
        onRestart: () => {
            audioManager.playMenuSelect();
            game.setState(GAME_STATES.CAR_SELECT);
            uiManager.showScreen(GAME_STATES.CAR_SELECT);
        },
        onMenu: () => {
            audioManager.playMenuSelect();
            audioManager.stopEngine();
            game.setState(GAME_STATES.MENU);
            uiManager.showScreen(GAME_STATES.MENU);
            clearGameObjects();
        }
    });

    // Show main menu
    uiManager.showScreen(GAME_STATES.MENU);

    // Setup input handlers
    setupInput();

    // Setup game callbacks
    setupGameCallbacks();
}

/**
 * Setup keyboard input
 */
function setupInput() {
    document.addEventListener('keydown', (e) => {
        if (game.state !== GAME_STATES.PLAYING) return;

        switch (e.key.toLowerCase()) {
            case 'a':
            case 'arrowleft':
                game.moveLeft();
                audioManager.playLaneSwitch();
                break;
            case 'd':
            case 'arrowright':
                game.moveRight();
                audioManager.playLaneSwitch();
                break;
            case 'w':
            case 'arrowup':
            case 'shift':
                if (!game.isNitroActive && game.nitroAmount >= 30) {
                    game.activateNitro();
                    audioManager.playNitroActivate();
                }
                break;
            case ' ':
                // Space to restart when game over
                if (game.state === GAME_STATES.GAME_OVER) {
                    game.setState(GAME_STATES.CAR_SELECT);
                    uiManager.showScreen(GAME_STATES.CAR_SELECT);
                }
                break;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key.toLowerCase() === 'shift' || e.key.toLowerCase() === 'w' || e.key === 'ArrowUp') {
            game.deactivateNitro();
        }
    });
}

/**
 * Setup game state callbacks
 */
function setupGameCallbacks() {
    game.onScoreUpdate = (score, distance) => {
        uiManager.updateHUD({ score: distance });
    };

    game.onSpeedUpdate = (speed) => {
        uiManager.updateHUD({ speed });
        audioManager.updateEngine(speed, game.isNitroActive);
    };

    game.onNitroUpdate = (nitro, maxNitro) => {
        const car = getCarById(game.selectedCar);
        uiManager.updateHUD({
            nitro,
            maxNitro: car?.maxNitro || maxNitro
        });
    };

    game.onPowerupChange = (type, active) => {
        uiManager.updatePowerupIndicator(type, active);
        if (active) {
            audioManager.playPowerupCollect(type);
        }
    };

    game.onGameOver = (score, distance) => {
        audioManager.playCollision();
        audioManager.playGameOver();
        audioManager.stopEngine();
        player.shake(2);
        uiManager.triggerScreenShake();
        uiManager.showGameOver(distance, game.selectedCar);
    };
}

/**
 * Start the game with selected car
 */
function startGame(carId) {
    const car = getCarById(carId);
    if (!car) return;

    // Clear any existing game objects
    clearGameObjects();

    // Initialize player with car
    player.init(carId);

    // Apply car stats to game
    game.maxNitro = car.maxNitro;
    game.nitroBoostMultiplier = 1 + (car.topSpeed / 200);

    // Start game
    game.startGame();
    uiManager.showScreen(GAME_STATES.PLAYING);
    uiManager.updateHUD({
        carName: car.name,
        speed: 0,
        score: 0,
        nitro: 0,
        maxNitro: car.maxNitro
    });

    // Start engine sound
    audioManager.startEngine();
}

/**
 * Clear all game objects
 */
function clearGameObjects() {
    // Clear obstacles
    obstacleManager.clear();
    obstacleMeshes.forEach(mesh => {
        scene.remove(mesh);
        mesh.geometry?.dispose();
        mesh.material?.dispose();
    });
    obstacleMeshes.clear();

    // Clear powerups
    powerupManager.clear();
    powerupMeshes.forEach(mesh => {
        scene.remove(mesh);
        mesh.geometry?.dispose();
        mesh.material?.dispose();
    });
    powerupMeshes.clear();

    // Clear nitro zones
    nitroZoneMeshes.forEach(mesh => {
        scene.remove(mesh);
        mesh.geometry?.dispose();
        mesh.material?.dispose();
    });
    nitroZoneMeshes.clear();

    // Reset player
    player.reset();
}

/**
 * Create mesh for obstacle
 */
function createObstacleMesh(obstacle) {
    let geometry, material, mesh;

    const glowColor = NEON_COLORS.cyan;

    switch (obstacle.type) {
        case OBSTACLE_TYPES.STOP_SIGN:
            geometry = new THREE.CylinderGeometry(0.05, 0.05, 2.5, 8);
            material = new THREE.MeshBasicMaterial({ color: 0x333333 });
            mesh = new THREE.Mesh(geometry, material);

            // Sign on top
            const signGeom = new THREE.BoxGeometry(0.8, 0.8, 0.1);
            const signMat = new THREE.MeshBasicMaterial({ color: NEON_COLORS.red });
            const sign = new THREE.Mesh(signGeom, signMat);
            sign.position.y = 1.5;
            mesh.add(sign);
            break;

        case OBSTACLE_TYPES.CONE:
            geometry = new THREE.ConeGeometry(0.3, 0.8, 8);
            material = new THREE.MeshBasicMaterial({ color: NEON_COLORS.orange });
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.y = 0.4;
            break;

        case OBSTACLE_TYPES.CAR:
            geometry = new THREE.BoxGeometry(2, 1.2, 4);
            material = new THREE.MeshBasicMaterial({
                color: NEON_COLORS.purple,
                transparent: true,
                opacity: 0.8
            });
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.y = 0.6;

            // Add glow outline
            const glowGeom = new THREE.BoxGeometry(2.1, 1.3, 4.1);
            const glowMat = new THREE.MeshBasicMaterial({
                color: NEON_COLORS.purple,
                transparent: true,
                opacity: 0.3
            });
            const glow = new THREE.Mesh(glowGeom, glowMat);
            mesh.add(glow);
            break;

        case OBSTACLE_TYPES.BARRIER:
            geometry = new THREE.BoxGeometry(3, 0.8, 0.3);
            material = new THREE.MeshBasicMaterial({ color: NEON_COLORS.magenta });
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.y = 0.4;
            break;

        case OBSTACLE_TYPES.TRUCK:
            geometry = new THREE.BoxGeometry(2.5, 2.5, 8);
            material = new THREE.MeshBasicMaterial({
                color: NEON_COLORS.blue,
                transparent: true,
                opacity: 0.8
            });
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.y = 1.25;
            break;

        default:
            geometry = new THREE.BoxGeometry(1, 1, 1);
            material = new THREE.MeshBasicMaterial({ color: glowColor });
            mesh = new THREE.Mesh(geometry, material);
    }

    mesh.position.x = obstacle.lane * LANE_WIDTH;
    mesh.position.z = obstacle.z;

    return mesh;
}

/**
 * Create mesh for powerup
 */
function createPowerupMesh(powerup) {
    const config = powerup.config;
    const geometry = new THREE.OctahedronGeometry(0.5, 0);
    const material = new THREE.MeshBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: 0.9
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = powerup.lane * LANE_WIDTH;
    mesh.position.y = 1;
    mesh.position.z = powerup.z;

    // Add rotation animation data
    mesh.userData.rotationSpeed = 2;

    return mesh;
}

/**
 * Create mesh for nitro zone
 */
function createNitroZoneMesh(zone) {
    const length = zone.endZ - zone.startZ;
    const geometry = new THREE.PlaneGeometry(LANE_WIDTH * 0.8, length);
    const material = new THREE.MeshBasicMaterial({
        color: NEON_COLORS.orange,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.x = zone.lane * LANE_WIDTH;
    mesh.position.y = 0.02;
    mesh.position.z = zone.startZ + length / 2;

    return mesh;
}

/**
 * Main game loop
 */
function gameLoop() {
    requestAnimationFrame(gameLoop);

    const deltaTime = Math.min(clock.getDelta(), 0.1);

    if (game.state === GAME_STATES.PLAYING) {
        // Update game state
        game.update(deltaTime);

        // Update player
        player.update(deltaTime, game);

        // Update road
        roadManager.update(deltaTime, game.speed);

        // Spawn obstacles
        if (game.shouldSpawnObstacle()) {
            const difficulty = 1 + (game.gameTime / 60000);
            const count = Math.random() < 0.3 ? 2 : 1;
            const spawned = obstacleManager.spawnMultiple(count, game.gameTime, difficulty);

            spawned.forEach(obstacle => {
                const mesh = createObstacleMesh(obstacle);
                scene.add(mesh);
                obstacleMeshes.set(obstacle.id, mesh);
            });
        }

        // Spawn powerups occasionally
        if (Math.random() < 0.005) {
            const powerup = powerupManager.spawnPowerup(game.gameTime);
            if (powerup) {
                const mesh = createPowerupMesh(powerup);
                scene.add(mesh);
                powerupMeshes.set(powerup.id, mesh);
            }
        }

        // Spawn nitro zones
        if (Math.random() < 0.01) {
            const zone = powerupManager.trySpawnNitroZone(game.gameTime);
            if (zone) {
                const mesh = createNitroZoneMesh(zone);
                scene.add(mesh);
                nitroZoneMeshes.set(zone.id, mesh);
            }
        }

        // Update obstacles
        const removedObstacles = obstacleManager.update(deltaTime, game.speed);
        removedObstacles.forEach(obstacle => {
            const mesh = obstacleMeshes.get(obstacle.id);
            if (mesh) {
                scene.remove(mesh);
                mesh.geometry?.dispose();
                mesh.material?.dispose();
                obstacleMeshes.delete(obstacle.id);
            }
        });

        // Update obstacle mesh positions
        obstacleManager.getActive().forEach(obstacle => {
            const mesh = obstacleMeshes.get(obstacle.id);
            if (mesh) {
                mesh.position.z = obstacle.z;
            }
        });

        // Update powerups
        const { removedPowerups, removedNitroZones } = powerupManager.update(deltaTime, game.speed);

        removedPowerups.forEach(powerup => {
            const mesh = powerupMeshes.get(powerup.id);
            if (mesh) {
                scene.remove(mesh);
                mesh.geometry?.dispose();
                mesh.material?.dispose();
                powerupMeshes.delete(powerup.id);
            }
        });

        removedNitroZones.forEach(zone => {
            const mesh = nitroZoneMeshes.get(zone.id);
            if (mesh) {
                scene.remove(mesh);
                mesh.geometry?.dispose();
                mesh.material?.dispose();
                nitroZoneMeshes.delete(zone.id);
            }
        });

        // Update powerup mesh positions and animations
        powerupManager.getActivePowerups().forEach(powerup => {
            const mesh = powerupMeshes.get(powerup.id);
            if (mesh) {
                mesh.position.z = powerup.z;
                mesh.rotation.y += mesh.userData.rotationSpeed * deltaTime;
                mesh.rotation.x += mesh.userData.rotationSpeed * 0.5 * deltaTime;
            }
        });

        // Update nitro zone positions
        powerupManager.getActiveNitroZones().forEach(zone => {
            const mesh = nitroZoneMeshes.get(zone.id);
            if (mesh) {
                const length = zone.endZ - zone.startZ;
                mesh.position.z = zone.startZ + length / 2;
            }
        });

        // Check collisions
        const playerLane = player.getLanePosition();

        // Check obstacle collisions
        obstacleManager.getInRange(-5, 5).forEach(obstacle => {
            if (checkLaneCollision(playerLane, obstacle, 2)) {
                const wasGameOver = game.handleCollision();
                if (!wasGameOver) {
                    // Shield absorbed - remove obstacle
                    player.shake(0.5);
                }
            }
        });

        // Check powerup collisions
        powerupManager.getActivePowerups().forEach(powerup => {
            if (checkPowerupCollision(playerLane, powerup)) {
                powerupManager.collectPowerup(powerup, game);
                const mesh = powerupMeshes.get(powerup.id);
                if (mesh) {
                    scene.remove(mesh);
                    mesh.geometry?.dispose();
                    mesh.material?.dispose();
                    powerupMeshes.delete(powerup.id);
                }
            }
        });

        // Check nitro zones
        const inNitroZone = powerupManager.checkNitroZones(
            Math.round(playerLane),
            game,
            deltaTime
        );
        if (inNitroZone) {
            audioManager.playNitroCharge();
        }
    }

    // Render
    composer.render();
}

/**
 * Initialize and start
 */
function init() {
    initThree();
    initGame();
    gameLoop();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
