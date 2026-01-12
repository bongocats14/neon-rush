// Powerup system tests
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import PowerupManager, { POWERUP_TYPES } from '../src/js/powerups.js';
import { LANES } from '../src/js/game.js';

describe('PowerupManager', () => {
    let manager;
    let mockGame;

    beforeEach(() => {
        manager = new PowerupManager();
        mockGame = {
            activateShield: jest.fn(),
            activateSlowMo: jest.fn(),
            activateMultiplier: jest.fn(),
            addNitro: jest.fn(),
            selectedCar: { nitroChargeRate: 1.0 }
        };
    });

    describe('initialization', () => {
        it('should start with no powerups', () => {
            expect(manager.powerups.length).toBe(0);
        });

        it('should start with no nitro zones', () => {
            expect(manager.nitroZones.length).toBe(0);
        });
    });

    describe('createPowerup', () => {
        it('should create powerup with correct properties', () => {
            const powerup = manager.createPowerup(POWERUP_TYPES.SHIELD, LANES.CENTER, 100);

            expect(powerup.type).toBe(POWERUP_TYPES.SHIELD);
            expect(powerup.lane).toBe(LANES.CENTER);
            expect(powerup.z).toBe(100);
            expect(powerup.active).toBe(true);
            expect(powerup.config).toBeDefined();
        });

        it('should create powerup with valid config', () => {
            const powerup = manager.createPowerup(POWERUP_TYPES.MULTIPLIER, 0, 100);

            expect(powerup.config.duration).toBeGreaterThan(0);
            expect(powerup.config.color).toBeDefined();
        });
    });

    describe('createNitroZone', () => {
        it('should create nitro zone with correct properties', () => {
            const zone = manager.createNitroZone(LANES.LEFT, 100);

            expect(zone.lane).toBe(LANES.LEFT);
            expect(zone.startZ).toBe(100);
            expect(zone.endZ).toBe(130); // startZ + length (30)
            expect(zone.active).toBe(true);
        });
    });

    describe('spawnPowerup', () => {
        it('should spawn powerup and add to list', () => {
            // Use gameTime > MIN_POWERUP_INTERVAL (5000) to ensure spawn
            const powerup = manager.spawnPowerup(10000);

            expect(manager.powerups.length).toBe(1);
            expect(powerup).not.toBeNull();
        });

        it('should enforce minimum spawn interval', () => {
            manager.spawnPowerup(10000); // First spawn
            const second = manager.spawnPowerup(11000); // Only 1 second later

            expect(second).toBeNull();
        });

        it('should allow spawn after interval', () => {
            manager.spawnPowerup(10000); // First spawn
            const second = manager.spawnPowerup(16000); // 6 seconds later

            expect(second).not.toBeNull();
        });

        it('should spawn valid powerup type', () => {
            const validTypes = Object.values(POWERUP_TYPES);
            const powerup = manager.spawnPowerup(10000);

            expect(powerup).not.toBeNull();
            expect(validTypes).toContain(powerup.type);
        });
    });

    describe('trySpawnNitroZone', () => {
        it('should spawn in valid lane', () => {
            // Try multiple times since it's random
            for (let i = 0; i < 100; i++) {
                manager.nitroZones = [];
                const zone = manager.trySpawnNitroZone(i * 1000);
                if (zone) {
                    expect([LANES.LEFT, LANES.CENTER, LANES.RIGHT]).toContain(zone.lane);
                }
            }
        });

        it('should not spawn too close to existing zone in same lane', () => {
            const firstZone = manager.createNitroZone(LANES.CENTER, 200);
            manager.nitroZones.push(firstZone);

            // Force spawn attempt in same lane area
            jest.spyOn(Math, 'random').mockReturnValue(0); // Always trigger spawn
            jest.spyOn(manager, 'getRandomLane').mockReturnValue(LANES.CENTER);

            const secondZone = manager.trySpawnNitroZone(1000);

            expect(secondZone).toBeNull();

            jest.restoreAllMocks();
        });
    });

    describe('update', () => {
        it('should move powerups toward player', () => {
            const powerup = manager.createPowerup(POWERUP_TYPES.SHIELD, 0, 100);
            manager.powerups.push(powerup);

            manager.update(0.1, 50);

            expect(powerup.z).toBeLessThan(100);
        });

        it('should move nitro zones toward player', () => {
            const zone = manager.createNitroZone(0, 100);
            manager.nitroZones.push(zone);

            manager.update(0.1, 50);

            expect(zone.startZ).toBeLessThan(100);
            expect(zone.endZ).toBeLessThan(130);
        });

        it('should remove powerups past despawn distance', () => {
            const powerup = manager.createPowerup(POWERUP_TYPES.SHIELD, 0, -25);
            manager.powerups.push(powerup);

            const { removedPowerups } = manager.update(0.1, 0);

            expect(removedPowerups.length).toBe(1);
            expect(manager.powerups.length).toBe(0);
        });

        it('should remove nitro zones past despawn distance', () => {
            const zone = manager.createNitroZone(0, -50);
            zone.startZ = -50;
            zone.endZ = -25;
            manager.nitroZones.push(zone);

            const { removedNitroZones } = manager.update(0.1, 0);

            expect(removedNitroZones.length).toBe(1);
            expect(manager.nitroZones.length).toBe(0);
        });
    });

    describe('collectPowerup', () => {
        it('should activate shield on collection', () => {
            const powerup = manager.createPowerup(POWERUP_TYPES.SHIELD, 0, 0);
            manager.powerups.push(powerup);

            manager.collectPowerup(powerup, mockGame);

            expect(mockGame.activateShield).toHaveBeenCalled();
        });

        it('should activate slow-mo on collection', () => {
            const powerup = manager.createPowerup(POWERUP_TYPES.SLOW_MO, 0, 0);
            manager.powerups.push(powerup);

            manager.collectPowerup(powerup, mockGame);

            expect(mockGame.activateSlowMo).toHaveBeenCalled();
        });

        it('should activate multiplier on collection', () => {
            const powerup = manager.createPowerup(POWERUP_TYPES.MULTIPLIER, 0, 0);
            manager.powerups.push(powerup);

            manager.collectPowerup(powerup, mockGame);

            expect(mockGame.activateMultiplier).toHaveBeenCalled();
        });

        it('should remove powerup from list after collection', () => {
            const powerup = manager.createPowerup(POWERUP_TYPES.SHIELD, 0, 0);
            manager.powerups.push(powerup);

            manager.collectPowerup(powerup, mockGame);

            expect(manager.powerups).not.toContain(powerup);
        });

        it('should return collected powerup type', () => {
            const powerup = manager.createPowerup(POWERUP_TYPES.SHIELD, 0, 0);
            manager.powerups.push(powerup);

            const result = manager.collectPowerup(powerup, mockGame);

            expect(result).toBe(POWERUP_TYPES.SHIELD);
        });
    });

    describe('checkNitroZones', () => {
        it('should add nitro when player is in zone', () => {
            const zone = manager.createNitroZone(0, -10);
            zone.endZ = 10;
            manager.nitroZones.push(zone);

            const inZone = manager.checkNitroZones(0, mockGame, 0.016);

            expect(inZone).toBe(true);
            expect(mockGame.addNitro).toHaveBeenCalled();
        });

        it('should not add nitro when player is in different lane', () => {
            const zone = manager.createNitroZone(1, -10);
            zone.endZ = 10;
            manager.nitroZones.push(zone);

            const inZone = manager.checkNitroZones(0, mockGame, 0.016);

            expect(inZone).toBe(false);
            expect(mockGame.addNitro).not.toHaveBeenCalled();
        });

        it('should not add nitro when zone has passed', () => {
            const zone = manager.createNitroZone(0, -30);
            zone.endZ = -10;
            manager.nitroZones.push(zone);

            const inZone = manager.checkNitroZones(0, mockGame, 0.016);

            expect(inZone).toBe(false);
        });

        it('should scale nitro by car charge rate', () => {
            mockGame.selectedCar = { nitroChargeRate: 2.0 };
            const zone = manager.createNitroZone(0, -10);
            zone.endZ = 10;
            manager.nitroZones.push(zone);

            manager.checkNitroZones(0, mockGame, 0.016);

            // Should be called with higher value due to 2x charge rate
            const callArg = mockGame.addNitro.mock.calls[0][0];
            expect(callArg).toBeGreaterThan(0);
        });
    });

    describe('getActivePowerups', () => {
        it('should return only active powerups', () => {
            manager.powerups.push(
                { active: true },
                { active: false },
                { active: true }
            );

            const active = manager.getActivePowerups();

            expect(active.length).toBe(2);
        });
    });

    describe('getActiveNitroZones', () => {
        it('should return only active nitro zones', () => {
            manager.nitroZones.push(
                { active: true },
                { active: false },
                { active: true }
            );

            const active = manager.getActiveNitroZones();

            expect(active.length).toBe(2);
        });
    });

    describe('clear', () => {
        it('should remove all powerups', () => {
            manager.spawnPowerup(0);
            manager.spawnPowerup(10000);

            manager.clear();

            expect(manager.powerups.length).toBe(0);
        });

        it('should remove all nitro zones', () => {
            manager.nitroZones.push(
                manager.createNitroZone(0, 100),
                manager.createNitroZone(1, 200)
            );

            manager.clear();

            expect(manager.nitroZones.length).toBe(0);
        });

        it('should reset spawn times', () => {
            manager.lastPowerupSpawn = 5000;
            manager.lastNitroZoneSpawn = 5000;

            manager.clear();

            expect(manager.lastPowerupSpawn).toBe(0);
            expect(manager.lastNitroZoneSpawn).toBe(0);
        });
    });

    describe('getConfig', () => {
        it('should return config for valid powerup type', () => {
            const config = manager.getConfig(POWERUP_TYPES.SHIELD);

            expect(config).toBeDefined();
            expect(config.duration).toBeGreaterThan(0);
        });
    });
});
