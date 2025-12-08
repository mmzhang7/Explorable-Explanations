import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

let hookSvg;

/**
 * Initializes the Hook section with a placeholder message.
 */
export function initializeHook() {
    console.log('Initializing Hook section...');
    
    const container = d3.select('#hook-visualization');
    
    // Add placeholder initially
    container.html('<div class="graph-placeholder">Hurricane frequency visualization loading...</div>');
}

/**
 * Executes the D3 visualization when the user enters the section (e.g., via scroll).
 */
export function onEnterHook() {
    console.log('Entering Hook section');
    
    
    const container = d3.select('#hook-visualization');
    const width = container.node().getBoundingClientRect().width || 600;
    const height = 400;
    
    // Clear placeholder
    container.html('');
    
    // Create SVG
    hookSvg = container.append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
    
    // Create dummy data for hurricane frequency (2000-2022)
    const years = d3.range(2000, 2023);
    const frequencies = years.map(() => Math.floor(Math.random() * 20) + 5);
    
    // Add some pattern to make it look real (these are the annotated peak years)
    frequencies[5] = 25; // 2005 - Katrina year
    frequencies[12] = 28; // 2012 - Sandy year (Note: code annotates 2017 and 2020, not 2012)
    frequencies[17] = 30; // 2017 - Harvey, Irma, Maria
    frequencies[20] = 27; // 2020 - Record season
    
    // Create scales
    const margin = { top: 40, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const x = d3.scaleBand()
        .domain(years)
        .range([0, innerWidth])
        .padding(0.2);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(frequencies)])
        .range([innerHeight, 0])
        .nice();
    
    // Create group for chart
    const g = hookSvg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create gradient for bars (This is embedded D3-specific content)
    const gradient = hookSvg.append('defs')
        .append('linearGradient')
        .attr('id', 'bar-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');
    
    gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#3498db');
    
    gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#2980b9');
    
    // Create bars
    g.selectAll('rect')
        .data(frequencies)
        .enter()
        .append('rect')
        .attr('x', (d, i) => x(years[i]))
        .attr('y', d => y(d))
        .attr('width', x.bandwidth())
        .attr('height', d => innerHeight - y(d))
        .attr('fill', 'url(#bar-gradient)')
        .attr('rx', 3) // Rounded corners
        .attr('ry', 3);
    
    // Add axes
    const xAxis = d3.axisBottom(x)
        .tickValues(years.filter((d, i) => i % 3 === 0))
        .tickFormat(d => d.toString());
    
    const yAxis = d3.axisLeft(y)
        .ticks(6);
    
    g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');
    
    g.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);
    
    // Add axis labels
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
        .text('Number of Hurricanes');
    
    // Add chart title
    g.append('text')
        .attr('class', 'chart-title')
        .attr('x', innerWidth / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Atlantic Hurricane Frequency (2000-2022)');
    
    // Add annotation for peak years
    const annotations = [
        { year: 2005, text: 'Katrina', yOffset: -25 },
        { year: 2017, text: 'Harvey, Irma, Maria', yOffset: -40 },
        { year: 2020, text: 'Record season', yOffset: -25 }
    ];
    
    annotations.forEach(anno => {
        const yearIndex = years.indexOf(anno.year);
        if (yearIndex !== -1) {
            g.append('line')
                .attr('x1', x(years[yearIndex]) + x.bandwidth() / 2)
                .attr('y1', y(frequencies[yearIndex]) - 5)
                .attr('x2', x(years[yearIndex]) + x.bandwidth() / 2)
                .attr('y2', y(frequencies[yearIndex]) + anno.yOffset)
                .attr('stroke', '#e74c3c')
                .attr('stroke-width', 1.5)
                .attr('stroke-dasharray', '3,3');
            
            g.append('text')
                .attr('x', x(years[yearIndex]) + x.bandwidth() / 2)
                .attr('y', y(frequencies[yearIndex]) + anno.yOffset - 5)
                .attr('text-anchor', 'middle')
                .style('font-size', '11px')
                .style('fill', '#e74c3c')
                .style('font-weight', 'bold')
                .text(anno.text);
        }
    });
}

/**
 * Cleans up the visualization resources on exit.
 */
export function onExitHook() {
    console.log('Exiting Hook section');
    // Optional cleanup: remove the SVG if memory is a concern or you want a full reset
    if (hookSvg) {
        hookSvg.remove();
        hookSvg = null;
    }
}

/**
 * Handles animation or interaction based on scroll progress.
 * @param {number} progress - A value typically between 0 and 1 indicating scroll progress.
 */
export function onProgressHook(progress) {
    // Optional: Animate bars on scroll progress
    if (hookSvg && progress > 0.1) {
        hookSvg.selectAll('rect')
            .transition()
            .duration(500)
            .attr('opacity', 0.8 + progress * 0.2);
    }
}