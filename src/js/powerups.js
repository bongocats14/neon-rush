// Power-up system

import { LANES, LANE_WIDTH } from './game.js';

export const POWERUP_TYPES = {
    SHIELD: 'shield',
    SLOW_MO: 'slowmo',
    MULTIPLIER: 'multiplier'
};

// Spawn configuration
const POWERUP_CONFIG = {
    [POWERUP_TYPES.SHIELD]: {
        spawnWeight: 20,
        duration: 5000,
        color: 0x00ffff, // Cyan
        description: 'Absorbs one collision'
    },
    [POWERUP_TYPES.SLOW_MO]: {
        spawnWeight: 15,
        duration: 3000,
        color: 0x8b00ff, // Purple
        description: 'Slows time briefly'
    },
    [POWERUP_TYPES.MULTIPLIER]: {
        spawnWeight: 25,
        duration: 10000,
        color: 0xff00ff, // Magenta
        description: '2x score multiplier'
    }
};

// Nitro zone configuration
const NITRO_ZONE_CONFIG = {
    length: 30,
    chargeAmount: 5, // Per frame while in zone
    spawnChance: 0.3,
    color: 0xff6600 // Orange
};

const SPAWN_DISTANCE = 200;
const DESPAWN_DISTANCE = -20;
const MIN_POWERUP_INTERVAL = 5000; // Minimum time between powerup spawns

class PowerupManager {
    constructor() {
        this.powerups = [];
        this.nitroZones = [];
        this.lastPowerupSpawn = 0;
        this.lastNitroZoneSpawn = 0;
    }

    /**
     * Create a new powerup
     */
    createPowerup(type, lane, z) {
        const config = POWERUP_CONFIG[type];
        return {
            id: Math.random().toString(36).substr(2, 9),
            type,
            lane,
            z,
            active: true,
            config,
            mesh: null
        };
    }

    /**
     * Create a nitro zone
     */
    createNitroZone(lane, startZ) {
        return {
            id: Math.random().toString(36).substr(2, 9),
            lane,
            startZ,
            endZ: startZ + NITRO_ZONE_CONFIG.length,
            active: true,
            mesh: null
        };
    }

    /**
     * Get random powerup type based on weights
     */
    getRandomPowerupType() {
        const totalWeight = Object.values(POWERUP_CONFIG)
            .reduce((sum, config) => sum + config.spawnWeight, 0);

        let random = Math.random() * totalWeight;

        for (const [type, config] of Object.entries(POWERUP_CONFIG)) {
            random -= config.spawnWeight;
            if (random <= 0) {
                return type;
            }
        }

        return POWERUP_TYPES.MULTIPLIER;
    }

    /**
     * Get random lane
     */
    getRandomLane() {
        const lanes = [LANES.LEFT, LANES.CENTER, LANES.RIGHT];
        return lanes[Math.floor(Math.random() * lanes.length)];
    }

    /**
     * Spawn a powerup
     */
    spawnPowerup(gameTime) {
        // Enforce minimum interval
        if (gameTime - this.lastPowerupSpawn < MIN_POWERUP_INTERVAL) {
            return null;
        }

        const type = this.getRandomPowerupType();
        const lane = this.getRandomLane();
        const z = SPAWN_DISTANCE + Math.random() * 20;

        const powerup = this.createPowerup(type, lane, z);
        this.powerups.push(powerup);
        this.lastPowerupSpawn = gameTime;

        return powerup;
    }

    /**
     * Try to spawn a nitro zone
     */
    trySpawnNitroZone(gameTime) {
        // Random chance to spawn
        if (Math.random() > NITRO_ZONE_CONFIG.spawnChance) {
            return null;
        }

        const lane = this.getRandomLane();
        const startZ = SPAWN_DISTANCE;

        // Check if there's already a nitro zone in this lane nearby
        const hasNearby = this.nitroZones.some(
            nz => nz.lane === lane && Math.abs(nz.startZ - startZ) < NITRO_ZONE_CONFIG.length * 2
        );

        if (hasNearby) {
            return null;
        }

        const nitroZone = this.createNitroZone(lane, startZ);
        this.nitroZones.push(nitroZone);
        this.lastNitroZoneSpawn = gameTime;

        return nitroZone;
    }

    /**
     * Update all powerups and nitro zones
     */
    update(deltaTime, speed) {
        const moveDistance = speed * deltaTime;
        const removedPowerups = [];
        const removedNitroZones = [];

        // Update powerups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];
            powerup.z -= moveDistance;

            if (powerup.z < DESPAWN_DISTANCE) {
                removedPowerups.push(powerup);
                this.powerups.splice(i, 1);
            }
        }

        // Update nitro zones
        for (let i = this.nitroZones.length - 1; i >= 0; i--) {
            const zone = this.nitroZones[i];
            zone.startZ -= moveDistance;
            zone.endZ -= moveDistance;

            if (zone.endZ < DESPAWN_DISTANCE) {
                removedNitroZones.push(zone);
                this.nitroZones.splice(i, 1);
            }
        }

        return { removedPowerups, removedNitroZones };
    }

    /**
     * Collect a powerup
     */
    collectPowerup(powerup, game) {
        const config = powerup.config;

        switch (powerup.type) {
            case POWERUP_TYPES.SHIELD:
                game.activateShield(config.duration);
                break;
            case POWERUP_TYPES.SLOW_MO:
                game.activateSlowMo(config.duration);
                break;
            case POWERUP_TYPES.MULTIPLIER:
                game.activateMultiplier(config.duration);
                break;
        }

        // Remove from active list
        this.remove(powerup);

        return powerup.type;
    }

    /**
     * Check if player is in nitro zone and add nitro
     */
    checkNitroZones(playerLane, game, deltaTime) {
        let inZone = false;

        for (const zone of this.nitroZones) {
            if (zone.lane === playerLane && zone.startZ <= 0 && zone.endZ >= 0) {
                inZone = true;
                // Get charge rate from selected car or use default
                const chargeRate = game.selectedCar?.nitroChargeRate || 1.0;
                game.addNitro(NITRO_ZONE_CONFIG.chargeAmount * chargeRate * deltaTime * 60);
            }
        }

        return inZone;
    }

    /**
     * Get all active powerups
     */
    getActivePowerups() {
        return this.powerups.filter(p => p.active);
    }

    /**
     * Get all active nitro zones
     */
    getActiveNitroZones() {
        return this.nitroZones.filter(nz => nz.active);
    }

    /**
     * Remove a specific powerup
     */
    remove(powerup) {
        const index = this.powerups.indexOf(powerup);
        if (index !== -1) {
            this.powerups.splice(index, 1);
        }
    }

    /**
     * Clear all powerups and zones
     */
    clear() {
        this.powerups = [];
        this.nitroZones = [];
        this.lastPowerupSpawn = 0;
        this.lastNitroZoneSpawn = 0;
    }

    /**
     * Get powerup config
     */
    getConfig(type) {
        return POWERUP_CONFIG[type];
    }
}

// Export singleton and class
export const powerupManager = new PowerupManager();
export { NITRO_ZONE_CONFIG };
export default PowerupManager;
