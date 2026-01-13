-- GameConfig.spec.lua
-- Unit tests for GameConfig module
-- Uses TestEZ framework

return function()
	local ReplicatedStorage = game:GetService("ReplicatedStorage")
	local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))

	describe("GameConfig", function()
		describe("LANES", function()
			it("should have LEFT, CENTER, and RIGHT lanes", function()
				expect(GameConfig.LANES.LEFT).to.be.ok()
				expect(GameConfig.LANES.CENTER).to.be.ok()
				expect(GameConfig.LANES.RIGHT).to.be.ok()
			end)

			it("should have correct lane values", function()
				expect(GameConfig.LANES.LEFT).to.equal(-1)
				expect(GameConfig.LANES.CENTER).to.equal(0)
				expect(GameConfig.LANES.RIGHT).to.equal(1)
			end)
		end)

		describe("LANE_WIDTH", function()
			it("should be a positive number", function()
				expect(GameConfig.LANE_WIDTH).to.be.a("number")
				expect(GameConfig.LANE_WIDTH > 0).to.equal(true)
			end)

			it("should be 16 studs", function()
				expect(GameConfig.LANE_WIDTH).to.equal(16)
			end)
		end)

		describe("ROAD_WIDTH", function()
			it("should equal 3 times LANE_WIDTH", function()
				expect(GameConfig.ROAD_WIDTH).to.equal(GameConfig.LANE_WIDTH * 3)
			end)
		end)

		describe("GAME_STATES", function()
			it("should have all required states", function()
				expect(GameConfig.GAME_STATES.MENU).to.be.ok()
				expect(GameConfig.GAME_STATES.CAR_SELECT).to.be.ok()
				expect(GameConfig.GAME_STATES.PLAYING).to.be.ok()
				expect(GameConfig.GAME_STATES.GAME_OVER).to.be.ok()
			end)

			it("should have unique values for each state", function()
				local values = {}
				for _, v in pairs(GameConfig.GAME_STATES) do
					expect(values[v]).to.equal(nil)
					values[v] = true
				end
			end)
		end)

		describe("DIFFICULTY", function()
			it("should have all required settings", function()
				expect(GameConfig.DIFFICULTY.initialSpeed).to.be.ok()
				expect(GameConfig.DIFFICULTY.maxSpeed).to.be.ok()
				expect(GameConfig.DIFFICULTY.speedIncreaseRate).to.be.ok()
				expect(GameConfig.DIFFICULTY.initialSpawnInterval).to.be.ok()
				expect(GameConfig.DIFFICULTY.minSpawnInterval).to.be.ok()
				expect(GameConfig.DIFFICULTY.difficultyRampTime).to.be.ok()
			end)

			it("should have maxSpeed greater than initialSpeed", function()
				expect(GameConfig.DIFFICULTY.maxSpeed > GameConfig.DIFFICULTY.initialSpeed).to.equal(true)
			end)

			it("should have minSpawnInterval less than initialSpawnInterval", function()
				expect(GameConfig.DIFFICULTY.minSpawnInterval < GameConfig.DIFFICULTY.initialSpawnInterval).to.equal(true)
			end)

			it("should have positive speed values", function()
				expect(GameConfig.DIFFICULTY.initialSpeed > 0).to.equal(true)
				expect(GameConfig.DIFFICULTY.maxSpeed > 0).to.equal(true)
			end)
		end)

		describe("OBSTACLE", function()
			it("should have spawn and despawn distances", function()
				expect(GameConfig.OBSTACLE.spawnDistance).to.be.ok()
				expect(GameConfig.OBSTACLE.despawnDistance).to.be.ok()
			end)

			it("should spawn ahead and despawn behind", function()
				expect(GameConfig.OBSTACLE.spawnDistance > 0).to.equal(true)
				expect(GameConfig.OBSTACLE.despawnDistance < 0).to.equal(true)
			end)
		end)

		describe("NITRO", function()
			it("should have all nitro settings", function()
				expect(GameConfig.NITRO.activationThreshold).to.be.ok()
				expect(GameConfig.NITRO.consumeRate).to.be.ok()
				expect(GameConfig.NITRO.boostMultiplier).to.be.ok()
			end)

			it("should have boost multiplier greater than 1", function()
				expect(GameConfig.NITRO.boostMultiplier > 1).to.equal(true)
			end)
		end)

		describe("COLORS", function()
			it("should have synthwave color palette", function()
				expect(GameConfig.COLORS.cyan).to.be.ok()
				expect(GameConfig.COLORS.magenta).to.be.ok()
				expect(GameConfig.COLORS.purple).to.be.ok()
				expect(GameConfig.COLORS.orange).to.be.ok()
			end)

			it("should have Color3 values", function()
				expect(typeof(GameConfig.COLORS.cyan)).to.equal("Color3")
				expect(typeof(GameConfig.COLORS.magenta)).to.equal("Color3")
			end)
		end)

		describe("REMOTES", function()
			it("should have all remote event names", function()
				expect(GameConfig.REMOTES.gameStart).to.be.ok()
				expect(GameConfig.REMOTES.gameUpdate).to.be.ok()
				expect(GameConfig.REMOTES.gameOver).to.be.ok()
				expect(GameConfig.REMOTES.playerMove).to.be.ok()
				expect(GameConfig.REMOTES.playerNitro).to.be.ok()
			end)

			it("should have string values", function()
				for _, v in pairs(GameConfig.REMOTES) do
					expect(type(v)).to.equal("string")
				end
			end)
		end)
	end)
end
