// Collision detection system

import { LANE_WIDTH } from './game.js';

// Player bounding box (relative to lane center)
const PLAYER_BOUNDS = {
    width: 2.0,
    height: 1.5,
    depth: 4.0,
    zOffset: 0 // Player is at z=0
};

// Obstacle bounding boxes by type
const OBSTACLE_BOUNDS = {
    stop_sign: { width: 0.8, height: 3.0, depth: 0.8 },
    cone: { width: 0.6, height: 1.0, depth: 0.6 },
    car: { width: 2.0, height: 1.5, depth: 4.5 },
    barrier: { width: 3.0, height: 1.0, depth: 0.5 },
    truck: { width: 2.5, height: 2.5, depth: 8.0 }
};

/**
 * Check if two axis-aligned bounding boxes intersect
 */
export function boxIntersects(box1, box2) {
    return (
        box1.minX <= box2.maxX && box1.maxX >= box2.minX &&
        box1.minY <= box2.maxY && box1.maxY >= box2.minY &&
        box1.minZ <= box2.maxZ && box1.maxZ >= box2.minZ
    );
}

/**
 * Get player bounding box at given lane position
 */
export function getPlayerBounds(lane) {
    const centerX = lane * LANE_WIDTH;
    return {
        minX: centerX - PLAYER_BOUNDS.width / 2,
        maxX: centerX + PLAYER_BOUNDS.width / 2,
        minY: 0,
        maxY: PLAYER_BOUNDS.height,
        minZ: PLAYER_BOUNDS.zOffset - PLAYER_BOUNDS.depth / 2,
        maxZ: PLAYER_BOUNDS.zOffset + PLAYER_BOUNDS.depth / 2
    };
}

/**
 * Get obstacle bounding box at given position
 */
export function getObstacleBounds(obstacle) {
    const bounds = OBSTACLE_BOUNDS[obstacle.type] || OBSTACLE_BOUNDS.cone;
    const centerX = obstacle.lane * LANE_WIDTH;

    return {
        minX: centerX - bounds.width / 2,
        maxX: centerX + bounds.width / 2,
        minY: 0,
        maxY: bounds.height,
        minZ: obstacle.z - bounds.depth / 2,
        maxZ: obstacle.z + bounds.depth / 2
    };
}

/**
 * Simple lane-based collision check (faster)
 * Returns true if obstacle is in collision range
 */
export function checkLaneCollision(playerLane, obstacle, collisionThreshold = 3.0) {
    // Check if in same lane
    if (Math.abs(playerLane - obstacle.lane) > 0.3) {
        return false;
    }

    // Check if obstacle is within collision z-range
    // Player is at z=0, obstacles approach from positive z
    const obstacleZ = obstacle.z;
    return obstacleZ <= collisionThreshold && obstacleZ >= -PLAYER_BOUNDS.depth;
}

/**
 * Precise AABB collision check
 */
export function checkPreciseCollision(playerLane, obstacle) {
    const playerBox = getPlayerBounds(playerLane);
    const obstacleBox = getObstacleBounds(obstacle);
    return boxIntersects(playerBox, obstacleBox);
}

/**
 * Check collision with powerup (larger hitbox for easier collection)
 */
export function checkPowerupCollision(playerLane, powerup, collectionRadius = 2.0) {
    // Lane check with some tolerance
    if (Math.abs(playerLane - powerup.lane) > 0.5) {
        return false;
    }

    // Z-range check
    return powerup.z <= collectionRadius && powerup.z >= -collectionRadius;
}

/**
 * Check collision with nitro zone (lane-based)
 */
export function checkNitroZoneCollision(playerLane, nitroZone) {
    // Must be in the correct lane
    if (playerLane !== nitroZone.lane) {
        return false;
    }

    // Check if player is within the nitro zone z-range
    return nitroZone.startZ <= 0 && nitroZone.endZ >= 0;
}

/**
 * Get collision info for debugging/effects
 */
export function getCollisionInfo(playerLane, obstacle) {
    const playerBox = getPlayerBounds(playerLane);
    const obstacleBox = getObstacleBounds(obstacle);

    return {
        playerBox,
        obstacleBox,
        colliding: boxIntersects(playerBox, obstacleBox),
        obstacleType: obstacle.type,
        impactPoint: {
            x: (Math.max(playerBox.minX, obstacleBox.minX) + Math.min(playerBox.maxX, obstacleBox.maxX)) / 2,
            y: PLAYER_BOUNDS.height / 2,
            z: 0
        }
    };
}

export { PLAYER_BOUNDS, OBSTACLE_BOUNDS };

export default {
    boxIntersects,
    getPlayerBounds,
    getObstacleBounds,
    checkLaneCollision,
    checkPreciseCollision,
    checkPowerupCollision,
    checkNitroZoneCollision,
    getCollisionInfo,
    PLAYER_BOUNDS,
    OBSTACLE_BOUNDS
};
