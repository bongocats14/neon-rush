-- PowerupData.lua
-- Power-up definitions for Neon Rush
-- Place in: ReplicatedStorage

local PowerupData = {}

PowerupData.TYPES = {
	SHIELD = "shield",
	SLOW_MO = "slowmo",
	MULTIPLIER = "multiplier",
	NITRO_ZONE = "nitro_zone"
}

PowerupData.POWERUPS = {
	shield = {
		id = "shield",
		name = "Shield",
		description = "Absorbs one collision",
		color = Color3.fromRGB(0, 255, 255),  -- Cyan
		duration = 5,  -- seconds
		spawnWeight = 20,
		icon = "rbxassetid://0",  -- Replace with actual asset ID
	},

	slowmo = {
		id = "slowmo",
		name = "Slow Motion",
		description = "Slows time by 50%",
		color = Color3.fromRGB(139, 0, 255),  -- Purple
		duration = 3,  -- seconds
		spawnWeight = 15,
		icon = "rbxassetid://0",
	},

	multiplier = {
		id = "multiplier",
		name = "Score Multiplier",
		description = "2x score for limited time",
		color = Color3.fromRGB(255, 215, 0),  -- Gold
		duration = 10,  -- seconds
		spawnWeight = 10,
		icon = "rbxassetid://0",
	}
}

-- Nitro zone configuration (spawned as lane strips)
PowerupData.NITRO_ZONE = {
	color = Color3.fromRGB(255, 102, 0),  -- Orange
	length = 80,  -- studs
	rechargeRate = 50,  -- nitro per second while in zone
	spawnChance = 0.01  -- per frame chance to spawn
}

-- Obstacle types and their properties
PowerupData.OBSTACLES = {
	cone = {
		id = "cone",
		name = "Traffic Cone",
		color = Color3.fromRGB(255, 102, 0),
		size = Vector3.new(4.8, 12.8, 4.8),  -- studs (scaled)
		spawnWeight = 30
	},

	stop_sign = {
		id = "stop_sign",
		name = "Stop Sign",
		color = Color3.fromRGB(255, 0, 64),
		size = Vector3.new(3.2, 40, 3.2),  -- tall pole with sign
		spawnWeight = 25
	},

	car = {
		id = "car",
		name = "Parked Car",
		color = Color3.fromRGB(139, 0, 255),
		size = Vector3.new(32, 19.2, 64),  -- full-size car
		spawnWeight = 30
	},

	barrier = {
		id = "barrier",
		name = "Road Barrier",
		color = Color3.fromRGB(255, 0, 255),
		size = Vector3.new(48, 12.8, 4.8),  -- wide and low
		spawnWeight = 10
	},

	truck = {
		id = "truck",
		name = "Truck",
		color = Color3.fromRGB(0, 191, 255),
		size = Vector3.new(40, 40, 128),  -- large vehicle
		spawnWeight = 5
	}
}

-- Get random obstacle type based on weights
function PowerupData.getRandomObstacleType()
	local totalWeight = 0
	for _, obstacle in pairs(PowerupData.OBSTACLES) do
		totalWeight = totalWeight + obstacle.spawnWeight
	end

	local random = math.random() * totalWeight
	for id, obstacle in pairs(PowerupData.OBSTACLES) do
		random = random - obstacle.spawnWeight
		if random <= 0 then
			return id
		end
	end

	return "cone"  -- fallback
end

-- Get random powerup type based on weights
function PowerupData.getRandomPowerupType()
	local totalWeight = 0
	for _, powerup in pairs(PowerupData.POWERUPS) do
		totalWeight = totalWeight + powerup.spawnWeight
	end

	local random = math.random() * totalWeight
	for id, powerup in pairs(PowerupData.POWERUPS) do
		random = random - powerup.spawnWeight
		if random <= 0 then
			return id
		end
	end

	return "shield"  -- fallback
end

return PowerupData
