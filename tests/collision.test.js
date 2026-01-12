// Collision detection tests
import { describe, it, expect } from '@jest/globals';
import {
    boxIntersects,
    getPlayerBounds,
    getObstacleBounds,
    checkLaneCollision,
    checkPreciseCollision,
    checkPowerupCollision,
    checkNitroZoneCollision,
    PLAYER_BOUNDS,
    OBSTACLE_BOUNDS
} from '../src/js/collision.js';

describe('Collision Detection', () => {
    describe('boxIntersects', () => {
        it('should detect overlapping boxes', () => {
            const box1 = { minX: 0, maxX: 2, minY: 0, maxY: 2, minZ: 0, maxZ: 2 };
            const box2 = { minX: 1, maxX: 3, minY: 1, maxY: 3, minZ: 1, maxZ: 3 };

            expect(boxIntersects(box1, box2)).toBe(true);
        });

        it('should not detect non-overlapping boxes', () => {
            const box1 = { minX: 0, maxX: 1, minY: 0, maxY: 1, minZ: 0, maxZ: 1 };
            const box2 = { minX: 5, maxX: 6, minY: 5, maxY: 6, minZ: 5, maxZ: 6 };

            expect(boxIntersects(box1, box2)).toBe(false);
        });

        it('should detect touching boxes as intersecting', () => {
            const box1 = { minX: 0, maxX: 1, minY: 0, maxY: 1, minZ: 0, maxZ: 1 };
            const box2 = { minX: 1, maxX: 2, minY: 0, maxY: 1, minZ: 0, maxZ: 1 };

            expect(boxIntersects(box1, box2)).toBe(true);
        });

        it('should detect box inside another', () => {
            const box1 = { minX: 0, maxX: 10, minY: 0, maxY: 10, minZ: 0, maxZ: 10 };
            const box2 = { minX: 2, maxX: 4, minY: 2, maxY: 4, minZ: 2, maxZ: 4 };

            expect(boxIntersects(box1, box2)).toBe(true);
        });

        it('should not detect boxes separated in X', () => {
            const box1 = { minX: 0, maxX: 1, minY: 0, maxY: 1, minZ: 0, maxZ: 1 };
            const box2 = { minX: 2, maxX: 3, minY: 0, maxY: 1, minZ: 0, maxZ: 1 };

            expect(boxIntersects(box1, box2)).toBe(false);
        });

        it('should not detect boxes separated in Y', () => {
            const box1 = { minX: 0, maxX: 1, minY: 0, maxY: 1, minZ: 0, maxZ: 1 };
            const box2 = { minX: 0, maxX: 1, minY: 5, maxY: 6, minZ: 0, maxZ: 1 };

            expect(boxIntersects(box1, box2)).toBe(false);
        });

        it('should not detect boxes separated in Z', () => {
            const box1 = { minX: 0, maxX: 1, minY: 0, maxY: 1, minZ: 0, maxZ: 1 };
            const box2 = { minX: 0, maxX: 1, minY: 0, maxY: 1, minZ: 5, maxZ: 6 };

            expect(boxIntersects(box1, box2)).toBe(false);
        });
    });

    describe('getPlayerBounds', () => {
        it('should return bounds centered on lane', () => {
            const bounds = getPlayerBounds(0);

            expect(bounds.minX).toBe(-PLAYER_BOUNDS.width / 2);
            expect(bounds.maxX).toBe(PLAYER_BOUNDS.width / 2);
            expect(bounds.minY).toBe(0);
            expect(bounds.maxY).toBe(PLAYER_BOUNDS.height);
        });

        it('should offset bounds for left lane', () => {
            const bounds = getPlayerBounds(-1);
            const laneWidth = 4;

            expect(bounds.minX).toBe(-laneWidth - PLAYER_BOUNDS.width / 2);
            expect(bounds.maxX).toBe(-laneWidth + PLAYER_BOUNDS.width / 2);
        });

        it('should offset bounds for right lane', () => {
            const bounds = getPlayerBounds(1);
            const laneWidth = 4;

            expect(bounds.minX).toBe(laneWidth - PLAYER_BOUNDS.width / 2);
            expect(bounds.maxX).toBe(laneWidth + PLAYER_BOUNDS.width / 2);
        });
    });

    describe('getObstacleBounds', () => {
        it('should return bounds for car obstacle', () => {
            const obstacle = { type: 'car', lane: 0, z: 10 };
            const bounds = getObstacleBounds(obstacle);
            const carBounds = OBSTACLE_BOUNDS.car;

            expect(bounds.minX).toBe(-carBounds.width / 2);
            expect(bounds.maxX).toBe(carBounds.width / 2);
            expect(bounds.minZ).toBe(10 - carBounds.depth / 2);
            expect(bounds.maxZ).toBe(10 + carBounds.depth / 2);
        });

        it('should return bounds for stop_sign obstacle', () => {
            const obstacle = { type: 'stop_sign', lane: 1, z: 20 };
            const bounds = getObstacleBounds(obstacle);
            const signBounds = OBSTACLE_BOUNDS.stop_sign;
            const laneWidth = 4;

            expect(bounds.minX).toBe(laneWidth - signBounds.width / 2);
            expect(bounds.maxX).toBe(laneWidth + signBounds.width / 2);
        });

        it('should use cone bounds for unknown type', () => {
            const obstacle = { type: 'unknown', lane: 0, z: 0 };
            const bounds = getObstacleBounds(obstacle);

            expect(bounds.maxX - bounds.minX).toBe(OBSTACLE_BOUNDS.cone.width);
        });
    });

    describe('checkLaneCollision', () => {
        it('should detect collision in same lane', () => {
            const obstacle = { lane: 0, z: 1 };
            expect(checkLaneCollision(0, obstacle)).toBe(true);
        });

        it('should not detect collision in different lane', () => {
            const obstacle = { lane: 1, z: 1 };
            expect(checkLaneCollision(-1, obstacle)).toBe(false);
        });

        it('should not detect collision when obstacle is too far', () => {
            const obstacle = { lane: 0, z: 100 };
            expect(checkLaneCollision(0, obstacle)).toBe(false);
        });

        it('should not detect collision when obstacle has passed', () => {
            const obstacle = { lane: 0, z: -10 };
            expect(checkLaneCollision(0, obstacle)).toBe(false);
        });

        it('should detect collision near threshold', () => {
            const obstacle = { lane: 0, z: 2.5 };
            expect(checkLaneCollision(0, obstacle, 3)).toBe(true);
        });

        it('should handle fractional lane positions', () => {
            const obstacle = { lane: 0, z: 1 };
            expect(checkLaneCollision(0.2, obstacle)).toBe(true);
            expect(checkLaneCollision(0.5, obstacle)).toBe(false);
        });
    });

    describe('checkPreciseCollision', () => {
        it('should detect collision when boxes overlap', () => {
            const obstacle = { type: 'car', lane: 0, z: 0 };
            expect(checkPreciseCollision(0, obstacle)).toBe(true);
        });

        it('should not detect collision when boxes do not overlap', () => {
            const obstacle = { type: 'car', lane: 1, z: 0 };
            expect(checkPreciseCollision(-1, obstacle)).toBe(false);
        });

        it('should detect collision with cone', () => {
            const obstacle = { type: 'cone', lane: 0, z: 0 };
            expect(checkPreciseCollision(0, obstacle)).toBe(true);
        });
    });

    describe('checkPowerupCollision', () => {
        it('should detect powerup in collection range', () => {
            const powerup = { lane: 0, z: 0 };
            expect(checkPowerupCollision(0, powerup)).toBe(true);
        });

        it('should not detect powerup in different lane', () => {
            const powerup = { lane: 1, z: 0 };
            expect(checkPowerupCollision(-1, powerup)).toBe(false);
        });

        it('should detect powerup within tolerance', () => {
            const powerup = { lane: 0, z: 1.5 };
            expect(checkPowerupCollision(0, powerup, 2)).toBe(true);
        });

        it('should not detect powerup outside range', () => {
            const powerup = { lane: 0, z: 10 };
            expect(checkPowerupCollision(0, powerup, 2)).toBe(false);
        });
    });

    describe('checkNitroZoneCollision', () => {
        it('should detect when player is in nitro zone', () => {
            const zone = { lane: 0, startZ: -10, endZ: 10 };
            expect(checkNitroZoneCollision(0, zone)).toBe(true);
        });

        it('should not detect when player is in different lane', () => {
            const zone = { lane: 1, startZ: -10, endZ: 10 };
            expect(checkNitroZoneCollision(0, zone)).toBe(false);
        });

        it('should not detect when zone is ahead of player', () => {
            const zone = { lane: 0, startZ: 5, endZ: 15 };
            expect(checkNitroZoneCollision(0, zone)).toBe(false);
        });

        it('should not detect when zone has passed player', () => {
            const zone = { lane: 0, startZ: -20, endZ: -5 };
            expect(checkNitroZoneCollision(0, zone)).toBe(false);
        });
    });
});
