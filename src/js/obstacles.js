// Obstacle generation and management

import { LANES, LANE_WIDTH } from './game.js';

export const OBSTACLE_TYPES = {
    STOP_SIGN: 'stop_sign',
    CONE: 'cone',
    CAR: 'car',
    BARRIER: 'barrier',
    TRUCK: 'truck'
};

// Spawn weights (higher = more common)
const SPAWN_WEIGHTS = {
    [OBSTACLE_TYPES.CONE]: 30,
    [OBSTACLE_TYPES.STOP_SIGN]: 25,
    [OBSTACLE_TYPES.CAR]: 30,
    [OBSTACLE_TYPES.BARRIER]: 10,
    [OBSTACLE_TYPES.TRUCK]: 5
};

// Minimum z-distance between obstacles in same lane
const MIN_OBSTACLE_SPACING = 15;

// How far ahead to spawn obstacles
const SPAWN_DISTANCE = 200;

// How far behind to remove obstacles
const DESPAWN_DISTANCE = -20;

class ObstacleManager {
    constructor() {
        this.obstacles = [];
        this.pool = [];
        this.maxPoolSize = 50;
        this.lastSpawnZ = {};

        // Initialize last spawn z for each lane
        Object.values(LANES).forEach(lane => {
            this.lastSpawnZ[lane] = SPAWN_DISTANCE;
        });
    }

    /**
     * Create a new obstacle
     */
    createObstacle(type, lane, z) {
        // Try to get from pool
        let obstacle = this.pool.pop();

        if (obstacle) {
            obstacle.type = type;
            obstacle.lane = lane;
            obstacle.z = z;
            obstacle.active = true;
            obstacle.mesh = null; // Will be set by renderer
        } else {
            obstacle = {
                id: Math.random().toString(36).substr(2, 9),
                type,
                lane,
                z,
                active: true,
                mesh: null
            };
        }

        return obstacle;
    }

    /**
     * Return obstacle to pool
     */
    returnToPool(obstacle) {
        obstacle.active = false;
        if (this.pool.length < this.maxPoolSize) {
            this.pool.push(obstacle);
        }
    }

    /**
     * Get random obstacle type based on weights
     */
    getRandomType() {
        const totalWeight = Object.values(SPAWN_WEIGHTS).reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;

        for (const [type, weight] of Object.entries(SPAWN_WEIGHTS)) {
            random -= weight;
            if (random <= 0) {
                return type;
            }
        }

        return OBSTACLE_TYPES.CONE;
    }

    /**
     * Get random lane
     */
    getRandomLane() {
        const lanes = [LANES.LEFT, LANES.CENTER, LANES.RIGHT];
        return lanes[Math.floor(Math.random() * lanes.length)];
    }

    /**
     * Spawn a new obstacle
     */
    spawn(gameTime, difficulty = 1) {
        const lane = this.getRandomLane();
        const type = this.getRandomType();

        // Ensure minimum spacing in the same lane
        const minZ = this.lastSpawnZ[lane] + MIN_OBSTACLE_SPACING / difficulty;
        const z = Math.max(SPAWN_DISTANCE, minZ + Math.random() * 20);

        const obstacle = this.createObstacle(type, lane, z);
        this.obstacles.push(obstacle);
        this.lastSpawnZ[lane] = z;

        return obstacle;
    }

    /**
     * Spawn multiple obstacles (for harder difficulty)
     */
    spawnMultiple(count, gameTime, difficulty = 1) {
        const spawned = [];
        const usedLanes = new Set();

        for (let i = 0; i < count; i++) {
            // Avoid spawning multiple obstacles in same lane at same z
            let lane = this.getRandomLane();
            let attempts = 0;
            while (usedLanes.has(lane) && attempts < 3) {
                lane = this.getRandomLane();
                attempts++;
            }

            if (!usedLanes.has(lane)) {
                const type = this.getRandomType();
                const z = SPAWN_DISTANCE + Math.random() * 10;
                const obstacle = this.createObstacle(type, lane, z);
                this.obstacles.push(obstacle);
                spawned.push(obstacle);
                usedLanes.add(lane);
                this.lastSpawnZ[lane] = z;
            }
        }

        return spawned;
    }

    /**
     * Update all obstacles
     */
    update(deltaTime, speed) {
        const moveDistance = speed * deltaTime;
        const removed = [];

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];

            // Move obstacle toward player
            obstacle.z -= moveDistance;

            // Remove if past player
            if (obstacle.z < DESPAWN_DISTANCE) {
                removed.push(obstacle);
                this.obstacles.splice(i, 1);
                this.returnToPool(obstacle);
            }
        }

        return removed;
    }

    /**
     * Get all active obstacles
     */
    getActive() {
        return this.obstacles.filter(o => o.active);
    }

    /**
     * Get obstacles in collision range
     */
    getInRange(minZ, maxZ) {
        return this.obstacles.filter(o => o.z >= minZ && o.z <= maxZ);
    }

    /**
     * Clear all obstacles
     */
    clear() {
        this.obstacles.forEach(o => this.returnToPool(o));
        this.obstacles = [];

        // Reset spawn tracking
        Object.values(LANES).forEach(lane => {
            this.lastSpawnZ[lane] = SPAWN_DISTANCE;
        });
    }

    /**
     * Remove specific obstacle
     */
    remove(obstacle) {
        const index = this.obstacles.indexOf(obstacle);
        if (index !== -1) {
            this.obstacles.splice(index, 1);
            this.returnToPool(obstacle);
        }
    }

    /**
     * Get count of active obstacles
     */
    getCount() {
        return this.obstacles.length;
    }
}

// Export singleton and class
export const obstacleManager = new ObstacleManager();
export default ObstacleManager;
