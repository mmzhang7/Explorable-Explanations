import * as d3 from 'd3';

let trendSvg;

export function initializeDestructiveTrends() {
    console.log('Initializing Destructive & Trends section...');
    
    const container = d3.select('#destructive-visualization');
    container.html('<div class="graph-placeholder">Loading hurricane trend visualization...</div>');
}

export function onEnterDestructiveTrends() {
    console.log('Entering Destructive & Trends section');
    
    
    const container = d3.select('#destructive-visualization');
    const width = container.node().getBoundingClientRect().width || 800;
    const height = 500;
    
    container.html('');
    
    // Create visualization container
    const vizContainer = container.append('div')
        .attr('id', 'destructive-viz-container');
    
    // Create trend SVG
    trendSvg = vizContainer.append('svg')
        .attr('id', 'trend-svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('display', 'block')
        .style('visibility', 'visible');
    
    // Create trend visualization
    createTrendVisualization(width, height);
    
    // Add key insights
    const insights = container.append('div')
        .attr('class', 'combined-insights');
    
    insights.html(`
        <h4>Key Insights</h4>
        <div>
            <div>
                <h5>Tropical Storms</h5>
                <p>In the last 100 years, the number of tropical storms has increased by <b>272%</b></p>
            </div>
            <div>
                <h5>Major Hurricanes</h5>
                <p>Since 1990, the number of major hurricanes have jumped up significantly, and so far from 2021-2024 we have already seen 14 major hurricanes with the number quickly rising.</p>
            </div>
        </div>
    `);
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

export function onExitDestructiveTrends() {
    console.log('Exiting Destructive & Trends section');
}

export function onProgressDestructiveTrends(progress) {
    if (trendSvg && progress > 0.3) {
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