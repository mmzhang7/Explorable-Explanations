// js/sections/preparedness-action.js - Combined unprepared cities and call to action
import * as d3 from 'd3';

let actionSvg;
let currentTab = 'cities'; // 'cities' or 'action'

export function initializePreparednessAction() {
    console.log('Initializing Preparedness & Action section...');
    
    const container = d3.select('#action-visualization');
    container.html('<div class="graph-placeholder">Loading preparedness and action visualizations...</div>');
}

export function onEnterPreparednessAction() {
    console.log('Entering Preparedness & Action section');
    
    const container = d3.select('#action-visualization');
    const width = container.node().getBoundingClientRect().width || 800;
    const height = 550;
    
    container.html('');
    
    // Create tab navigation (styles defined in CSS)
    const tabContainer = container.append('div')
        .attr('class', 'tab-navigation');
    
    tabContainer.append('button')
        .attr('id', 'cities-tab')
        .attr('class', 'tab-btn active')
        .text('Lessons from Unprepared Cities')
        .style('background', '#e74c3c') // Keep specific active color in JS
        .on('click', () => switchTab('cities'));
    
    tabContainer.append('button')
        .attr('id', 'action-tab')
        .attr('class', 'tab-btn')
        .text('Take Action Now')
        .style('background', '#95a5a6') // Keep specific default color in JS
        .on('click', () => switchTab('action'));
    
    // Create visualization container
    const vizContainer = container.append('div')
        .attr('id', 'preparedness-viz-container');
    
    // Create visualization SVG
    actionSvg = vizContainer.append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);
    
    // Create cities visualization (default view)
    createCitiesVisualization(width, height);
    
    // Add impact visualization (static boxes, styles defined in CSS)
    const impactContainer = container.append('div')
        .attr('class', 'impact-container');
    
    impactContainer.html(`
        <h4>The Power of Preparedness</h4>
        <div>
            <div>
                <div class="font-2em" style="color: #e74c3c">40%</div>
                <div class="font-14px">Reduction in property damage with proper preparation</div>
            </div>
            <div>
                <div class="font-2em" style="color: #3498db">60%</div>
                <div class="font-14px">Faster recovery time for prepared communities</div>
            </div>
            <div>
                <div class="font-2em" style="color: #2ecc71">90%</div>
                <div class="font-14px">Evacuation compliance when communities are prepared</div>
            </div>
        </div>
    `);
    
    // Add action steps grid (always visible, styles defined in CSS)
    const actionGrid = container.append('div')
        .attr('class', 'action-grid');
    
    actionGrid.html(`
        <h4>Five Key Action Steps</h4>
        <div>
            <div>
                <div class="icon-24px">🏠</div>
                <h5>Prepare Your Home</h5>
                <p>Install storm shutters, reinforce roofs, clear drains and gutters</p>
            </div>
            <div>
                <div class="icon-24px">📋</div>
                <h5>Create Emergency Plan</h5>
                <p>Know evacuation routes, have emergency supplies for 3+ days</p>
            </div>
            <div>
                <div class="icon-24px">📱</div>
                <h5>Stay Informed</h5>
                <p>Monitor forecasts, heed evacuation orders, use weather apps</p>
            </div>
            <div>
                <div class="icon-24px">👥</div>
                <h5>Community Action</h5>
                <p>Participate in disaster drills, check on neighbors, volunteer</p>
            </div>
        </div>
    `);
}

function switchTab(tab) {
    currentTab = tab;
    
    // Update button states
    d3.select('#cities-tab')
        .classed('active', tab === 'cities')
        .style('background', tab === 'cities' ? '#e74c3c' : '#95a5a6');
    
    d3.select('#action-tab')
        .classed('active', tab === 'action')
        .style('background', tab === 'action' ? '#3498db' : '#95a5a6');
    
    // Update visualization
    actionSvg.selectAll('*').remove();
    
    if (tab === 'cities') {
        createCitiesVisualization(actionSvg.attr('width'), actionSvg.attr('height'));
    } else {
        createActionVisualization(actionSvg.attr('width'), actionSvg.attr('height'));
    }
}

