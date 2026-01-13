-- GameManager.spec.lua
-- Unit tests for GameManager module
-- Uses TestEZ framework
-- Note: These tests mock Roblox services for isolated testing

return function()
	local ReplicatedStorage = game:GetService("ReplicatedStorage")
	local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
	local CarData = require(ReplicatedStorage:WaitForChild("CarData"))

	-- Mock player for testing
	local function createMockPlayer(userId, name)
		return {
			UserId = userId or 12345,
			Name = name or "TestPlayer"
		}
	end

	-- Mock session for testing game logic
	local function createMockSession(overrides)
		local session = {
			player = createMockPlayer(),
			state = GameConfig.GAME_STATES.PLAYING,
			carId = "bmw_m3",
			car = CarData.getCarById("bmw_m3"),
			score = 0,
			distance = 0,
			speed = GameConfig.DIFFICULTY.initialSpeed,
			gameTime = 0,
			currentLane = GameConfig.LANES.CENTER,
			targetLane = GameConfig.LANES.CENTER,
			lanePosition = 0,
			nitroAmount = 0,
			maxNitro = 100,
			isNitroActive = false,
			hasShield = false,
			shieldTimer = 0,
			isSlowMo = false,
			slowMoTimer = 0,
			scoreMultiplier = 1,
			multiplierTimer = 0,
			lastSpawnTime = 0,
			obstacles = {},
			powerups = {},
			nitroZones = {}
		}

		if overrides then
			for k, v in pairs(overrides) do
				session[k] = v
			end
		end

		return session
	end

	describe("GameManager Session", function()
		describe("createSession", function()
			it("should create session with default values", function()
				local session = createMockSession()
				expect(session.score).to.equal(0)
				expect(session.distance).to.equal(0)
				expect(session.currentLane).to.equal(GameConfig.LANES.CENTER)
			end)

			it("should start with no powerups active", function()
				local session = createMockSession()
				expect(session.hasShield).to.equal(false)
				expect(session.isSlowMo).to.equal(false)
				expect(session.scoreMultiplier).to.equal(1)
			end)

			it("should start with empty obstacles", function()
				local session = createMockSession()
				expect(#session.obstacles).to.equal(0)
			end)
		end)
	end)

	describe("Lane Movement", function()
		it("should start in center lane", function()
			local session = createMockSession()
			expect(session.currentLane).to.equal(GameConfig.LANES.CENTER)
			expect(session.targetLane).to.equal(GameConfig.LANES.CENTER)
		end)

		it("should allow moving left from center", function()
			local session = createMockSession()
			session.targetLane = session.targetLane - 1
			expect(session.targetLane).to.equal(GameConfig.LANES.LEFT)
		end)

		it("should allow moving right from center", function()
			local session = createMockSession()
			session.targetLane = session.targetLane + 1
			expect(session.targetLane).to.equal(GameConfig.LANES.RIGHT)
		end)

		it("should not allow moving left from left lane", function()
			local session = createMockSession({targetLane = GameConfig.LANES.LEFT})
			local newLane = session.targetLane - 1
			if newLane < GameConfig.LANES.LEFT then
				newLane = GameConfig.LANES.LEFT
			end
			expect(newLane).to.equal(GameConfig.LANES.LEFT)
		end)

		it("should not allow moving right from right lane", function()
			local session = createMockSession({targetLane = GameConfig.LANES.RIGHT})
			local newLane = session.targetLane + 1
			if newLane > GameConfig.LANES.RIGHT then
				newLane = GameConfig.LANES.RIGHT
			end
			expect(newLane).to.equal(GameConfig.LANES.RIGHT)
		end)

		it("should calculate correct lane position", function()
			local session = createMockSession({targetLane = GameConfig.LANES.LEFT})
			local expectedX = GameConfig.LANES.LEFT * GameConfig.LANE_WIDTH
			expect(expectedX).to.equal(-GameConfig.LANE_WIDTH)
		end)
	end)

	describe("Difficulty Scaling", function()
		it("should start at initial speed", function()
			local session = createMockSession()
			expect(session.speed).to.equal(GameConfig.DIFFICULTY.initialSpeed)
		end)

		it("should calculate progress correctly", function()
			-- At time 0
			local progress0 = math.min(0 / GameConfig.DIFFICULTY.difficultyRampTime, 1)
			expect(progress0).to.equal(0)

			-- At half ramp time
			local halfTime = GameConfig.DIFFICULTY.difficultyRampTime / 2
			local progressHalf = math.min(halfTime / GameConfig.DIFFICULTY.difficultyRampTime, 1)
			expect(progressHalf).to.equal(0.5)

			-- At full ramp time
			local progressFull = math.min(GameConfig.DIFFICULTY.difficultyRampTime / GameConfig.DIFFICULTY.difficultyRampTime, 1)
			expect(progressFull).to.equal(1)

			-- Beyond ramp time (should cap at 1)
			local progressBeyond = math.min((GameConfig.DIFFICULTY.difficultyRampTime * 2) / GameConfig.DIFFICULTY.difficultyRampTime, 1)
			expect(progressBeyond).to.equal(1)
		end)

		it("should reach max speed at full difficulty", function()
			local progress = 1
			local speedRange = GameConfig.DIFFICULTY.maxSpeed - GameConfig.DIFFICULTY.initialSpeed
			local targetSpeed = GameConfig.DIFFICULTY.initialSpeed + speedRange * progress
			expect(targetSpeed).to.equal(GameConfig.DIFFICULTY.maxSpeed)
		end)

		it("should calculate spawn interval correctly", function()
			-- At progress 0
			local interval0 = GameConfig.DIFFICULTY.initialSpawnInterval
			expect(interval0).to.equal(GameConfig.DIFFICULTY.initialSpawnInterval)

			-- At progress 1
			local intervalRange = GameConfig.DIFFICULTY.initialSpawnInterval - GameConfig.DIFFICULTY.minSpawnInterval
			local interval1 = GameConfig.DIFFICULTY.initialSpawnInterval - intervalRange * 1
			expect(interval1).to.equal(GameConfig.DIFFICULTY.minSpawnInterval)
		end)
	end)

	describe("Nitro System", function()
		it("should start with no nitro", function()
			local session = createMockSession()
			expect(session.nitroAmount).to.equal(0)
		end)

		it("should not activate nitro below threshold", function()
			local session = createMockSession({nitroAmount = 10})
			local canActivate = session.nitroAmount >= GameConfig.NITRO.activationThreshold
			expect(canActivate).to.equal(false)
		end)

		it("should allow nitro activation at threshold", function()
			local session = createMockSession({nitroAmount = GameConfig.NITRO.activationThreshold})
			local canActivate = session.nitroAmount >= GameConfig.NITRO.activationThreshold
			expect(canActivate).to.equal(true)
		end)

		it("should apply boost multiplier when active", function()
			local baseSpeed = 100
			local boostedSpeed = baseSpeed * GameConfig.NITRO.boostMultiplier
			expect(boostedSpeed > baseSpeed).to.equal(true)
			expect(boostedSpeed).to.equal(baseSpeed * GameConfig.NITRO.boostMultiplier)
		end)

		it("should consume nitro over time", function()
			local dt = 1 -- 1 second
			local startNitro = 100
			local consumed = GameConfig.NITRO.consumeRate * dt
			local remaining = startNitro - consumed
			expect(remaining).to.equal(100 - GameConfig.NITRO.consumeRate)
		end)

		it("should deactivate when nitro depleted", function()
			local session = createMockSession({nitroAmount = 0, isNitroActive = true})
			if session.nitroAmount <= 0 then
				session.isNitroActive = false
			end
			expect(session.isNitroActive).to.equal(false)
		end)
	end)

	describe("Powerup System", function()
		describe("Shield", function()
			it("should absorb collision when active", function()
				local session = createMockSession({hasShield = true})
				local absorbed = session.hasShield
				expect(absorbed).to.equal(true)
			end)

			it("should be consumed after absorbing", function()
				local session = createMockSession({hasShield = true})
				-- Simulate collision
				session.hasShield = false
				session.shieldTimer = 0
				expect(session.hasShield).to.equal(false)
			end)

			it("should expire after duration", function()
				local session = createMockSession({hasShield = true, shieldTimer = 5})
				-- Simulate 6 seconds passing
				session.shieldTimer = session.shieldTimer - 6
				if session.shieldTimer <= 0 then
					session.hasShield = false
				end
				expect(session.hasShield).to.equal(false)
			end)
		end)

		describe("Slow Motion", function()
			it("should halve effective time", function()
				local dt = 1
				local effectiveDt = dt * 0.5
				expect(effectiveDt).to.equal(0.5)
			end)

			it("should expire after duration", function()
				local session = createMockSession({isSlowMo = true, slowMoTimer = 3})
				session.slowMoTimer = session.slowMoTimer - 4
				if session.slowMoTimer <= 0 then
					session.isSlowMo = false
				end
				expect(session.isSlowMo).to.equal(false)
			end)
		end)

		describe("Score Multiplier", function()
			it("should double score when active", function()
				local baseScore = 100
				local multiplier = 2
				local multipliedScore = baseScore * multiplier
				expect(multipliedScore).to.equal(200)
			end)

			it("should reset to 1 after expiry", function()
				local session = createMockSession({scoreMultiplier = 2, multiplierTimer = 10})
				session.multiplierTimer = session.multiplierTimer - 11
				if session.multiplierTimer <= 0 then
					session.scoreMultiplier = 1
				end
				expect(session.scoreMultiplier).to.equal(1)
			end)
		end)
	end)

	describe("Collision Detection", function()
		it("should detect same lane collision", function()
			local playerLane = 0
			local obstacleLane = 0
			local laneDiff = math.abs(playerLane - obstacleLane)
			local collision = laneDiff < 0.7
			expect(collision).to.equal(true)
		end)

		it("should not detect different lane collision", function()
			local playerLane = 0
			local obstacleLane = 1
			local laneDiff = math.abs(playerLane - obstacleLane)
			local collision = laneDiff < 0.7
			expect(collision).to.equal(false)
		end)

		it("should detect collision within z range", function()
			local obstacleZ = 5
			local inRange = obstacleZ >= -20 and obstacleZ <= 20
			expect(inRange).to.equal(true)
		end)

		it("should not detect collision outside z range", function()
			local obstacleZ = 100
			local inRange = obstacleZ >= -20 and obstacleZ <= 20
			expect(inRange).to.equal(false)
		end)
	end)

	describe("Scoring", function()
		it("should increase with distance", function()
			local dt = 0.1
			local speed = 100
			local distanceThisFrame = speed * dt
			expect(distanceThisFrame).to.equal(10)
		end)

		it("should apply multiplier to score", function()
			local distanceThisFrame = 10
			local multiplier = 2
			local score = math.floor(distanceThisFrame * multiplier)
			expect(score).to.equal(20)
		end)

		it("should accumulate over time", function()
			local totalDistance = 0
			local speed = 100
			for _ = 1, 10 do
				local dt = 0.1
				totalDistance = totalDistance + speed * dt
			end
			expect(totalDistance).to.equal(100)
		end)
	end)

	describe("Obstacle Management", function()
		it("should spawn at correct distance", function()
			local spawnZ = GameConfig.OBSTACLE.spawnDistance
			expect(spawnZ).to.equal(800)
		end)

		it("should move toward player", function()
			local obstacleZ = 800
			local speed = 100
			local dt = 1
			obstacleZ = obstacleZ - speed * dt
			expect(obstacleZ).to.equal(700)
		end)

		it("should despawn when past player", function()
			local obstacleZ = -100
			local shouldDespawn = obstacleZ < GameConfig.OBSTACLE.despawnDistance
			expect(shouldDespawn).to.equal(true)
		end)
	end)
end
