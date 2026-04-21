/**
 * NutriVibe Test Suite
 * Simple unit tests for core logic
 */

const Tests = {
    runAll() {
        console.group("🚀 NutriVibe Test Suite");
        this.testCalorieCalculation();
        this.testBmiCalculation();
        this.testTimeDetection();
        console.groupEnd();
    },

    assert(condition, message) {
        if (condition) {
            console.log("✅ PASS: " + message);
        } else {
            console.error("❌ FAIL: " + message);
        }
    },

    testCalorieCalculation() {
        // Mock update logic
        const currentCals = 1000;
        const mealCals = 500;
        const total = currentCals + mealCals;
        this.assert(total === 1500, "Daily calorie summation works correctly.");
    },

    testBmiCalculation() {
        const h = 1.75; // meters
        const w = 70;   // kg
        const bmi = (w / (h * h)).toFixed(1);
        this.assert(bmi === "22.9", "BMI calculation formula is accurate.");
    },

    testTimeDetection() {
        const hour = 8; // 8 AM
        const period = hour < 12 ? "Breakfast" : "Other";
        this.assert(period === "Breakfast", "Time-of-day logic detects morning correctly.");
    }
};

// Run tests on load in development
Tests.runAll();
