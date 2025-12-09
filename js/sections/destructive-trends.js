import * as d3 from 'd3';

let destructiveSvg, trendSvg;
let currentView = 'damage'; // 'damage' or 'trend'

export function initializeDestructiveTrends() {
    console.log('Initializing Destructive & Trends section...');
    
    const container = d3.select('#destructive-visualization');
    container.html('<div class="graph-placeholder">Loading hurricane damage and trend visualizations...</div>');
}

export function onEnterDestructiveTrends() {
    console.log('Entering Destructive & Trends section');
    
    
    const container = d3.select('#destructive-visualization');
    const width = container.node().getBoundingClientRect().width || 800;
    const height = 500;
    
    container.html('');
    
    // Create toggle buttons (styles defined in CSS)
    const toggleContainer = container.append('div')
        .attr('class', 'view-toggle');
    
    toggleContainer.append('button')
        .attr('id', 'damage-view-btn')
        .attr('class', 'toggle-btn active')
        .text('Damage by Category')
        // Set specific active color (retained in JS because it matches the chart color)
        .style('background', '#e74c3c') 
        .on('click', () => switchView('damage'));
    
    toggleContainer.append('button')
        .attr('id', 'trend-view-btn')
        .attr('class', 'toggle-btn')
        .text('Increasing Trends')
        // Set default non-active color and specific active color
        .style('background', '#95a5a6') 
        .on('click', () => switchView('trend'));
    
    // Create visualization container
    const vizContainer = container.append('div')
        .attr('id', 'destructive-viz-container');
    
    // Create both SVGs (styles defined in CSS/HTML for container)
    destructiveSvg = vizContainer.append('svg')
        .attr('id', 'damage-svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('display', 'block')
        .style('visibility', 'visible');
    
    trendSvg = vizContainer.append('svg')
        .attr('id', 'trend-svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('display', 'none')
        .style('visibility', 'hidden');
    
    // Create damage visualization
    createDamageVisualization(width, height);
    
    // Create trend visualization
    createTrendVisualization(width, height);
    
    // Add combined insights (content/structure retained in JS)
    const insights = container.append('div')
        .attr('class', 'combined-insights');
    
    insights.html(`
        <h4>Key Insights</h4>
        <div>
            <div>
                <h5>Damage Escalation</h5>
                <p>Damage increases exponentially with category. A **Category 5** hurricane causes far more damage than Category 1.</p>
            </div>
            <div>
                <h5>Trend Analysis</h5>
                <p>In the last 100 years, the number of tropical storms has increased by <b>272%</b></p>
            </div>
            <div>
                <h5>Climate Connection</h5>
                <p>Warmer oceans (+1°C) increase hurricane rainfall by **7%** and intensity by **3-5%**.</p>
            </div>
        </div>
    `);
}

function switchView(view) {
    currentView = view;
    
    // Update button states (using classes defined in CSS for common styles)
    d3.select('#damage-view-btn')
        .classed('active', view === 'damage')
        // Use specific colors for active state
        .style('background', view === 'damage' ? '#e74c3c' : '#95a5a6'); 
    
    d3.select('#trend-view-btn')
        .classed('active', view === 'trend')
        // Use specific colors for active state
        .style('background', view === 'trend' ? '#3498db' : '#95a5a6');
    
    // Show/hide visualizations
    if (view === 'damage') {
        destructiveSvg.style('display', 'block').style('visibility', 'visible');
        trendSvg.style('display', 'none').style('visibility', 'hidden');
    } else {
        destructiveSvg.style('display', 'none').style('visibility', 'hidden');
        trendSvg.style('display', 'block').style('visibility', 'visible');
    }
}

function createDamageVisualization(width, height) {
    // Data for damage by hurricane category
    const categories = [
        { category: 'Cat 1', winds: '74-95 mph', damage: 'Minimal', cost: 1, color: '#4CAF50' },
        { category: 'Cat 2', winds: '96-110 mph', damage: 'Moderate', cost: 5, color: '#FFC107' },
        { category: 'Cat 3', winds: '111-129 mph', damage: 'Extensive', cost: 20, color: '#FF9800' },
        { category: 'Cat 4', winds: '130-156 mph', damage: 'Extreme', cost: 50, color: '#F44336' },
        { category: 'Cat 5', winds: '157+ mph', damage: 'Catastrophic', cost: 100, color: '#B71C1C' }
    ];
    
    const margin = { top: 40, right: 30, bottom: 80, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const x = d3.scaleBand()
        .domain(categories.map(d => d.category))
        .range([0, innerWidth])
        .padding(0.3);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(categories, d => d.cost)])
        .range([innerHeight, 0])
        .nice();
    
    const g = destructiveSvg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Add gridlines (using CSS class 'grid')
    g.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y)
            .ticks(6)
            .tickSize(-innerWidth)
            .tickFormat(''));
    
    // Create bars
    g.selectAll('.bar')
        .data(categories)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.category))
        .attr('y', d => y(d.cost))
        .attr('width', x.bandwidth())
        .attr('height', d => innerHeight - y(d.cost))
        .attr('fill', d => d.color)
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('opacity', 0.8) // Set default opacity
        .on('mouseover', function(event, d) {
            showDamageTooltip(event, d);
            d3.select(this).attr('opacity', 1.0);
        })
        .on('mouseout', function(event, d) {
            hideTooltip();
            d3.select(this).attr('opacity', 0.8);
        });
    
    // Add value labels
    g.selectAll('.bar-label')
        .data(categories)
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', d => x(d.category) + x.bandwidth() / 2)
        .attr('y', d => y(d.cost) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#2c3e50')
        .text(d => `$${d.cost}B`);
    
    // Add axes
    g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x));
    
    g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).tickFormat(d => `$${d}B`));
    
    // Add axis labels
    g.append('text')
        .attr('class', 'x-label')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Hurricane Category');
    
    g.append('text')
        .attr('class', 'y-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -margin.left + 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Estimated Damage (Billions USD)');
    
    // Add chart title
    g.append('text')
        .attr('class', 'chart-title')
        .attr('x', innerWidth / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Exponential Damage Increase by Category');
    
    // Add damage mechanisms visualization
    const damageTypes = destructiveSvg.append('g')
        .attr('transform', `translate(${width - 250}, 50)`);
    
    const mechanisms = [
        { type: 'Wind', icon: '💨', percent: 40, color: '#FF9800' },
        { type: 'Storm Surge', icon: '🌊', percent: 30, color: '#2196F3' },
        { type: 'Rainfall', icon: '🌧️', percent: 20, color: '#4CAF50' },
        { type: 'Tornadoes', icon: '🌪️', percent: 10, color: '#9C27B0' }
    ];
    
    mechanisms.forEach((mechanism, i) => {
        const yPos = i * 50;
        
        damageTypes.append('text')
            .attr('x', 0)
            .attr('y', yPos)
            .style('font-size', '24px')
            .text(mechanism.icon);
        
        damageTypes.append('rect')
            .attr('x', 30)
            .attr('y', yPos - 10)
            .attr('width', mechanism.percent * 2)
            .attr('height', 20)
            .attr('fill', mechanism.color)
            .attr('rx', 3)
            .attr('ry', 3);
        
        damageTypes.append('text')
            .attr('x', 40 + mechanism.percent * 2)
            .attr('y', yPos + 5)
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .text(`${mechanism.percent}%`);
        
        damageTypes.append('text')
            .attr('x', 30)
            .attr('y', yPos + 30)
            .style('font-size', '11px')
            .style('fill', '#666')
            .text(mechanism.type);
    });
    
    damageTypes.append('text')
        .attr('x', 0)
        .attr('y', -20)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#2c3e50')
        .text('Damage Breakdown:');
}

