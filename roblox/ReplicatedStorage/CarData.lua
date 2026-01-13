-- CarData.lua
-- Car definitions and statistics for Neon Rush
-- Place in: ReplicatedStorage

local CarData = {}

CarData.CARS = {
	bmw_m3 = {
		id = "bmw_m3",
		name = "2006 BMW M3 (E46)",
		description = "Balanced handling with medium nitro capacity",
		color = Color3.fromRGB(0, 191, 255),  -- Blue/cyan
		dashboardColor = Color3.fromRGB(0, 100, 255),

		-- Performance stats
		acceleration = 8,
		topSpeed = 100,
		handling = 9,

		-- Nitro stats
		maxNitro = 100,
		nitroRechargeRate = 5,

		-- Movement
		laneSwitchSpeed = 10,

		-- Display order in car select
		order = 1
	},

	supra = {
		id = "supra",
		name = "Toyota MK4 Supra",
		description = "Fast acceleration with large nitro capacity",
		color = Color3.fromRGB(255, 102, 0),  -- Orange
		dashboardColor = Color3.fromRGB(255, 80, 0),

		-- Performance stats
		acceleration = 10,
		topSpeed = 95,
		handling = 8,

		-- Nitro stats
		maxNitro = 120,
		nitroRechargeRate = 4,

		-- Movement
		laneSwitchSpeed = 12,

		-- Display order
		order = 2
	},

	corvette = {
		id = "corvette",
		name = "2017 Chevrolet Corvette C6",
		description = "Top speed bonus with quick nitro recharge",
		color = Color3.fromRGB(255, 0, 64),  -- Red
		dashboardColor = Color3.fromRGB(200, 0, 50),

		-- Performance stats
		acceleration = 7,
		topSpeed = 110,
		handling = 7,

		-- Nitro stats
		maxNitro = 80,
		nitroRechargeRate = 8,

		-- Movement
		laneSwitchSpeed = 9,

		-- Display order
		order = 3
	}
}

-- Get car by ID
function CarData.getCarById(carId)
	return CarData.CARS[carId]
end

-- Get all cars sorted by order
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

-- Get car IDs in order
function CarData.getCarIds()
	return {"bmw_m3", "supra", "corvette"}
end

return CarData
