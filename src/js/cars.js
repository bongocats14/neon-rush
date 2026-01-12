// Car definitions

export const CARS = {
    bmw: {
        id: 'bmw',
        name: '2006 BMW M3',
        fullName: '2006 BMW M3 (E46)',
        // Stats (0-100)
        handling: 80,
        topSpeed: 70,
        acceleration: 75,
        nitroCapacity: 60,
        nitroRecharge: 70,
        // Derived values
        laneSwitchSpeed: 12, // Higher = faster lane changes
        maxNitro: 100,
        nitroChargeRate: 1.0,
        // Visual
        color: 0x00bfff, // Neon blue
        accentColor: '#00bfff',
        dashboardStyle: 'european',
        description: 'Balanced performer with responsive handling'
    },
    supra: {
        id: 'supra',
        name: 'Toyota MK4 Supra',
        fullName: 'Toyota MK4 Supra',
        // Stats
        handling: 70,
        topSpeed: 85,
        acceleration: 90,
        nitroCapacity: 90,
        nitroRecharge: 60,
        // Derived values
        laneSwitchSpeed: 10,
        maxNitro: 150,
        nitroChargeRate: 0.8,
        // Visual
        color: 0xff6600, // Neon orange
        accentColor: '#ff6600',
        dashboardStyle: 'jdm',
        description: 'JDM legend with massive nitro reserves'
    },
    corvette: {
        id: 'corvette',
        name: '2017 Corvette C6',
        fullName: '2017 Chevrolet Corvette C6',
        // Stats
        handling: 65,
        topSpeed: 95,
        acceleration: 80,
        nitroCapacity: 50,
        nitroRecharge: 90,
        // Derived values
        laneSwitchSpeed: 9,
        maxNitro: 80,
        nitroChargeRate: 1.5,
        // Visual
        color: 0xff0040, // Neon red
        accentColor: '#ff0040',
        dashboardStyle: 'american',
        description: 'Raw American power with quick nitro recharge'
    }
};

export function getCarById(carId) {
    return CARS[carId] || null;
}

export function getAllCars() {
    return Object.values(CARS);
}

export function getCarIds() {
    return Object.keys(CARS);
}

export default CARS;