function createTrendVisualization(width, height) {
    d3.csv('./data/decade_hurricaneTotal_data.csv').then(data => {
        data.forEach(d => {
            d['Tropical Storms'] = +d['Tropical Storms'];
            d.Hurricanes = +d.Hurricanes;
            d['Major Hurricanes'] = +d['Major Hurricanes'];
            const decadeMatch = d.Decade.match(/^(\d{4})/);
            d.startYear = decadeMatch ? +decadeMatch[1] : null;
        });

        const sortedData = data
            .filter(d => d.startYear !== null)
            .sort((a, b) => a.startYear - b.startYear);

        const decadeData = sortedData.map(d => ({
            year: d.startYear + 5,
            tropicalStorms: d['Tropical Storms'],
            hurricanes: d.Hurricanes,
            majorHurricanes: d['Major Hurricanes']
        }));

        const minYear = Math.floor(decadeData[0].year / 10) * 10;
        const maxYear = Math.ceil(decadeData[decadeData.length - 1].year / 10) * 10;
        const years = d3.range(minYear, maxYear + 1);
        
        const interpolate = (year, property) => {
            if (year < decadeData[0].year) {
                return decadeData[0][property];
            }
            if (year > decadeData[decadeData.length - 1].year) {
                return decadeData[decadeData.length - 1][property];
            }
            
            let before = decadeData[0];
            let after = decadeData[decadeData.length - 1];
            
            for (let i = 0; i < decadeData.length - 1; i++) {
                if (year >= decadeData[i].year && year <= decadeData[i + 1].year) {
                    before = decadeData[i];
                    after = decadeData[i + 1];
                    break;
                }
            }
            
            if (before.year === after.year) {
                return before[property];
            }
            const t = (year - before.year) / (after.year - before.year);
            return before[property] + (after[property] - before[property]) * t;
        };
        
        const tropicalStormsTrend = years.map(year => interpolate(year, 'tropicalStorms'));
        const hurricanesTrend = years.map(year => interpolate(year, 'hurricanes'));
        const majorHurricanesTrend = years.map(year => interpolate(year, 'majorHurricanes'));

        const margin = { top: 40, right: 30, bottom: 60, left: 70 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        
        const x = d3.scaleLinear()
            .domain([minYear, maxYear])
            .range([0, innerWidth]);
        
        const maxValue = d3.max(tropicalStormsTrend);
        
        const y = d3.scaleLinear()
            .domain([0, maxValue * 1.1])
            .range([innerHeight, 0])
            .nice();
        
        const g = trendSvg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        g.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(y)
                .ticks(8)
                .tickSize(-innerWidth)
                .tickFormat(''));
        
        const line = d3.line()
            .x((d, i) => x(years[i]))
            .y(d => y(d))
            .curve(d3.curveMonotoneX);
        
        // Create line for tropical storms
        g.append('path')
            .datum(tropicalStormsTrend)
            .attr('class', 'line-tropical-storms')
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', '#2ecc71')
            .attr('stroke-width', 3);
        
        // Create line for hurricanes
        g.append('path')
            .datum(hurricanesTrend)
            .attr('class', 'line-hurricanes')
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', '#3498db')
            .attr('stroke-width', 3);
        
        // Create line for major hurricanes
        g.append('path')
            .datum(majorHurricanesTrend)
            .attr('class', 'line-major-hurricanes')
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', '#e74c3c')
            .attr('stroke-width', 3)
            .attr('stroke-dasharray', '5,5');
        
        const tropicalStormsPoints = decadeData.map(d => ({
            year: d.year,
            value: d.tropicalStorms
        }));
        g.selectAll('.point-tropical-storms')
            .data(tropicalStormsPoints)
            .enter()
            .append('circle')
            .attr('class', 'point-tropical-storms')
            .attr('cx', d => x(d.year))
            .attr('cy', d => y(d.value))
            .attr('r', 4)
            .attr('fill', '#2ecc71')
            .attr('stroke', 'white')
            .attr('stroke-width', 1.5);
        
        const hurricanesPoints = decadeData.map(d => ({
            year: d.year,
            value: d.hurricanes
        }));
        g.selectAll('.point-hurricanes')
            .data(hurricanesPoints)
            .enter()
            .append('circle')
            .attr('class', 'point-hurricanes')
            .attr('cx', d => x(d.year))
            .attr('cy', d => y(d.value))
            .attr('r', 4)
            .attr('fill', '#3498db')
            .attr('stroke', 'white')
            .attr('stroke-width', 1.5);
        
        const majorHurricanesPoints = decadeData.map(d => ({
            year: d.year,
            value: d.majorHurricanes
        }));
        g.selectAll('.point-major-hurricanes')
            .data(majorHurricanesPoints)
            .enter()
            .append('circle')
            .attr('class', 'point-major-hurricanes')
            .attr('cx', d => x(d.year))
            .attr('cy', d => y(d.value))
            .attr('r', 4)
            .attr('fill', '#e74c3c')
            .attr('stroke', 'white')
            .attr('stroke-width', 1.5);
        
        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(Math.min(12, Math.floor((maxYear - minYear) / 20))));
        
        g.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(y).ticks(8));
        
        g.append('text')
            .attr('class', 'x-label')
            .attr('x', innerWidth / 2)
            .attr('y', innerHeight + margin.bottom - 10)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .text('Year');
        
        g.append('text')
            .attr('class', 'y-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -innerHeight / 2)
            .attr('y', -margin.left + 20)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .text('Number of Storms');
        
        g.append('text')
            .attr('class', 'chart-title')
            .attr('x', innerWidth / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text('Hurricane Trends Over Time (1850-2020)');
        

        const legend = g.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${innerWidth - 200}, 20)`);
        
        const legendData = [
            { label: 'Tropical Storms', color: '#2ecc71', stroke: 'none' },
            { label: 'Hurricanes', color: '#3498db', stroke: 'none' },
            { label: 'Major Hurricanes', color: '#e74c3c', stroke: '5,5' }
        ];
        
        legendData.forEach((item, i) => {
            const legendRow = legend.append('g')
                .attr('transform', `translate(0, ${i * 25})`);
            
            legendRow.append('line')
                .attr('x1', 0)
                .attr('x2', 30)
                .attr('y1', 0)
                .attr('y2', 0)
                .attr('stroke', item.color)
                .attr('stroke-width', 3)
                .attr('stroke-dasharray', item.stroke);
            
            legendRow.append('text')
                .attr('x', 40)
                .attr('y', 5)
                .style('font-size', '12px')
                .style('fill', '#2c3e50')
                .text(item.label);
        });
    });
}

function showDamageTooltip(event, data) {
    const tooltip = d3.select('#destructive-visualization')
        .append('div')
        .attr('class', 'tooltip') // Use CSS class
        .style('position', 'absolute')
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
        .style('opacity', 0);
    
    const examples = {
        'Cat 1': 'Humberto (2007): $50M damage',
        'Cat 2': 'Frances (2004): $9B damage',
        // Note: Katrina and Harvey are often grouped as $125B+ (2017/2022 adjusted)
        'Cat 3': 'Katrina (2005): $125B damage', 
        'Cat 4': 'Harvey (2017): $125B damage',
        'Cat 5': 'Andrew (1992): $27B damage' // Note: High wind, but localized vs flooding
    };
    
    tooltip.html(`
        <strong>${data.category}: ${data.damage} Damage</strong><br>
        Winds: ${data.winds}<br>
        Avg. Damage: $${data.cost}B (Relative Scale)<br>
        Example: ${examples[data.category]}
    `)
    .transition()
    .duration(200)
    .style('opacity', 1);
}

function hideTooltip() {
    d3.selectAll('.tooltip')
        .transition()
        .duration(200)
        .style('opacity', 0)
        .remove();
}

export function onExitDestructiveTrends() {
    console.log('Exiting Destructive & Trends section');
    hideTooltip();
}

export function onProgressDestructiveTrends(progress) {
    if (currentView === 'damage' && destructiveSvg && progress > 0.2) {
        // Animate damage bars
        destructiveSvg.selectAll('.bar')
            .transition()
            .duration(1000)
            .delay((d, i) => i * 100)
            .attr('y', d => {
                const innerHeight = 420; 
                const topMargin = 40; 
                const yRangeMax = innerHeight + topMargin;
                const yRangeMin = topMargin;
                
                const yScale = d3.scaleLinear()
                    .domain([0, 100])
                    .range([yRangeMax, yRangeMin]); 
                return yScale(d.cost * progress);
            })
            .attr('height', d => {
                const innerHeight = 420; 
                const topMargin = 40; 
                const yRangeMax = innerHeight + topMargin;
                const yRangeMin = topMargin;
                
                const yScale = d3.scaleLinear()
                    .domain([0, 100])
                    .range([yRangeMax, yRangeMin]); 
                return yRangeMax - yScale(d.cost * progress);
            });
    } else if (currentView === 'trend' && trendSvg && progress > 0.3) {
        const tropicalStormsLine = trendSvg.select('.line-tropical-storms').node();
        const hurricanesLine = trendSvg.select('.line-hurricanes').node();
        const majorHurricanesLine = trendSvg.select('.line-major-hurricanes').node();
        
        if (tropicalStormsLine) {
            const tropicalStormsLength = tropicalStormsLine.getTotalLength();
            trendSvg.select('.line-tropical-storms')
                .attr('stroke-dasharray', tropicalStormsLength + ' ' + tropicalStormsLength)
                .attr('stroke-dashoffset', tropicalStormsLength)
                .transition()
                .duration(2000)
                .attr('stroke-dashoffset', 0);
        }
        
        if (hurricanesLine) {
            const hurricanesLength = hurricanesLine.getTotalLength();
            trendSvg.select('.line-hurricanes')
                .attr('stroke-dasharray', hurricanesLength + ' ' + hurricanesLength)
                .attr('stroke-dashoffset', hurricanesLength)
                .transition()
                .duration(2000)
                .delay(300)
                .attr('stroke-dashoffset', 0);
        }
        
        if (majorHurricanesLine) {
            const majorHurricanesLength = majorHurricanesLine.getTotalLength();
            trendSvg.select('.line-major-hurricanes')
                .attr('stroke-dasharray', majorHurricanesLength + ' ' + majorHurricanesLength)
                .attr('stroke-dashoffset', majorHurricanesLength)
                .transition()
                .duration(2000)
                .delay(600)
                .attr('stroke-dashoffset', 0);
        }
    }
}