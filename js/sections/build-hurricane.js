import * as d3 from 'd3';

// Hurricane data based on research
const hurricaneData = {
    categories: [
        {
            name: 'Tropical Storm',
            windSpeed: [39, 73],
            pressure: [1000, 1013],
            avgDamage: 11.5,
            color: '#4dffff',
            description: 'Damage primarily to vegetation and unsecured objects'
        },
        {
            name: 'Category 1',
            windSpeed: [74, 95],
            pressure: [980, 1000],
            avgDamage: 47.4,
            color: '#ffffd9',
            description: 'Damage to trees, mobile homes, and poorly constructed signs'
        },
        {
            name: 'Category 2',
            windSpeed: [96, 110],
            pressure: [965, 979],
            avgDamage: 137,
            color: '#ffd98c',
            description: 'Considerable damage to trees and structures, flooding of low-lying areas'
        },
        {
            name: 'Category 3',
            windSpeed: [111, 129],
            pressure: [945, 964],
            avgDamage: 347,
            color: '#ff9e59',
            description: 'Large trees blown down, mobile homes destroyed, serious coastal flooding'
        },
        {
            name: 'Category 4',
            windSpeed: [130, 156],
            pressure: [920, 944],
            avgDamage: 1140,
            color: '#ff738a',
            description: 'Devastating damage to structures, extreme flooding up to 6 miles inland'
        },
        {
            name: 'Category 5',
            windSpeed: [157, 200],
            pressure: [880, 919],
            avgDamage: 6000,
            color: '#a188fc',
            description: 'Catastrophic damage, complete building failures, massive evacuations required'
        }
    ]
};

let currentCategory = null;

export function initializeBuildHurricane() {
    console.log('Initializing Build Hurricane section...');
    const container = d3.select('#build-hurricane-visualization');
    container.html('');
    
    const width = container.node().getBoundingClientRect().width || 800;
    
    // Create container
    const wrapper = container.append('div')
        .attr('class', 'hurricane-builder');
    
    // Create controls section
    const controls = wrapper.append('div')
        .attr('class', 'controls-section')
        .style('padding', '20px')
        .style('background', '#f5f5f5')
        .style('border-radius', '8px')
        .style('margin-bottom', '20px');
    
    controls.append('h3')
        .style('margin-top', '0')
        .text('🌀 Build Your Hurricane');
    
    controls.append('p')
        .style('margin-bottom', '20px')
        .style('color', '#666')
        .text('Adjust the wind speed to see how hurricanes are categorized based on the Saffir-Simpson scale.');
    
    // Wind Speed Control - Main focus
    const windControl = controls.append('div')
        .attr('class', 'control-group')
        .style('margin-bottom', '25px');
    
    windControl.append('label')
        .style('display', 'block')
        .style('margin-bottom', '10px')
        .style('font-weight', 'bold')
        .style('font-size', '18px')
        .html('Wind Speed: <span id="wind-value" style="color: #2196f3;">85</span> mph');
    
    const windSlider = windControl.append('input')
        .attr('type', 'range')
        .attr('min', 39)
        .attr('max', 200)
        .attr('value', 85)
        .attr('step', 1)
        .style('width', '100%')
        .style('height', '8px')
        .style('cursor', 'pointer')
        .on('input', updateHurricane);
    
    // Category Display - Big and prominent
    const categoryDisplay = windControl.append('div')
        .attr('id', 'category-display')
        .style('margin-top', '15px')
        .style('padding', '20px')
        .style('background', '#ffffd9')
        .style('border-radius', '8px')
        .style('border', '3px solid #ffffd9')
        .style('text-align', 'center');
    
    categoryDisplay.append('div')
        .attr('id', 'category-name')
        .style('font-size', '32px')
        .style('font-weight', 'bold')
        .style('color', '#333')
        .text('Category 1 Hurricane');
    
    categoryDisplay.append('div')
        .attr('id', 'category-range')
        .style('font-size', '16px')
        .style('color', '#666')
        .style('margin-top', '5px')
        .text('Wind Speed Range: 74-95 mph');
    
    // Guess section
    const guessSection = wrapper.append('div')
        .attr('id', 'guess-section')
        .style('padding', '25px')
        .style('background', '#fff')
        .style('border-radius', '8px')
        .style('border', '2px solid #2196f3')
        .style('margin-top', '20px');
    
    guessSection.append('h3')
        .style('margin-top', '0')
        .style('color', '#2196f3')
        .text('❓ Guess the Average Damage');
    
    guessSection.append('p')
        .style('color', '#666')
        .style('margin-bottom', '20px')
        .text('Based on historical data (1996-2024), how much damage does this category typically cause?');
    
    const guessInputs = guessSection.append('div')
        .attr('id', 'guess-inputs')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('gap', '10px')
        .style('margin-bottom', '15px');
    
    guessInputs.append('span')
        .style('font-size', '24px')
        .style('font-weight', 'bold')
        .text('$');
    
    guessInputs.append('input')
        .attr('type', 'number')
        .attr('id', 'damage-amount')
        .attr('placeholder', '0')
        .attr('min', '0')
        .attr('step', '1')
        .style('width', '120px')
        .style('padding', '10px')
        .style('font-size', '18px')
        .style('border', '2px solid #ddd')
        .style('border-radius', '5px');
    
    guessInputs.append('select')
        .attr('id', 'damage-unit')
        .style('padding', '10px')
        .style('font-size', '18px')
        .style('border', '2px solid #ddd')
        .style('border-radius', '5px')
        .style('cursor', 'pointer')
        .selectAll('option')
        .data(['Thousand', 'Million', 'Billion'])
        .enter()
        .append('option')
        .attr('value', d => d)
        .text(d => d);
    
    guessSection.append('button')
        .attr('id', 'submit-guess')
        .style('padding', '12px 30px')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .style('background', '#2196f3')
        .style('color', '#fff')
        .style('border', 'none')
        .style('border-radius', '5px')
        .style('cursor', 'pointer')
        .text('Submit Guess')
        .on('click', submitGuess);
    
    // Feedback section (hidden initially)
    const feedbackSection = wrapper.append('div')
        .attr('id', 'feedback-section')
        .style('display', 'none')
        .style('padding', '20px')
        .style('margin-top', '15px')
        .style('border-radius', '8px');
    
    feedbackSection.append('div')
        .attr('id', 'feedback-message')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .style('margin-bottom', '10px');
    
    feedbackSection.append('div')
        .attr('id', 'feedback-details')
        .style('font-size', '16px');
    
    // Info panel (hidden initially)
    const infoPanel = wrapper.append('div')
        .attr('id', 'hurricane-info')
        .style('display', 'none')
        .style('padding', '20px')
        .style('background', '#fff')
        .style('border-radius', '8px')
        .style('margin-top', '20px')
        .style('border', '2px solid #ddd');
    
    // Initial render
    updateHurricane();
}

