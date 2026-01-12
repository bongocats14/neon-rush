// Obstacle system tests
import { describe, it, expect, beforeEach } from '@jest/globals';
import ObstacleManager, { OBSTACLE_TYPES } from '../src/js/obstacles.js';
import { LANES } from '../src/js/game.js';

describe('ObstacleManager', () => {
    let manager;

    beforeEach(() => {
        manager = new ObstacleManager();
    });

    describe('initialization', () => {
        it('should start with no obstacles', () => {
            expect(manager.obstacles.length).toBe(0);
            expect(manager.getCount()).toBe(0);
        });

        it('should have empty pool', () => {
            expect(manager.pool.length).toBe(0);
        });
    });

    describe('createObstacle', () => {
        it('should create obstacle with correct properties', () => {
            const obstacle = manager.createObstacle(OBSTACLE_TYPES.CAR, LANES.CENTER, 100);

            expect(obstacle.type).toBe(OBSTACLE_TYPES.CAR);
            expect(obstacle.lane).toBe(LANES.CENTER);
            expect(obstacle.z).toBe(100);
            expect(obstacle.active).toBe(true);
            expect(obstacle.id).toBeDefined();
        });

        it('should create unique IDs', () => {
            const obs1 = manager.createObstacle(OBSTACLE_TYPES.CAR, 0, 100);
            const obs2 = manager.createObstacle(OBSTACLE_TYPES.CAR, 0, 100);

            expect(obs1.id).not.toBe(obs2.id);
        });

        it('should reuse obstacles from pool', () => {
            const original = manager.createObstacle(OBSTACLE_TYPES.CAR, 0, 100);
            manager.returnToPool(original);

            const reused = manager.createObstacle(OBSTACLE_TYPES.CONE, 1, 200);

            expect(reused.type).toBe(OBSTACLE_TYPES.CONE);
            expect(reused.lane).toBe(1);
            expect(reused.z).toBe(200);
        });
    });

    describe('spawn', () => {
        it('should spawn obstacle and add to list', () => {
            const obstacle = manager.spawn(0, 1);

            expect(manager.obstacles.length).toBe(1);
            expect(manager.obstacles[0]).toBe(obstacle);
        });

        it('should spawn at correct distance', () => {
            const obstacle = manager.spawn(0, 1);

            expect(obstacle.z).toBeGreaterThanOrEqual(200);
        });

        it('should spawn in valid lane', () => {
            const obstacle = manager.spawn(0, 1);

            expect([LANES.LEFT, LANES.CENTER, LANES.RIGHT]).toContain(obstacle.lane);
        });

        it('should spawn valid obstacle type', () => {
            const validTypes = Object.values(OBSTACLE_TYPES);
            const obstacle = manager.spawn(0, 1);

            expect(validTypes).toContain(obstacle.type);
        });
    });

    describe('spawnMultiple', () => {
        it('should spawn multiple obstacles', () => {
            const spawned = manager.spawnMultiple(2, 0, 1);

            expect(spawned.length).toBe(2);
            expect(manager.obstacles.length).toBe(2);
        });

        it('should try to spawn in different lanes', () => {
            const spawned = manager.spawnMultiple(3, 0, 1);

            // Should have obstacles in different lanes (high probability)
            const lanes = new Set(spawned.map(o => o.lane));
            expect(lanes.size).toBeGreaterThanOrEqual(1);
        });
    });

    describe('update', () => {
        it('should move obstacles toward player', () => {
            manager.spawn(0, 1);
            const initialZ = manager.obstacles[0].z;

            manager.update(0.1, 50); // 50 speed for 0.1 seconds

            expect(manager.obstacles[0].z).toBeLessThan(initialZ);
        });

        it('should remove obstacles past despawn distance', () => {
            const obstacle = manager.createObstacle(OBSTACLE_TYPES.CAR, 0, -25);
            manager.obstacles.push(obstacle);

            const removed = manager.update(0.1, 0);

            expect(removed.length).toBe(1);
            expect(manager.obstacles.length).toBe(0);
        });

        it('should return removed obstacles', () => {
            const obstacle = manager.createObstacle(OBSTACLE_TYPES.CAR, 0, -25);
            manager.obstacles.push(obstacle);

            const removed = manager.update(0.1, 0);

            expect(removed[0]).toBe(obstacle);
        });

        it('should add removed obstacles to pool', () => {
            const obstacle = manager.createObstacle(OBSTACLE_TYPES.CAR, 0, -25);
            manager.obstacles.push(obstacle);

            manager.update(0.1, 0);

            expect(manager.pool.length).toBe(1);
        });
    });

    describe('getActive', () => {
        it('should return only active obstacles', () => {
            manager.spawn(0, 1);
            manager.spawn(0, 1);
            manager.obstacles[0].active = false;

            const active = manager.getActive();

            expect(active.length).toBe(1);
        });
    });

    describe('getInRange', () => {
        it('should return obstacles within z range', () => {
            manager.obstacles.push(
                manager.createObstacle(OBSTACLE_TYPES.CAR, 0, 5),
                manager.createObstacle(OBSTACLE_TYPES.CAR, 0, 15),
                manager.createObstacle(OBSTACLE_TYPES.CAR, 0, 25)
            );

            const inRange = manager.getInRange(0, 20);

            expect(inRange.length).toBe(2);
        });

        it('should return empty array if no obstacles in range', () => {
            manager.obstacles.push(
                manager.createObstacle(OBSTACLE_TYPES.CAR, 0, 100)
            );

            const inRange = manager.getInRange(0, 10);

            expect(inRange.length).toBe(0);
        });
    });

    describe('clear', () => {
        it('should remove all obstacles', () => {
            manager.spawn(0, 1);
            manager.spawn(0, 1);

            manager.clear();

            expect(manager.obstacles.length).toBe(0);
        });

        it('should return obstacles to pool', () => {
            manager.spawn(0, 1);
            manager.spawn(0, 1);

            manager.clear();

            expect(manager.pool.length).toBe(2);
        });
    });

    describe('remove', () => {
        it('should remove specific obstacle', () => {
            manager.spawn(0, 1);
            manager.spawn(0, 1);
            const toRemove = manager.obstacles[0];

            manager.remove(toRemove);

            expect(manager.obstacles.length).toBe(1);
            expect(manager.obstacles).not.toContain(toRemove);
        });

        it('should add removed obstacle to pool', () => {
            manager.spawn(0, 1);
            const toRemove = manager.obstacles[0];

            manager.remove(toRemove);

            expect(manager.pool).toContain(toRemove);
        });
    });

    describe('getRandomType', () => {
        it('should return valid obstacle type', () => {
            const validTypes = Object.values(OBSTACLE_TYPES);

            for (let i = 0; i < 50; i++) {
                const type = manager.getRandomType();
                expect(validTypes).toContain(type);
            }
        });
    });

    describe('getRandomLane', () => {
        it('should return valid lane', () => {
            const validLanes = [LANES.LEFT, LANES.CENTER, LANES.RIGHT];

            for (let i = 0; i < 50; i++) {
                const lane = manager.getRandomLane();
                expect(validLanes).toContain(lane);
            }
        });
    });

    describe('pool management', () => {
        it('should not exceed max pool size', () => {
            // Create and return many obstacles
            for (let i = 0; i < 100; i++) {
                const obstacle = manager.createObstacle(OBSTACLE_TYPES.CAR, 0, 100);
                manager.returnToPool(obstacle);
            }

            expect(manager.pool.length).toBeLessThanOrEqual(manager.maxPoolSize);
        });
    });
});
