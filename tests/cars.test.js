// Car selection and stats tests
import { describe, it, expect } from '@jest/globals';
import { CARS, getCarById, getAllCars, getCarIds } from '../src/js/cars.js';

describe('Cars', () => {
    describe('CARS object', () => {
        it('should have three cars', () => {
            expect(Object.keys(CARS).length).toBe(3);
        });

        it('should have bmw car', () => {
            expect(CARS.bmw).toBeDefined();
        });

        it('should have supra car', () => {
            expect(CARS.supra).toBeDefined();
        });

        it('should have corvette car', () => {
            expect(CARS.corvette).toBeDefined();
        });
    });

    describe('Car properties', () => {
        const requiredProperties = [
            'id',
            'name',
            'fullName',
            'handling',
            'topSpeed',
            'acceleration',
            'nitroCapacity',
            'nitroRecharge',
            'laneSwitchSpeed',
            'maxNitro',
            'nitroChargeRate',
            'color',
            'accentColor',
            'dashboardStyle',
            'description'
        ];

        Object.keys(CARS).forEach(carId => {
            describe(`${carId}`, () => {
                it('should have all required properties', () => {
                    requiredProperties.forEach(prop => {
                        expect(CARS[carId][prop]).toBeDefined();
                    });
                });

                it('should have stats between 0 and 100', () => {
                    expect(CARS[carId].handling).toBeGreaterThanOrEqual(0);
                    expect(CARS[carId].handling).toBeLessThanOrEqual(100);
                    expect(CARS[carId].topSpeed).toBeGreaterThanOrEqual(0);
                    expect(CARS[carId].topSpeed).toBeLessThanOrEqual(100);
                    expect(CARS[carId].acceleration).toBeGreaterThanOrEqual(0);
                    expect(CARS[carId].acceleration).toBeLessThanOrEqual(100);
                });

                it('should have positive maxNitro', () => {
                    expect(CARS[carId].maxNitro).toBeGreaterThan(0);
                });

                it('should have positive nitroChargeRate', () => {
                    expect(CARS[carId].nitroChargeRate).toBeGreaterThan(0);
                });

                it('should have valid hex color', () => {
                    expect(typeof CARS[carId].color).toBe('number');
                    expect(CARS[carId].color).toBeGreaterThanOrEqual(0);
                });

                it('should have id matching key', () => {
                    expect(CARS[carId].id).toBe(carId);
                });
            });
        });
    });

    describe('BMW M3 specific', () => {
        it('should have balanced stats', () => {
            const bmw = CARS.bmw;
            expect(bmw.handling).toBe(80);
            expect(bmw.topSpeed).toBe(70);
        });

        it('should have blue theme', () => {
            expect(CARS.bmw.color).toBe(0x00bfff);
            expect(CARS.bmw.accentColor).toBe('#00bfff');
        });

        it('should have european dashboard style', () => {
            expect(CARS.bmw.dashboardStyle).toBe('european');
        });
    });

    describe('Supra specific', () => {
        it('should have high nitro capacity', () => {
            const supra = CARS.supra;
            expect(supra.nitroCapacity).toBe(90);
            expect(supra.maxNitro).toBe(150);
        });

        it('should have high acceleration', () => {
            expect(CARS.supra.acceleration).toBe(90);
        });

        it('should have orange theme', () => {
            expect(CARS.supra.color).toBe(0xff6600);
            expect(CARS.supra.accentColor).toBe('#ff6600');
        });

        it('should have JDM dashboard style', () => {
            expect(CARS.supra.dashboardStyle).toBe('jdm');
        });
    });

    describe('Corvette specific', () => {
        it('should have highest top speed', () => {
            const corvette = CARS.corvette;
            expect(corvette.topSpeed).toBe(95);
            expect(corvette.topSpeed).toBeGreaterThan(CARS.bmw.topSpeed);
            expect(corvette.topSpeed).toBeGreaterThan(CARS.supra.topSpeed);
        });

        it('should have fastest nitro recharge', () => {
            expect(CARS.corvette.nitroRecharge).toBe(90);
            expect(CARS.corvette.nitroChargeRate).toBe(1.5);
        });

        it('should have red theme', () => {
            expect(CARS.corvette.color).toBe(0xff0040);
            expect(CARS.corvette.accentColor).toBe('#ff0040');
        });

        it('should have american dashboard style', () => {
            expect(CARS.corvette.dashboardStyle).toBe('american');
        });
    });

    describe('getCarById', () => {
        it('should return car for valid id', () => {
            const car = getCarById('bmw');
            expect(car).toBe(CARS.bmw);
        });

        it('should return null for invalid id', () => {
            const car = getCarById('invalid');
            expect(car).toBeNull();
        });

        it('should return null for undefined', () => {
            const car = getCarById(undefined);
            expect(car).toBeNull();
        });
    });

    describe('getAllCars', () => {
        it('should return array of all cars', () => {
            const cars = getAllCars();
            expect(Array.isArray(cars)).toBe(true);
            expect(cars.length).toBe(3);
        });

        it('should include all cars', () => {
            const cars = getAllCars();
            expect(cars).toContain(CARS.bmw);
            expect(cars).toContain(CARS.supra);
            expect(cars).toContain(CARS.corvette);
        });
    });

    describe('getCarIds', () => {
        it('should return array of car ids', () => {
            const ids = getCarIds();
            expect(Array.isArray(ids)).toBe(true);
            expect(ids.length).toBe(3);
        });

        it('should include all car ids', () => {
            const ids = getCarIds();
            expect(ids).toContain('bmw');
            expect(ids).toContain('supra');
            expect(ids).toContain('corvette');
        });
    });

    describe('Car balance', () => {
        it('should have different strengths for each car', () => {
            // BMW: balanced
            // Supra: nitro focused
            // Corvette: speed focused

            expect(CARS.bmw.handling).toBeGreaterThan(CARS.corvette.handling);
            expect(CARS.supra.maxNitro).toBeGreaterThan(CARS.bmw.maxNitro);
            expect(CARS.corvette.topSpeed).toBeGreaterThan(CARS.supra.topSpeed);
        });

        it('should have trade-offs', () => {
            // High speed = lower nitro capacity
            expect(CARS.corvette.maxNitro).toBeLessThan(CARS.supra.maxNitro);

            // High nitro = slower lane switch
            expect(CARS.supra.laneSwitchSpeed).toBeLessThan(CARS.bmw.laneSwitchSpeed);
        });
    });
});