function updateHurricane() {
    const wind = +d3.select('input[type="range"]').property('value');
    
    // Update displays
    d3.select('#wind-value').text(wind);
    
    // Determine category
    let category = null;
    
    if (wind >= 39) {
        for (let cat of hurricaneData.categories) {
            if (wind >= cat.windSpeed[0] && wind <= cat.windSpeed[1]) {
                category = cat;
                break;
            }
        }
    }
    
    currentCategory = category;
    
    // Update category display
    updateCategoryDisplay(wind, category);
    
    // Reset guess section
    resetGuessSection();
}

function resetGuessSection() {
    d3.select('#damage-amount').property('value', '');
    d3.select('#damage-unit').property('value', 'Million');
    d3.select('#feedback-section').style('display', 'none');
    d3.select('#hurricane-info').style('display', 'none');
    d3.select('#guess-section').style('display', 'block');
}

function submitGuess() {
    const amount = +d3.select('#damage-amount').property('value');
    const unit = d3.select('#damage-unit').property('value');
    
    if (!amount || amount <= 0) {
        alert('Please enter a damage amount!');
        return;
    }
    
    if (!currentCategory) {
        alert('Please select a valid wind speed first!');
        return;
    }
    
    // Convert guess to millions for comparison
    let guessInMillions;
    if (unit === 'Thousand') {
        guessInMillions = amount / 1000;
    } else if (unit === 'Million') {
        guessInMillions = amount;
    } else { // Billion
        guessInMillions = amount * 1000;
    }
    
    const actualDamage = currentCategory.avgDamage;
    const percentDiff = Math.abs((guessInMillions - actualDamage) / actualDamage) * 100;
    const absoluteError = Math.abs(guessInMillions - actualDamage);
    
    // Show feedback
    const feedbackSection = d3.select('#feedback-section');
    const feedbackMessage = d3.select('#feedback-message');
    const feedbackDetails = d3.select('#feedback-details');
    
    let message, color, bgColor;
    
    if (percentDiff < 10) {
        message = '🎯 Excellent! Very close!';
        color = '#2e7d32';
        bgColor = '#e8f5e9';
    } else if (percentDiff < 30) {
        message = '👍 Not bad! Pretty close!';
        color = '#f57c00';
        bgColor = '#fff3e0';
    } else if (percentDiff < 100) {
        message = '🤔 Not quite, but you\'re in the ballpark!';
        color = '#f57c00';
        bgColor = '#fff3e0';
    } else {
        message = '❌ Way off! The scale might surprise you!';
        color = '#c62828';
        bgColor = '#ffebee';
    }
    
    feedbackMessage.text(message).style('color', color);
    
    const actualDisplay = actualDamage >= 1000 
        ? `$${(actualDamage / 1000).toFixed(1)} Billion`
        : `$${actualDamage} Million`;
    
    const guessDisplay = guessInMillions >= 1000
        ? `$${(guessInMillions / 1000).toFixed(1)} Billion`
        : `$${guessInMillions.toFixed(1)} Million`;
    
    const absoluteErrorDisplay = absoluteError >= 1000
        ? `$${(absoluteError / 1000).toFixed(1)} Billion`
        : `$${absoluteError.toFixed(1)} Million`;
    
    feedbackDetails.html(`
        Your guess: <strong>${guessDisplay}</strong><br>
        Actual average: <strong>${actualDisplay}</strong><br><br>
        <strong>Absolute Error:</strong> ${absoluteErrorDisplay}<br>
        <strong>Percent Error:</strong> ${percentDiff.toFixed(1)}%
    `);
    
    feedbackSection
        .style('display', 'block')
        .style('background', bgColor)
        .style('border', `2px solid ${color}`);
    
    // Show full info panel
    const wind = +d3.select('#wind-value').text();
    updateInfoPanel(currentCategory, wind);
    d3.select('#hurricane-info').style('display', 'block');
    
    // Hide guess section
    d3.select('#guess-section').style('display', 'none');
}

