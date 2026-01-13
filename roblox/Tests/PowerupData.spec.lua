-- PowerupData.spec.lua
-- Unit tests for PowerupData module
-- Uses TestEZ framework

return function()
	local ReplicatedStorage = game:GetService("ReplicatedStorage")
	local PowerupData = require(ReplicatedStorage:WaitForChild("PowerupData"))

	describe("PowerupData", function()
		describe("TYPES", function()
			it("should have all powerup types", function()
				expect(PowerupData.TYPES.SHIELD).to.be.ok()
				expect(PowerupData.TYPES.SLOW_MO).to.be.ok()
				expect(PowerupData.TYPES.MULTIPLIER).to.be.ok()
				expect(PowerupData.TYPES.NITRO_ZONE).to.be.ok()
			end)

			it("should have string values", function()
				for _, v in pairs(PowerupData.TYPES) do
					expect(type(v)).to.equal("string")
				end
			end)
		end)

		describe("POWERUPS", function()
			local requiredProperties = {
				"id", "name", "description", "color", "duration", "spawnWeight"
			}

			for powerupId, _ in pairs(PowerupData.POWERUPS) do
				describe(powerupId, function()
					local powerup = PowerupData.POWERUPS[powerupId]

					for _, prop in ipairs(requiredProperties) do
						it("should have " .. prop, function()
							expect(powerup[prop]).to.be.ok()
						end)
					end

					it("should have id matching key", function()
						expect(powerup.id).to.equal(powerupId)
					end)

					it("should have positive duration", function()
						expect(powerup.duration > 0).to.equal(true)
					end)

					it("should have positive spawn weight", function()
						expect(powerup.spawnWeight > 0).to.equal(true)
					end)

					it("should have Color3 for color", function()
						expect(typeof(powerup.color)).to.equal("Color3")
					end)
				end)
			end
		end)

		describe("OBSTACLES", function()
			local expectedObstacles = {"cone", "stop_sign", "car", "barrier", "truck"}

			it("should have all obstacle types", function()
				for _, obsType in ipairs(expectedObstacles) do
					expect(PowerupData.OBSTACLES[obsType]).to.be.ok()
				end
			end)

			for _, obsType in ipairs(expectedObstacles) do
				describe(obsType, function()
					local obstacle = PowerupData.OBSTACLES[obsType]

					it("should have id", function()
						expect(obstacle.id).to.equal(obsType)
					end)

					it("should have name", function()
						expect(obstacle.name).to.be.ok()
						expect(type(obstacle.name)).to.equal("string")
					end)

					it("should have color as Color3", function()
						expect(typeof(obstacle.color)).to.equal("Color3")
					end)

					it("should have size as Vector3", function()
						expect(typeof(obstacle.size)).to.equal("Vector3")
					end)

					it("should have positive spawn weight", function()
						expect(obstacle.spawnWeight > 0).to.equal(true)
					end)

					it("should have non-zero size dimensions", function()
						expect(obstacle.size.X > 0).to.equal(true)
						expect(obstacle.size.Y > 0).to.equal(true)
						expect(obstacle.size.Z > 0).to.equal(true)
					end)
				end)
			end
		end)

		describe("NITRO_ZONE", function()
			it("should have color", function()
				expect(PowerupData.NITRO_ZONE.color).to.be.ok()
				expect(typeof(PowerupData.NITRO_ZONE.color)).to.equal("Color3")
			end)

			it("should have length", function()
				expect(PowerupData.NITRO_ZONE.length).to.be.ok()
				expect(PowerupData.NITRO_ZONE.length > 0).to.equal(true)
			end)

			it("should have recharge rate", function()
				expect(PowerupData.NITRO_ZONE.rechargeRate).to.be.ok()
				expect(PowerupData.NITRO_ZONE.rechargeRate > 0).to.equal(true)
			end)
		end)

		describe("getRandomObstacleType", function()
			it("should return a string", function()
				local result = PowerupData.getRandomObstacleType()
				expect(type(result)).to.equal("string")
			end)

			it("should return valid obstacle type", function()
				local result = PowerupData.getRandomObstacleType()
				expect(PowerupData.OBSTACLES[result]).to.be.ok()
			end)

			it("should return different types over many calls", function()
				local types = {}
				for _ = 1, 100 do
					local result = PowerupData.getRandomObstacleType()
					types[result] = true
				end
				-- Should have at least 3 different types in 100 calls
				local count = 0
				for _ in pairs(types) do
					count = count + 1
				end
				expect(count >= 3).to.equal(true)
			end)
		end)

		describe("getRandomPowerupType", function()
			it("should return a string", function()
				local result = PowerupData.getRandomPowerupType()
				expect(type(result)).to.equal("string")
			end)

			it("should return valid powerup type", function()
				local result = PowerupData.getRandomPowerupType()
				expect(PowerupData.POWERUPS[result]).to.be.ok()
			end)

			it("should return different types over many calls", function()
				local types = {}
				for _ = 1, 100 do
					local result = PowerupData.getRandomPowerupType()
					types[result] = true
				end
				-- Should have at least 2 different types in 100 calls
				local count = 0
				for _ in pairs(types) do
					count = count + 1
				end
				expect(count >= 2).to.equal(true)
			end)
		end)

		describe("Spawn weights distribution", function()
			it("obstacle weights should sum to 100", function()
				local total = 0
				for _, obs in pairs(PowerupData.OBSTACLES) do
					total = total + obs.spawnWeight
				end
				expect(total).to.equal(100)
			end)

			it("cone should be most common obstacle", function()
				local coneWeight = PowerupData.OBSTACLES.cone.spawnWeight
				expect(coneWeight >= 25).to.equal(true)
			end)

			it("truck should be rarest obstacle", function()
				local truckWeight = PowerupData.OBSTACLES.truck.spawnWeight
				for obsType, obs in pairs(PowerupData.OBSTACLES) do
					if obsType ~= "truck" then
						expect(truckWeight <= obs.spawnWeight).to.equal(true)
					end
				end
			end)
		end)
	end)
end
