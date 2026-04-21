/**
 * Google Charts Wrapper
 * Handles all data visualization logic
 */

class ChartManager {
    constructor() {
        this.isLoaded = false;
        this.currentTextColor = '#000000';
        this.currentGridColor = '#e0e0e0';
        google.charts.load('current', { 'packages': ['corechart', 'gauge'] });
        google.charts.setOnLoadCallback(() => {
            this.isLoaded = true;
            // Initial redraw will be triggered by app.js setTheme
        });
    }

    updateThemeColors(isDark) {
        this.currentTextColor = isDark ? '#ffffff' : '#000000';
        this.currentGridColor = isDark ? '#333333' : '#e0e0e0';
        // Redraw current view
        this.drawDailyMacroChart([10, 20, 30]); // Placeholder redraw
        this.drawProgressChart();
    }

    /**
     * Draws a donut chart for Protein, Carbs, Fat
     */
    drawDailyMacroChart(macros) {
        if (!this.isLoaded) return;

        const data = google.visualization.arrayToDataTable([
            ['Nutrient', 'Grams'],
            ['Protein', macros[0]],
            ['Carbs', macros[1]],
            ['Fat', macros[2]]
        ]);

        const options = {
            pieHole: 0.6,
            backgroundColor: 'transparent',
            chartArea: { width: '90%', height: '90%' },
            legend: {
                position: 'right',
                textStyle: { color: '#a0a0c0', fontSize: 12 }
            },
            colors: ['#bb86fc', '#4fc3f7', '#ff6b35'],
            pieSliceBorderColor: 'transparent',
            pieSliceText: 'none'
        };

        const chart = new google.visualization.PieChart(document.getElementById('daily_macro_chart'));
        chart.draw(data, options);
    }

    /**
     * Draws a gauge for BMI
     */
    /**
     * Draws a line chart for weekly progress
     */
    drawProgressChart() {
        if (!this.isLoaded) return;

        const data = google.visualization.arrayToDataTable([
            ['Day', 'Calories'],
            ['Mon', 1850],
            ['Tue', 2100],
            ['Wed', 1900],
            ['Thu', 2200],
            ['Fri', 1950],
            ['Sat', 2300],
            ['Sun', 2000]
        ]);

        const options = {
            backgroundColor: 'transparent',
            colors: ['#00d68f'],
            legend: { position: 'none' },
            vAxis: { 
                textStyle: { color: '#a0a0c0' },
                gridlines: { color: 'rgba(255,255,255,0.05)' }
            },
            hAxis: { 
                textStyle: { color: '#a0a0c0' }
            },
            curveType: 'function',
            chartArea: { width: '85%', height: '80%' }
        };

        const chart = new google.visualization.LineChart(document.getElementById('progress_line_chart'));
        chart.draw(data, options);
    }
}

const charts = new ChartManager();