function updateCategoryDisplay(wind, category) {
    const display = d3.select('#category-display');
    const nameDiv = d3.select('#category-name');
    const rangeDiv = d3.select('#category-range');
    
    if (!category) {
        display.style('background', '#f5f5f5')
               .style('border-color', '#999');
        nameDiv.text('Below Tropical Storm');
        rangeDiv.text(`Wind Speed: ${wind} mph (needs 39+ mph)`);
        return;
    }
    
    // Update colors and text based on category
    display.style('background', category.color)
           .style('border-color', category.color);
    
    nameDiv.text(category.name === 'Tropical Storm' ? 'Tropical Storm' : category.name + ' Hurricane');
    rangeDiv.text(`Wind Speed Range: ${category.windSpeed[0]}-${category.windSpeed[1]} mph`);
}

function updateInfoPanel(category, wind) {
    const panel = d3.select('#hurricane-info');
    panel.html('');
    
    if (wind < 39) {
        panel.append('h3')
            .style('color', '#ffa500')
            .text('⚠️ Below Tropical Storm');
        
        panel.append('p')
            .text(`Wind speed is ${wind} mph. Needs to reach 39 mph to become a tropical storm.`);
        return;
    }
    
    if (!category) {
        panel.append('h3')
            .text('System Classification');
        panel.append('p')
            .text('Wind speed outside normal ranges.');
        return;
    }
    
    // Category info
    panel.append('h3')
        .style('color', '#333')
        .style('background', category.color)
        .style('padding', '10px')
        .style('border-radius', '5px')
        .style('margin-top', '0')
        .text(`${category.name === 'Tropical Storm' ? 'Tropical Storm' : category.name + ' Hurricane'} - Full Details`);
    
    // Stats
    const stats = panel.append('div')
        .style('display', 'grid')
        .style('grid-template-columns', '1fr 1fr')
        .style('gap', '15px')
        .style('margin', '15px 0');
    
    stats.append('div')
        .html(`<strong>Current Wind:</strong> ${wind} mph<br><small>Category range: ${category.windSpeed[0]}-${category.windSpeed[1]} mph</small>`);
    
    stats.append('div')
        .html(`<strong>Avg Damage:</strong> $${category.avgDamage >= 1000 ? (category.avgDamage/1000).toFixed(1) + 'B' : category.avgDamage + 'M'}<br><small>Historical average (1996-2024)</small>`);
    
    // Expected damage
    panel.append('h4')
        .style('margin-top', '20px')
        .text('Typical Impact:');
    
    panel.append('p')
        .style('color', '#666')
        .text(category.description);
    
    // Educational note
    panel.append('div')
        .style('background', '#e3f2fd')
        .style('padding', '15px')
        .style('border-radius', '5px')
        .style('border-left', '4px solid #2196f3')
        .style('margin-top', '15px')
        .html(`<strong>💡 Remember:</strong> These are average values. Actual damage depends on many factors including storm size, forward speed, rainfall, storm surge, and—most importantly—how prepared the affected area is.`);
}

export function onEnterBuildHurricane() {
    console.log('Entering Build Your Own Hurricane section');
}

export function onExitBuildHurricane() {
    console.log('Exiting Build Your Own Hurricane section');
}

export function onProgressBuildHurricane(progress) {
}
