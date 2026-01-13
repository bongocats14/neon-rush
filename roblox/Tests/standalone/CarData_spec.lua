-- CarData_spec.lua
-- Busted tests for CarData module

describe("CarData", function()
    local CarData
    local Mocks
    
    setup(function()
        Mocks = require("mocks")
        _G.Color3 = Mocks.Color3
        _G.typeof = Mocks.typeof
        CarData = require("CarData_standalone")
    end)

    describe("CARS", function()
        it("should have exactly 3 cars", function()
            local count = 0
            for _ in pairs(CarData.CARS) do
                count = count + 1
            end
            assert.are.equal(3, count)
        end)

        it("should have bmw_m3", function()
            assert.is_not_nil(CarData.CARS.bmw_m3)
        end)

        it("should have supra", function()
            assert.is_not_nil(CarData.CARS.supra)
        end)

        it("should have corvette", function()
            assert.is_not_nil(CarData.CARS.corvette)
        end)
    end)

    describe("Car properties", function()
        local requiredProperties = {
            "id", "name", "description", "color", "dashboardColor",
            "acceleration", "topSpeed", "handling",
            "maxNitro", "nitroRechargeRate", "laneSwitchSpeed", "order"
        }

        for carId, _ in pairs({bmw_m3 = true, supra = true, corvette = true}) do
            describe(carId, function()
                local car
                
                setup(function()
                    car = CarData.CARS[carId]
                end)

                for _, prop in ipairs(requiredProperties) do
                    it("should have " .. prop, function()
                        assert.is_not_nil(car[prop])
                    end)
                end

                it("should have id matching key", function()
                    assert.are.equal(carId, car.id)
                end)

                it("should have positive stats", function()
                    assert.is_true(car.acceleration > 0)
                    assert.is_true(car.topSpeed > 0)
                    assert.is_true(car.handling > 0)
                    assert.is_true(car.maxNitro > 0)
                    assert.is_true(car.nitroRechargeRate > 0)
                    assert.is_true(car.laneSwitchSpeed > 0)
                end)

                it("should have Color3 for color", function()
                    assert.are.equal("Color3", Mocks.typeof(car.color))
                end)

                it("should have Color3 for dashboardColor", function()
                    assert.are.equal("Color3", Mocks.typeof(car.dashboardColor))
                end)
            end)
        end
    end)

    describe("getCarById", function()
        it("should return car for valid id", function()
            local car = CarData.getCarById("bmw_m3")
            assert.is_not_nil(car)
            assert.are.equal("bmw_m3", car.id)
        end)

        it("should return nil for invalid id", function()
            local car = CarData.getCarById("invalid_car")
            assert.is_nil(car)
        end)

        it("should return correct car data", function()
            local supra = CarData.getCarById("supra")
            assert.are.equal("Toyota MK4 Supra", supra.name)
        end)
    end)

    describe("getAllCars", function()
        it("should return array of cars", function()
            local cars = CarData.getAllCars()
            assert.are.equal(3, #cars)
        end)

        it("should return cars sorted by order", function()
            local cars = CarData.getAllCars()
            for i = 1, #cars - 1 do
                assert.is_true(cars[i].order < cars[i + 1].order)
            end
        end)

        it("should include all car data", function()
            local cars = CarData.getAllCars()
            local ids = {}
            for _, car in ipairs(cars) do
                ids[car.id] = true
            end
            assert.is_true(ids["bmw_m3"])
            assert.is_true(ids["supra"])
            assert.is_true(ids["corvette"])
        end)
    end)

    describe("getCarIds", function()
        it("should return array of car ids", function()
            local ids = CarData.getCarIds()
            assert.are.equal(3, #ids)
        end)

        it("should contain all car ids", function()
            local ids = CarData.getCarIds()
            local found = {bmw_m3 = false, supra = false, corvette = false}
            for _, id in ipairs(ids) do
                found[id] = true
            end
            assert.is_true(found.bmw_m3)
            assert.is_true(found.supra)
            assert.is_true(found.corvette)
        end)
    end)

    describe("Car balance", function()
        it("should have varied top speeds", function()
            local speeds = {}
            for _, car in pairs(CarData.CARS) do
                table.insert(speeds, car.topSpeed)
            end
            table.sort(speeds)
            assert.is_true(speeds[#speeds] - speeds[1] >= 10)
        end)

        it("should have varied nitro capacities", function()
            local nitros = {}
            for _, car in pairs(CarData.CARS) do
                table.insert(nitros, car.maxNitro)
            end
            table.sort(nitros)
            assert.is_true(nitros[#nitros] - nitros[1] >= 20)
        end)

        it("corvette should have highest top speed", function()
            local corvette = CarData.getCarById("corvette")
            local bmw = CarData.getCarById("bmw_m3")
            local supra = CarData.getCarById("supra")
            assert.is_true(corvette.topSpeed > bmw.topSpeed)
            assert.is_true(corvette.topSpeed > supra.topSpeed)
        end)

        it("supra should have highest nitro capacity", function()
            local supra = CarData.getCarById("supra")
            local bmw = CarData.getCarById("bmw_m3")
            local corvette = CarData.getCarById("corvette")
            assert.is_true(supra.maxNitro > bmw.maxNitro)
            assert.is_true(supra.maxNitro > corvette.maxNitro)
        end)
    end)
end)
