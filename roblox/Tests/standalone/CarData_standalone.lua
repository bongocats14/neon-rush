-- CarData_standalone.lua
-- Standalone version of CarData for testing outside Roblox

local Mocks = require("mocks")
local Color3 = Mocks.Color3

local CarData = {}

CarData.CARS = {
    bmw_m3 = {
        id = "bmw_m3",
        name = "2006 BMW M3 (E46)",
        description = "Balanced handling with medium nitro capacity",
        color = Color3.fromRGB(0, 191, 255),
        dashboardColor = Color3.fromRGB(0, 100, 255),
        acceleration = 8,
        topSpeed = 100,
        handling = 9,
        maxNitro = 100,
        nitroRechargeRate = 5,
        laneSwitchSpeed = 10,
        order = 1
    },
    supra = {
        id = "supra",
        name = "Toyota MK4 Supra",
        description = "Fast acceleration with large nitro capacity",
        color = Color3.fromRGB(255, 102, 0),
        dashboardColor = Color3.fromRGB(255, 80, 0),
        acceleration = 10,
        topSpeed = 95,
        handling = 8,
        maxNitro = 120,
        nitroRechargeRate = 4,
        laneSwitchSpeed = 12,
        order = 2
    },
    corvette = {
        id = "corvette",
        name = "2017 Chevrolet Corvette C6",
        description = "Top speed bonus with quick nitro recharge",
        color = Color3.fromRGB(255, 0, 64),
        dashboardColor = Color3.fromRGB(200, 0, 50),
        acceleration = 7,
        topSpeed = 110,
        handling = 7,
        maxNitro = 80,
        nitroRechargeRate = 8,
        laneSwitchSpeed = 9,
        order = 3
    }
}

function CarData.getCarById(carId)
    return CarData.CARS[carId]
end

function CarData.getAllCars()
    local cars = {}
    for _, car in pairs(CarData.CARS) do
        table.insert(cars, car)
    end
    table.sort(cars, function(a, b)
        return a.order < b.order
    end)
    return cars
end

function CarData.getCarIds()
    return {"bmw_m3", "supra", "corvette"}
end

return CarData
