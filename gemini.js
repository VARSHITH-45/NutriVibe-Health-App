/**
 * Gemini AI Integration Module
 * Handles all prompt engineering and API calls
 */

class GeminiAI {
    constructor() {
        // Defaulting to a likely candidate, but we'll use discovery to confirm
        this.updateModel("gemini-1.5-flash");
    }

    updateModel(modelName) {
        // Handle full names like 'models/gemini-1.5-flash'
        const shortName = modelName.includes('/') ? modelName.split('/').pop() : modelName;
        this.baseUrl = `https://generativelanguage.googleapis.com/v1/models/${shortName}:generateContent`;
        localStorage.setItem('nutri_model', shortName);
    }

    getApiKey() {
        return sessionStorage.getItem('gemini_api_key');
    }

    async listModels() {
        const apiKey = this.getApiKey();
        if (!apiKey) return [];
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
            const data = await response.json();
            return data.models || [];
        } catch (error) {
            console.error("Discovery error:", error);
            return [];
        }
    }

    async callApi(prompt) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            alert("Please set your Gemini API Key in the Profile section first!");
            return null;
        }

        try {
            const response = await fetch(`${this.baseUrl}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            
            let text = data.candidates[0].content.parts[0].text;
            
            // Clean markdown blocks if AI wraps JSON in ```json ... ```
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            
            return JSON.parse(text);
        } catch (error) {
            console.error("Gemini API Error:", error);
            alert("Error communicating with AI: " + error.message);
            return null;
        }
    }

    /**
     * Analyzes a meal description and returns nutrition data
     */
    async analyzeMeal(mealDescription) {
        const prompt = `Analyze this meal: "${mealDescription}". 
        IMPORTANT: Return ONLY a valid JSON object. Do not include any other text or explanation.
        The JSON MUST follow this structure:
        {
          "name": "Meal name",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number,
          "health_score": number,
          "better_alternative": "short suggestion"
        }`;
        
        return await this.callApi(prompt);
    }

    /**
     * Suggests meals based on user profile and context
     */
    async getSmartSuggestions(profile) {
        const timeOfDay = this.getTimeOfDay();
        const dietaryFocus = profile.dietaryFocus || "General Health";
        
        const prompt = `Act as a nutrition assistant. 
        User Profile: Age ${profile.age}, Height ${profile.height}cm, Weight ${profile.weight}kg, Goal: ${profile.goal}.
        Health Conditions: ${profile.conditions || 'None'}.
        Current Time: ${timeOfDay}.
        Dietary Focus: ${dietaryFocus}.
        
        Suggest 3 meal options for this user. 
        IMPORTANT: Return ONLY a valid JSON array of objects. Do not include any other text.
        Structure:
        [
          {
            "name": "Dish Name",
            "reason": "Why it suits them",
            "calories": number,
            "diet_type": "Keto/Vegan/etc"
          }
        ]`;

        return await this.callApi(prompt);
    }

    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 12) return "Breakfast";
        if (hour < 17) return "Lunch";
        return "Dinner";
    }
}

const gemini = new GeminiAI();
