/**
 * Main Application Logic
 * Binds UI to AI and Charts
 */

document.addEventListener('DOMContentLoaded', () => {
    // State
    let userProfile = JSON.parse(localStorage.getItem('nutri_profile')) || {
        age: 25, height: 175, weight: 70, goal: "Stay Healthy", 
        conditions: "", dietaryFocus: "Mediterranean"
    };

    let dailyStats = JSON.parse(localStorage.getItem('nutri_stats')) || {
        calories: 0, protein: 0, carbs: 0, fat: 0, water: 0
    };

    let mealHistory = JSON.parse(localStorage.getItem('nutri_history')) || [];

    // Initial Dashboard Update
    updateDashboardUI();
    renderMealHistory();

    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.dataset.section;
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(s => {
                s.classList.remove('active');
                if (s.id === target) s.classList.add('active');
            });
        });
    });

    // API Key Handling
    const saveKeyBtn = document.getElementById('save-key-btn');
    const keyInput = document.getElementById('api-key-input');
    
    // Load existing key from session if present
    if (sessionStorage.getItem('gemini_api_key')) {
        keyInput.value = "********";
    }

    saveKeyBtn.addEventListener('click', () => {
        const key = keyInput.value.trim();
        if (key) {
            sessionStorage.setItem('gemini_api_key', key);
            document.getElementById('model-discovery-area').style.display = 'block';
            alert("API Key saved! Now click 'Check Availability' below to find the best model.");
        }
    });

    // Model Discovery
    const discoverBtn = document.getElementById('discover-models-btn');
    const modelSelect = document.getElementById('model-select');

    discoverBtn.addEventListener('click', async () => {
        discoverBtn.textContent = "Checking...";
        const models = await gemini.listModels();
        
        if (models && models.length > 0) {
            modelSelect.innerHTML = models
                .filter(m => m.supportedGenerationMethods.includes('generateContent'))
                .map(m => `<option value="${m.name}">${m.displayName} (${m.name})</option>`)
                .join('');
            
            // Set initial choice
            gemini.updateModel(modelSelect.value);
            alert(`Found ${models.length} models! We've selected ${modelSelect.value} for you.`);
        } else {
            alert("No models found. Please check your API key or permissions.");
        }
        discoverBtn.textContent = "Check Availability";
    });

    modelSelect.addEventListener('change', () => {
        gemini.updateModel(modelSelect.value);
    });

    // Profile Management
    const saveProfileBtn = document.getElementById('save-profile-btn');
    if (saveProfileBtn) {
        // Load existing values
        document.getElementById('prof-age').value = userProfile.age;
        document.getElementById('prof-focus').value = userProfile.dietaryFocus;
        document.getElementById('prof-conditions').value = userProfile.conditions || "";

        saveProfileBtn.addEventListener('click', () => {
            userProfile.age = document.getElementById('prof-age').value;
            userProfile.dietaryFocus = document.getElementById('prof-focus').value;
            userProfile.conditions = document.getElementById('prof-conditions').value;
            localStorage.setItem('nutri_profile', JSON.stringify(userProfile));
            alert("Profile updated! AI suggestions will now be more personalized.");
        });
    }

    // AI Analysis Logic
    const analyzeBtn = document.getElementById('analyze-btn');
    const mealInput = document.getElementById('meal-input');
    const aiResults = document.getElementById('ai-results');
    const analysisContent = document.getElementById('analysis-content');

    analyzeBtn.addEventListener('click', async () => {
        const text = mealInput.value.trim();
        const category = document.getElementById('meal-category').value;
        if (!text) return;

        analyzeBtn.disabled = true;
        analyzeBtn.textContent = "Analyzing...";

        const result = await gemini.analyzeMeal(text);
        
        if (result) {
            result.category = category;
            result.timestamp = new Date().toISOString(); // Full timestamp for filtering
            result.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            result.date = new Date().toLocaleDateString();
            updateDailyStats(result);
            addMealToHistory(result);
            renderAnalysis(result);
            mealInput.value = ""; // Clear input
        }

        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Analyze";
    });

    // Smart Suggestions Logic
    const suggestBtn = document.getElementById('suggest-btn');
    const suggestionsArea = document.getElementById('suggestions-area');

    suggestBtn.addEventListener('click', async () => {
        suggestBtn.disabled = true;
        suggestBtn.innerHTML = '<span class="material-symbols-outlined">sync</span> Thinking...';

        const suggestions = await gemini.getSmartSuggestions(userProfile);
        
        if (suggestions) {
            renderSuggestions(suggestions);
        }

        suggestBtn.disabled = false;
        suggestBtn.innerHTML = '<span class="material-symbols-outlined">auto_awesome</span> Generate Suggestions';
    });

    // Water Tracker Logic
    const addWaterBtns = document.querySelectorAll('.add-water-btn');
    if (addWaterBtns) {
        addWaterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseInt(btn.dataset.amount);
                dailyStats.water += amount;
                updateDashboardUI();
                alert(`Added ${amount}ml of water!`);
            });
        });
    }

    // BMI Calculator Logic
    const calcBmiBtn = document.getElementById('calc-bmi-btn');
    if (calcBmiBtn) {
        calcBmiBtn.addEventListener('click', () => {
            const h = parseFloat(document.getElementById('bmi-height').value) / 100;
            const w = parseFloat(document.getElementById('bmi-weight').value);
            if (h > 0 && w > 0) {
                const bmi = (w / (h * h)).toFixed(1);
                document.getElementById('bmi-result').textContent = bmi;
                
                let category = "Normal";
                if (bmi < 18.5) { category = "Underweight"; }
                else if (bmi > 25 && bmi < 30) { category = "Overweight"; }
                else if (bmi >= 30) { category = "Obese"; }
                
                const catEl = document.getElementById('bmi-category');
                catEl.textContent = category;
                catEl.style.color = "black";
                catEl.style.textDecoration = "underline";
            }
        });
    }

    // Helper Functions
    function updateDashboardUI() {
        localStorage.setItem('nutri_stats', JSON.stringify(dailyStats));

        // Update Calories
        const calRem = Math.max(0, 2000 - dailyStats.calories);
        const calRemEl = document.getElementById('cal-remaining');
        if (calRemEl) calRemEl.textContent = calRem.toLocaleString();
        
        const progEl = document.getElementById('cal-progress');
        if (progEl) progEl.style.width = Math.min(100, (dailyStats.calories / 2000) * 100) + '%';

        // Update Water
        const waterStatEl = document.getElementById('water-stat');
        if (waterStatEl) waterStatEl.textContent = `${dailyStats.water} / 2500 ml`;

        // Update Chart
        if (charts.isLoaded) {
            charts.drawDailyMacroChart([dailyStats.protein, dailyStats.carbs, dailyStats.fat]);
        }
    }

    function updateDailyStats(mealData) {
        dailyStats.calories += mealData.calories;
        dailyStats.protein += mealData.protein;
        dailyStats.carbs += mealData.carbs;
        dailyStats.fat += mealData.fat;
        updateDashboardUI();
    }

    function addMealToHistory(meal) {
        mealHistory.unshift(meal); // Add to start
        localStorage.setItem('nutri_history', JSON.stringify(mealHistory));
        renderMealHistory();
    }

    function renderMealHistory() {
        const historyEl = document.getElementById('meal-history-list');
        if (!historyEl) return;

        const dateFilter = document.getElementById('filter-date').value;
        const categoryFilter = document.getElementById('filter-category').value;
        const sortFilter = document.getElementById('filter-sort').value;

        // Filtering
        let filtered = mealHistory.filter(meal => {
            const matchesDate = !dateFilter || meal.timestamp.startsWith(dateFilter);
            const matchesCategory = categoryFilter === 'all' || meal.category === categoryFilter;
            return matchesDate && matchesCategory;
        });

        // Sorting
        filtered.sort((a, b) => {
            if (sortFilter === 'newest') return new Date(b.timestamp) - new Date(a.timestamp);
            if (sortFilter === 'oldest') return new Date(a.timestamp) - new Date(b.timestamp);
            if (sortFilter === 'calories-high') return b.calories - a.calories;
            if (sortFilter === 'calories-low') return a.calories - b.calories;
            return 0;
        });

        if (filtered.length === 0) {
            historyEl.innerHTML = '<div class="card">No meals match your filters.</div>';
            return;
        }

        historyEl.innerHTML = filtered.map(meal => `
            <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span class="stat-label" style="font-size: 0.7rem; color: var(--accent-purple)">${meal.date} • ${meal.category} • ${meal.time}</span>
                    <h4 style="margin-top: 0.2rem;">${meal.name}</h4>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">${meal.better_alternative}</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--accent-green);">${meal.calories} kcal</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">Score: ${meal.health_score}/100</div>
                </div>
            </div>
        `).join('');
    }

    // Filter Listeners
    ['filter-date', 'filter-category', 'filter-sort'].forEach(id => {
        document.getElementById(id).addEventListener('change', renderMealHistory);
    });

    function renderAnalysis(data) {
        aiResults.style.display = 'block';
        analysisContent.innerHTML = `
            <div style="margin-top: 1rem;">
                <p><strong>${data.name}</strong>: ${data.calories} kcal</p>
                <p style="font-size: 0.9rem; color: var(--text-muted);">
                    P: ${data.protein}g | C: ${data.carbs}g | F: ${data.fat}g
                </p>
                <div style="margin-top: 1rem; padding: 1rem; background: rgba(0,214,143,0.1); border-radius: 8px;">
                    <p style="color: var(--accent-green); font-weight: 600;">AI Insight:</p>
                    <p>${data.better_alternative}</p>
                </div>
            </div>
        `;
    }

    function renderSuggestions(list) {
        suggestionsArea.innerHTML = list.map((item, index) => `
            <div class="card" style="border-top: 3px solid var(--accent-blue)">
                <span class="stat-label" style="font-size: 0.7rem; color: var(--accent-blue)">${item.diet_type}</span>
                <h4 style="margin: 0.5rem 0;">${item.name}</h4>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">${item.reason}</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 700;">${item.calories} kcal</span>
                    <button class="glass-btn add-suggestion-btn" 
                        data-name="${item.name}" 
                        data-calories="${item.calories}" 
                        data-protein="20" data-carbs="40" data-fat="10">Add</button>
                </div>
            </div>
        `).join('');
    }

    // Handle Adding Suggestions
    suggestionsArea.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-suggestion-btn')) {
            const btn = e.target;
            const now = new Date();
            const meal = {
                name: btn.dataset.name,
                calories: parseInt(btn.dataset.calories),
                protein: parseInt(btn.dataset.protein),
                carbs: parseInt(btn.dataset.carbs),
                fat: parseInt(btn.dataset.fat),
                category: gemini.getTimeOfDay(),
                timestamp: now.toISOString(),
                date: now.toLocaleDateString(),
                time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                better_alternative: "AI Recommended"
            };
            
            updateDailyStats(meal);
            addMealToHistory(meal);
            alert(`Added ${meal.name} to your ${meal.category} log!`);
        }
    });

    // Init Dashboard Greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning!" : hour < 17 ? "Good Afternoon!" : "Good Evening!";
    document.getElementById('greeting').textContent = greeting;
});
