-- CarData.spec.lua
-- Unit tests for CarData module
-- Uses TestEZ framework

return function()
	local ReplicatedStorage = game:GetService("ReplicatedStorage")
	local CarData = require(ReplicatedStorage:WaitForChild("CarData"))

	describe("CarData", function()
		describe("CARS", function()
			it("should have exactly 3 cars", function()
				local count = 0
				for _ in pairs(CarData.CARS) do
					count = count + 1
				end
				expect(count).to.equal(3)
			end)

			it("should have bmw_m3", function()
				expect(CarData.CARS.bmw_m3).to.be.ok()
			end)

			it("should have supra", function()
				expect(CarData.CARS.supra).to.be.ok()
			end)

			it("should have corvette", function()
				expect(CarData.CARS.corvette).to.be.ok()
			end)
		end)

		describe("Car properties", function()
			local requiredProperties = {
				"id", "name", "description", "color", "dashboardColor",
				"acceleration", "topSpeed", "handling",
				"maxNitro", "nitroRechargeRate", "laneSwitchSpeed", "order"
			}

			for _, carId in ipairs({"bmw_m3", "supra", "corvette"}) do
				describe(carId, function()
					local car = CarData.CARS[carId]

					for _, prop in ipairs(requiredProperties) do
						it("should have " .. prop, function()
							expect(car[prop]).to.be.ok()
						end)
					end

					it("should have id matching key", function()
						expect(car.id).to.equal(carId)
					end)

					it("should have positive stats", function()
						expect(car.acceleration > 0).to.equal(true)
						expect(car.topSpeed > 0).to.equal(true)
						expect(car.handling > 0).to.equal(true)
						expect(car.maxNitro > 0).to.equal(true)
						expect(car.nitroRechargeRate > 0).to.equal(true)
						expect(car.laneSwitchSpeed > 0).to.equal(true)
					end)

					it("should have Color3 for color", function()
						expect(typeof(car.color)).to.equal("Color3")
					end)

					it("should have Color3 for dashboardColor", function()
						expect(typeof(car.dashboardColor)).to.equal("Color3")
					end)
				end)
			end
		end)

		describe("getCarById", function()
			it("should return car for valid id", function()
				local car = CarData.getCarById("bmw_m3")
				expect(car).to.be.ok()
				expect(car.id).to.equal("bmw_m3")
			end)

			it("should return nil for invalid id", function()
				local car = CarData.getCarById("invalid_car")
				expect(car).to.equal(nil)
			end)

			it("should return correct car data", function()
				local supra = CarData.getCarById("supra")
				expect(supra.name).to.equal("Toyota MK4 Supra")
			end)
		end)

		describe("getAllCars", function()
			it("should return array of cars", function()
				local cars = CarData.getAllCars()
				expect(#cars).to.equal(3)
			end)

			it("should return cars sorted by order", function()
				local cars = CarData.getAllCars()
				for i = 1, #cars - 1 do
					expect(cars[i].order < cars[i + 1].order).to.equal(true)
				end
			end)

			it("should include all car data", function()
				local cars = CarData.getAllCars()
				local ids = {}
				for _, car in ipairs(cars) do
					ids[car.id] = true
				end
				expect(ids["bmw_m3"]).to.equal(true)
				expect(ids["supra"]).to.equal(true)
				expect(ids["corvette"]).to.equal(true)
			end)
		end)

		describe("getCarIds", function()
			it("should return array of car ids", function()
				local ids = CarData.getCarIds()
				expect(#ids).to.equal(3)
			end)

			it("should contain all car ids", function()
				local ids = CarData.getCarIds()
				local found = {bmw_m3 = false, supra = false, corvette = false}
				for _, id in ipairs(ids) do
					found[id] = true
				end
				expect(found.bmw_m3).to.equal(true)
				expect(found.supra).to.equal(true)
				expect(found.corvette).to.equal(true)
			end)
		end)

		describe("Car balance", function()
			it("should have varied top speeds", function()
				local speeds = {}
				for _, car in pairs(CarData.CARS) do
					table.insert(speeds, car.topSpeed)
				end
				table.sort(speeds)
				-- Check there's at least 10 difference between fastest and slowest
				expect(speeds[#speeds] - speeds[1] >= 10).to.equal(true)
			end)

			it("should have varied nitro capacities", function()
				local nitros = {}
				for _, car in pairs(CarData.CARS) do
					table.insert(nitros, car.maxNitro)
				end
				table.sort(nitros)
				expect(nitros[#nitros] - nitros[1] >= 20).to.equal(true)
			end)

			it("corvette should have highest top speed", function()
				local corvette = CarData.getCarById("corvette")
				local bmw = CarData.getCarById("bmw_m3")
				local supra = CarData.getCarById("supra")
				expect(corvette.topSpeed > bmw.topSpeed).to.equal(true)
				expect(corvette.topSpeed > supra.topSpeed).to.equal(true)
			end)

			it("supra should have highest nitro capacity", function()
				local supra = CarData.getCarById("supra")
				local bmw = CarData.getCarById("bmw_m3")
				local corvette = CarData.getCarById("corvette")
				expect(supra.maxNitro > bmw.maxNitro).to.equal(true)
				expect(supra.maxNitro > corvette.maxNitro).to.equal(true)
			end)
		end)
	end)
end