function createCitiesVisualization(width, height) {
    // Case studies data
    const caseStudies = [
        {
            city: 'New Orleans',
            year: 2005,
            hurricane: 'Katrina',
            category: 5,
            damage: 125,
            fatalities: 1836,
            unpreparedness: 'Levee failures, delayed evacuation',
            lessons: 'Infrastructure investment, better evacuation plans',
            color: '#e74c3c',
            icon: '🏙️'
        },
        {
            city: 'Houston',
            year: 2017,
            hurricane: 'Harvey',
            category: 4,
            damage: 125,
            fatalities: 107,
            unpreparedness: 'Floodplain development, inadequate drainage',
            lessons: 'Improved zoning, better flood control',
            color: '#3498db',
            icon: '🌧️'
        },
        {
            city: 'San Juan',
            year: 2017,
            hurricane: 'Maria',
            category: 5,
            damage: 90,
            fatalities: 2975,
            unpreparedness: 'Aging infrastructure, weak emergency response',
            lessons: 'Grid modernization, stronger emergency systems',
            color: '#2ecc71',
            icon: '⚡'
        },
        {
            city: 'Miami',
            year: 1992,
            hurricane: 'Andrew',
            category: 5,
            damage: 27,
            fatalities: 65,
            unpreparedness: 'Weak building codes, inadequate warning',
            lessons: 'Strict building codes, improved forecasting',
            color: '#f39c12',
            icon: '🏗️'
        }
    ];
    
    const margin = { top: 40, right: 30, bottom: 100, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const x = d3.scaleBand()
        .domain(caseStudies.map(d => d.city))
        .range([0, innerWidth])
        .padding(0.4);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(caseStudies, d => d.damage) * 1.2])
        .range([innerHeight, 0])
        .nice();
    
    const g = actionSvg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Add gridlines (using CSS class 'grid')
    g.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y)
            .ticks(6)
            .tickSize(-innerWidth)
            .tickFormat(''));
    
    // Create bars for damage
    g.selectAll('.damage-bar')
        .data(caseStudies)
        .enter()
        .append('rect')
        .attr('class', 'damage-bar')
        .attr('x', d => x(d.city))
        .attr('y', d => y(d.damage))
        .attr('width', x.bandwidth())
        .attr('height', d => innerHeight - y(d.damage))
        .attr('fill', d => d.color)
        .attr('opacity', 0.8)
        .on('mouseover', function(event, d) {
            showCityDetails(event, d);
            d3.select(this).attr('opacity', 1);
        })
        .on('mouseout', function(event, d) {
            hideTooltip();
            d3.select(this).attr('opacity', 0.8);
        });
    
    // Add damage value labels
    g.selectAll('.damage-label')
        .data(caseStudies)
        .enter()
        .append('text')
        .attr('class', 'damage-label')
        .attr('x', d => x(d.city) + x.bandwidth() / 2)
        .attr('y', d => y(d.damage) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#2c3e50')
        .text(d => `$${d.damage}B`);
    
    // Add city icons
    g.selectAll('.city-icon')
        .data(caseStudies)
        .enter()
        .append('text')
        .attr('class', 'city-icon')
        .attr('x', d => x(d.city) + x.bandwidth() / 2)
        .attr('y', innerHeight + 25)
        .attr('text-anchor', 'middle')
        .style('font-size', '24px')
        .text(d => d.icon);
    
    // Add city labels
    g.selectAll('.city-label')
        .data(caseStudies)
        .enter()
        .append('text')
        .attr('class', 'city-label')
        .attr('x', d => x(d.city) + x.bandwidth() / 2)
        .attr('y', innerHeight + 50)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text(d => d.city);
    
    // Add hurricane labels
    g.selectAll('.hurricane-label')
        .data(caseStudies)
        .enter()
        .append('text')
        .attr('class', 'hurricane-label')
        .attr('x', d => x(d.city) + x.bandwidth() / 2)
        .attr('y', innerHeight + 65)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('fill', '#666')
        .text(d => `${d.hurricane} (${d.year})`);
    
    // Add axes
    g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).tickFormat(d => `$${d}B`));
    
    // Add axis labels
    g.append('text')
        .attr('class', 'y-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -margin.left + 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Damage (Billions USD)');
    
    // Add chart title
    g.append('text')
        .attr('class', 'chart-title')
        .attr('x', innerWidth / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Lessons from Unprepared Cities');
    
    // Add fatalities visualization (circles on bars)
    g.selectAll('.fatalities-circle')
        .data(caseStudies)
        .enter()
        .append('circle')
        .attr('class', 'fatalities-circle')
        .attr('cx', d => x(d.city) + x.bandwidth() / 2)
        .attr('cy', d => y(d.damage) - 25)
        // Scale circle radius based on fatalities (size is proportional to sqrt(fatalities))
        .attr('r', d => Math.min(15, Math.sqrt(d.fatalities) * 0.3)) 
        .attr('fill', 'white')
        .attr('stroke', '#2c3e50')
        .attr('stroke-width', 1.5);
    
    g.selectAll('.fatalities-label')
        .data(caseStudies)
        .enter()
        .append('text')
        .attr('class', 'fatalities-label')
        .attr('x', d => x(d.city) + x.bandwidth() / 2)
        .attr('y', d => y(d.damage) - 25)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '9px')
        .style('font-weight', 'bold')
        .style('fill', '#2c3e50')
        .text(d => d.fatalities.toLocaleString());
    
    // Add fatalities legend
    const legend = g.append('g')
        .attr('transform', `translate(${innerWidth - 150}, 20)`);
    
    legend.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', Math.sqrt(1000) * 0.3)
        .attr('fill', 'white')
        .attr('stroke', '#2c3e50')
        .attr('stroke-width', 1.5);
    
    legend.append('text')
        .attr('x', 25)
        .attr('y', 0)
        .attr('dy', '0.35em')
        .style('font-size', '11px')
        .text('= 1,000 fatalities');
    
    // Add timeline of preparedness evolution
    const timeline = actionSvg.append('g')
        .attr('transform', `translate(${margin.left}, ${height - 60})`);
    
    timeline.append('text')
        .attr('x', 0)
        .attr('y', -10)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#2c3e50')
        .text('Evolution of Hurricane Preparedness:');
    
    const periods = [
        { year: 'Pre-1992', status: 'Reactive', color: '#e74c3c' },
        { year: '1992-2005', status: 'Building Codes', color: '#f39c12' },
        { year: '2005-2017', status: 'Evacuation Planning', color: '#3498db' },
        { year: '2017-Present', status: 'Climate Adaptation', color: '#2ecc71' }
    ];
    
    periods.forEach((period, i) => {
        const xPos = i * 180;
        
        timeline.append('rect')
            .attr('x', xPos)
            .attr('y', 0)
            .attr('width', 170)
            .attr('height', 20)
            .attr('fill', period.color)
            .attr('rx', 3)
            .attr('ry', 3);
        
        timeline.append('text')
            .attr('x', xPos + 85)
            .attr('y', 10)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('font-size', '11px')
            .style('fill', 'white')
            .style('font-weight', 'bold')
            .text(period.year);
        
        timeline.append('text')
            .attr('x', xPos + 85)
            .attr('y', 30)
            .attr('text-anchor', 'middle')
            .style('font-size', '10px')
            .style('fill', '#666')
            .text(period.status);
    });
}

