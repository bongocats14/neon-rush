-- TestRunner.server.lua
-- Runs all unit tests using TestEZ framework
-- Place in: ServerScriptService (only for testing, remove in production)
--
-- Prerequisites:
-- 1. Install TestEZ from https://github.com/Roblox/testez
-- 2. Place TestEZ in ReplicatedStorage
-- 3. Place all .spec.lua files in ReplicatedStorage.Tests folder
--
-- Usage:
-- Run this script to execute all tests. Check Output window for results.

local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Wait for TestEZ to be available
local TestEZ = ReplicatedStorage:FindFirstChild("TestEZ")
if not TestEZ then
	warn("[TestRunner] TestEZ not found in ReplicatedStorage!")
	warn("[TestRunner] Please install TestEZ from: https://github.com/Roblox/testez")
	warn("[TestRunner] Or use Wally: wally add roblox/testez")
	return
end

local TestEZModule = require(TestEZ)

-- Wait for Tests folder
local TestsFolder = ReplicatedStorage:FindFirstChild("Tests")
if not TestsFolder then
	warn("[TestRunner] Tests folder not found in ReplicatedStorage!")
	warn("[TestRunner] Please create a 'Tests' folder and add .spec.lua files")
	return
end

print("========================================")
print("  NEON RUSH - Running Unit Tests")
print("========================================")
print("")

-- Run all tests
local results = TestEZModule.TestBootstrap:run({TestsFolder})

print("")
print("========================================")
print("  Test Results Summary")
print("========================================")

if results.failureCount == 0 then
	print("  All tests PASSED!")
	print(string.format("  %d tests in %d test suites", results.successCount, results.testCount))
else
	warn(string.format("  %d tests FAILED", results.failureCount))
	print(string.format("  %d passed, %d failed", results.successCount, results.failureCount))
end

print("========================================")
