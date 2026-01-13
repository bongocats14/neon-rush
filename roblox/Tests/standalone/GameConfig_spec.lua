-- GameConfig_spec.lua
-- Busted tests for GameConfig module

describe("GameConfig", function()
    local GameConfig
    local Mocks
    
    setup(function()
        Mocks = require("mocks")
        -- Inject mocks into global scope
        _G.Color3 = Mocks.Color3
        _G.typeof = Mocks.typeof
        GameConfig = require("GameConfig_standalone")
    end)

    describe("LANES", function()
        it("should have LEFT, CENTER, and RIGHT lanes", function()
            assert.is_not_nil(GameConfig.LANES.LEFT)
            assert.is_not_nil(GameConfig.LANES.CENTER)
            assert.is_not_nil(GameConfig.LANES.RIGHT)
        end)

        it("should have correct lane values", function()
            assert.are.equal(-1, GameConfig.LANES.LEFT)
            assert.are.equal(0, GameConfig.LANES.CENTER)
            assert.are.equal(1, GameConfig.LANES.RIGHT)
        end)
    end)

    describe("LANE_WIDTH", function()
        it("should be a positive number", function()
            assert.is_number(GameConfig.LANE_WIDTH)
            assert.is_true(GameConfig.LANE_WIDTH > 0)
        end)

        it("should be 16 studs", function()
            assert.are.equal(16, GameConfig.LANE_WIDTH)
        end)
    end)

    describe("ROAD_WIDTH", function()
        it("should equal 3 times LANE_WIDTH", function()
            assert.are.equal(GameConfig.LANE_WIDTH * 3, GameConfig.ROAD_WIDTH)
        end)
    end)

    describe("GAME_STATES", function()
        it("should have all required states", function()
            assert.is_not_nil(GameConfig.GAME_STATES.MENU)
            assert.is_not_nil(GameConfig.GAME_STATES.CAR_SELECT)
            assert.is_not_nil(GameConfig.GAME_STATES.PLAYING)
            assert.is_not_nil(GameConfig.GAME_STATES.GAME_OVER)
        end)

        it("should have unique values for each state", function()
            local values = {}
            for _, v in pairs(GameConfig.GAME_STATES) do
                assert.is_nil(values[v])
                values[v] = true
            end
        end)
    end)

    describe("DIFFICULTY", function()
        it("should have all required settings", function()
            assert.is_not_nil(GameConfig.DIFFICULTY.initialSpeed)
            assert.is_not_nil(GameConfig.DIFFICULTY.maxSpeed)
            assert.is_not_nil(GameConfig.DIFFICULTY.speedIncreaseRate)
            assert.is_not_nil(GameConfig.DIFFICULTY.initialSpawnInterval)
            assert.is_not_nil(GameConfig.DIFFICULTY.minSpawnInterval)
            assert.is_not_nil(GameConfig.DIFFICULTY.difficultyRampTime)
        end)

        it("should have maxSpeed greater than initialSpeed", function()
            assert.is_true(GameConfig.DIFFICULTY.maxSpeed > GameConfig.DIFFICULTY.initialSpeed)
        end)

        it("should have minSpawnInterval less than initialSpawnInterval", function()
            assert.is_true(GameConfig.DIFFICULTY.minSpawnInterval < GameConfig.DIFFICULTY.initialSpawnInterval)
        end)

        it("should have positive speed values", function()
            assert.is_true(GameConfig.DIFFICULTY.initialSpeed > 0)
            assert.is_true(GameConfig.DIFFICULTY.maxSpeed > 0)
        end)
    end)

    describe("OBSTACLE", function()
        it("should have spawn and despawn distances", function()
            assert.is_not_nil(GameConfig.OBSTACLE.spawnDistance)
            assert.is_not_nil(GameConfig.OBSTACLE.despawnDistance)
        end)

        it("should spawn ahead and despawn behind", function()
            assert.is_true(GameConfig.OBSTACLE.spawnDistance > 0)
            assert.is_true(GameConfig.OBSTACLE.despawnDistance < 0)
        end)
    end)

    describe("NITRO", function()
        it("should have all nitro settings", function()
            assert.is_not_nil(GameConfig.NITRO.activationThreshold)
            assert.is_not_nil(GameConfig.NITRO.consumeRate)
            assert.is_not_nil(GameConfig.NITRO.boostMultiplier)
        end)

        it("should have boost multiplier greater than 1", function()
            assert.is_true(GameConfig.NITRO.boostMultiplier > 1)
        end)
    end)

    describe("COLORS", function()
        it("should have synthwave color palette", function()
            assert.is_not_nil(GameConfig.COLORS.cyan)
            assert.is_not_nil(GameConfig.COLORS.magenta)
            assert.is_not_nil(GameConfig.COLORS.purple)
            assert.is_not_nil(GameConfig.COLORS.orange)
        end)

        it("should have Color3 values", function()
            assert.are.equal("Color3", Mocks.typeof(GameConfig.COLORS.cyan))
            assert.are.equal("Color3", Mocks.typeof(GameConfig.COLORS.magenta))
        end)
    end)

    describe("REMOTES", function()
        it("should have all remote event names", function()
            assert.is_not_nil(GameConfig.REMOTES.gameStart)
            assert.is_not_nil(GameConfig.REMOTES.gameUpdate)
            assert.is_not_nil(GameConfig.REMOTES.gameOver)
            assert.is_not_nil(GameConfig.REMOTES.playerMove)
            assert.is_not_nil(GameConfig.REMOTES.playerNitro)
        end)

        it("should have string values", function()
            for _, v in pairs(GameConfig.REMOTES) do
                assert.is_string(v)
            end
        end)
    end)
end)