function createActionVisualization(width, height) {
    // Action steps data
    const actions = [
        {
            step: 1,
            title: 'Prepare Your Home',
            description: 'Install storm shutters, reinforce roofs, clear drains',
            impact: 'Reduces damage by 40%',
            icon: '🏠',
            color: '#3498db'
        },
        {
            step: 2,
            title: 'Create Emergency Plan',
            description: 'Know evacuation routes, have emergency supplies',
            impact: 'Saves lives during disasters',
            icon: '📋',
            color: '#2ecc71'
        },
        {
            step: 3,
            title: 'Stay Informed',
            description: 'Monitor forecasts, heed evacuation orders',
            impact: 'Enables timely decisions',
            icon: '📱',
            color: '#f39c12'
        },
        {
            step: 4,
            title: 'Community Action',
            description: 'Participate in local disaster drills',
            impact: 'Strengthens community resilience',
            icon: '👥',
            color: '#9b59b6'
        },
        {
            step: 5,
            title: 'Support Climate Action',
            description: 'Advocate for policies addressing climate change',
            impact: 'Reduces hurricane intensity long-term',
            icon: '🌍',
            color: '#e74c3c'
        }
    ];
    
    // Create circular layout for action steps
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.25;
    
    // Draw connecting circle
    actionSvg.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', radius)
        .attr('fill', 'none')
        .attr('stroke', '#ecf0f1')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');
    
    // Create action nodes
    const nodes = actionSvg.selectAll('.action-node')
        .data(actions)
        .enter()
        .append('g')
        .attr('class', 'action-node')
        .attr('transform', (d, i) => {
            const angle = (i / actions.length) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            return `translate(${x}, ${y})`;
        })
        .on('mouseover', function(event, d) {
            // Highlight node
            d3.select(this).select('circle')
                .transition()
                .duration(200)
                .attr('r', 40)
                .attr('stroke-width', 3);
            
            // Show action details
            showActionDetails(event, d);
        })
        .on('mouseout', function(event, d) {
            d3.select(this).select('circle')
                .transition()
                .duration(200)
                .attr('r', 35)
                .attr('stroke-width', 2);
            
            hideTooltip();
        });
    
    // Add circles for nodes
    nodes.append('circle')
        .attr('r', 35)
        .attr('fill', d => d.color)
        .attr('opacity', 0.9)
        .attr('stroke', 'white')
        .attr('stroke-width', 2);
    
    // Add step numbers
    nodes.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .style('fill', 'white')
        .text(d => d.step);
    
    // Add icons
    nodes.append('text')
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('fill', 'white')
        .text(d => d.icon);
    
    // Add connecting lines to center
    actions.forEach((d, i) => {
        const angle = (i / actions.length) * Math.PI * 2 - Math.PI / 2;
        const x1 = centerX + Math.cos(angle) * 35;
        const y1 = centerY + Math.sin(angle) * 35;
        const x2 = centerX + Math.cos(angle) * (radius - 35);
        const y2 = centerY + Math.sin(angle) * (radius - 35);
        
        actionSvg.append('line')
            .attr('x1', x1)
            .attr('y1', y1)
            .attr('x2', x2)
            .attr('y2', y2)
            .attr('stroke', d.color)
            .attr('stroke-width', 2)
            .attr('opacity', 0.5);
    });
    
    // Add center circle
    actionSvg.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', 30)
        .attr('fill', '#2c3e50')
        .attr('stroke', 'white')
        .attr('stroke-width', 3);
    
    actionSvg.append('text')
        .attr('x', centerX)
        .attr('y', centerY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('fill', 'white')
        .text('ACT');
    
    // Add title
    actionSvg.append('text')
        .attr('x', width / 2)
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .style('fill', '#2c3e50')
        .text('Take Action Now');
    
    actionSvg.append('text')
        .attr('x', width / 2)
        .attr('y', 70)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#666')
        .text('Five Steps to Hurricane Resilience');
    
    // Add action titles around the circle
    actions.forEach((d, i) => {
        const angle = (i / actions.length) * Math.PI * 2 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * (radius + 60);
        const y = centerY + Math.sin(angle) * (radius + 60);
        
        actionSvg.append('text')
            .attr('x', x)
            .attr('y', y)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', d.color)
            .text(d.title);
    });
}

function showCityDetails(event, city) {
    const tooltip = d3.select('#action-visualization')
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
        .style('opacity', 0);
    
    tooltip.html(`
        <h4 style="color: ${city.color}">${city.city}</h4>
        <p><strong>Hurricane ${city.hurricane} (${city.year})</strong><br>
        Category ${city.category}</p>
        <p><strong>Damage:</strong> $${city.damage}B</p>
        <p><strong>Fatalities:</strong> ${city.fatalities.toLocaleString()}</p>
        <hr>
        <p><strong>Why Unprepared:</strong><br>${city.unpreparedness}</p>
        <p><strong>Lessons Learned:</strong><br>${city.lessons}</p>
    `)
    .transition()
    .duration(200)
    .style('opacity', 1);
    
    // The timeout logic is removed here as it prevents standard mouseout events from working reliably.
    // If you need it, manage it in the mouseout event handler.
    // Note: The previous use of setTimeout in the D3 mouseover event is generally poor practice.
}

function showActionDetails(event, action) {
    const tooltip = d3.select('#action-visualization')
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
        .style('opacity', 0);
    
    tooltip.html(`
        <h4 style="color: ${action.color}">Step ${action.step}: ${action.title}</h4>
        <div style="font-size: 24px; text-align: center; margin: 10px 0">${action.icon}</div>
        <p><strong>What to do:</strong><br>${action.description}</p>
        <p><strong>Impact:</strong><br>${action.impact}</p>
    `)
    .transition()
    .duration(200)
    .style('opacity', 1);
    
    // The timeout logic is removed here.
}

function hideTooltip() {
    d3.selectAll('.tooltip')
        .transition()
        .duration(200)
        .style('opacity', 0)
        .remove();
}

export function onExitPreparednessAction() {
    console.log('Exiting Preparedness & Action section');
    // Clean up tooltips
    hideTooltip();
}

// NOTE: The animation relies on hardcoded scale values (490, 40) 
// that should ideally be derived from the y-scale in createCitiesVisualization 
// for robust resizing. This is a common pattern in scrollytelling D3 modules 
// where scale context is lost in the onProgress function.

export function onProgressPreparednessAction(progress) {
    if (actionSvg && progress > 0.1) {
        if (currentTab === 'cities') {
            // Animate city bars (using hardcoded scale values for consistency with original code)
            actionSvg.selectAll('.damage-bar')
                .transition()
                .duration(1500)
                .delay((d, i) => i * 200)
                .attr('y', d => {
                    const yScale = d3.scaleLinear()
                        .domain([0, 125])
                        .range([490, 40]); // Hardcoded Y range derived from chart dimensions
                    return yScale(d.damage * progress);
                })
                .attr('height', d => {
                    const yScale = d3.scaleLinear()
                        .domain([0, 125])
                        .range([490, 40]);
                    return 490 - yScale(d.damage * progress);
                });
        } else {
            // Animate action nodes pulsing
            actionSvg.selectAll('.action-node circle')
                .transition()
                .duration(1000)
                .delay((d, i) => i * 200)
                .attr('r', 35 + Math.sin(progress * Math.PI * 2) * 5)
                .transition()
                .duration(1000)
                .attr('r', 35);
            
            // Rotate the entire visualization
            actionSvg.selectAll('.action-node')
                .transition()
                .duration(3000)
                .attr('transform', (d, i) => {
                    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2 + progress * Math.PI * 0.5; // Reduced rotation factor
                    const radius = Math.min(actionSvg.attr('width'), actionSvg.attr('height')) * 0.25;
                    const centerX = actionSvg.attr('width') / 2;
                    const centerY = actionSvg.attr('height') / 2;
                    const x = centerX + Math.cos(angle) * radius;
                    const y = centerY + Math.sin(angle) * radius;
                    return `translate(${x}, ${y})`;
                });
        }
    }
}