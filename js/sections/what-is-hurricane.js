import * as d3 from 'd3';

let anatomySvg;

export function initializeWhatIsHurricane() {
    console.log('Initializing What is a Hurricane section...');
    
    const container = d3.select('#anatomy-visualization');
    container.html('<div class="graph-placeholder">Hurricane anatomy diagram will load here</div>');
}

export function onEnterWhatIsHurricane() {
    console.log('Entering What is a Hurricane section');
    
    const container = d3.select('#anatomy-visualization');
    const width = container.node().getBoundingClientRect().width || 600;
    const height = 400;
    
    container.html('');
    
    anatomySvg = container.append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);
    
    // Create hurricane diagram
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Background gradient for hurricane
    const radialGradient = anatomySvg.append('defs')
        .append('radialGradient')
        .attr('id', 'hurricane-gradient')
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');
    
    radialGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#e3f2fd');
    
    radialGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#bbdefb');
    
    // Outer bands (spiral arms)
    const spiralPoints = [];
    for (let angle = 0; angle < Math.PI * 6; angle += 0.1) {
        const radius = 100 + angle * 15;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        spiralPoints.push([x, y]);
    }
    
    const spiralLine = d3.line();
    
    // Draw spiral arms
    anatomySvg.append('path')
        .datum(spiralPoints)
        .attr('d', spiralLine)
        .attr('fill', 'none')
        .attr('stroke', '#90a4ae')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');
    
    // Eye
    anatomySvg.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', 30)
        .attr('fill', '#87CEEB')
        .attr('stroke', '#1E90FF')
        .attr('stroke-width', 3);
    
    // Eye wall
    anatomySvg.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', 60)
        .attr('fill', 'none')
        .attr('stroke', '#FF5722')
        .attr('stroke-width', 4)
        .attr('stroke-dasharray', '10,5');
    
    // Rain bands
    for (let i = 1; i <= 3; i++) {
        const radius = 80 + i * 40;
        anatomySvg.append('circle')
            .attr('cx', centerX)
            .attr('cy', centerY)
            .attr('r', radius)
            .attr('fill', 'none')
            .attr('stroke', '#4682B4')
            .attr('stroke-width', 2)
            .attr('opacity', 0.7);
    }
    
    // Labels with arrows
    const labels = [
        { 
            text: 'Eye', 
            x: centerX, 
            y: centerY - 40,
            line: { x1: centerX, y1: centerY - 30, x2: centerX, y2: centerY - 10 }
        },
        { 
            text: 'Eye Wall', 
            x: centerX, 
            y: centerY - 90,
            line: { x1: centerX, y1: centerY - 70, x2: centerX + 40, y2: centerY - 40 }
        },
        { 
            text: 'Rain Bands', 
            x: centerX, 
            y: centerY + 150,
            line: { x1: centerX, y1: centerY + 130, x2: centerX, y2: centerY + 110 }
        },
        { 
            text: 'Spiral Arms', 
            x: centerX + 180, 
            y: centerY - 50,
            line: { x1: centerX + 150, y1: centerY - 40, x2: centerX + 120, y2: centerY - 30 }
        }
    ];
    
    labels.forEach(label => {
        // Draw connecting line
        anatomySvg.append('line')
            .attr('x1', label.line.x1)
            .attr('y1', label.line.y1)
            .attr('x2', label.line.x2)
            .attr('y2', label.line.y2)
            .attr('stroke', '#2c3e50')
            .attr('stroke-width', 1.5)
            .attr('marker-end', 'url(#arrow)');
        
        // Add label text
        anatomySvg.append('text')
            .attr('x', label.x)
            .attr('y', label.y)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .style('fill', '#2c3e50')
            .style('background', 'white')
            .style('padding', '2px 6px')
            .attr('rx', '4')
            .attr('ry', '4')
            .text(label.text);
    });
    
    // Add arrow marker
    anatomySvg.append('defs')
        .append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 5)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#2c3e50');
    
    // Add wind direction indicators
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 200;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        // Wind arrows
        anatomySvg.append('path')
            .attr('d', `M${x},${y} L${x - Math.cos(angle) * 20},${y - Math.sin(angle) * 20}`)
            .attr('stroke', '#3498db')
            .attr('stroke-width', 2)
            .attr('marker-end', 'url(#wind-arrow)');
    }
    
    // Wind arrow marker
    anatomySvg.append('defs')
        .append('marker')
        .attr('id', 'wind-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#3498db');
    
    // Add title
    anatomySvg.append('text')
        .attr('x', width / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .style('fill', '#2c3e50')
        .text('Anatomy of a Hurricane');
    
    // Add scale indicator
    anatomySvg.append('text')
        .attr('x', width - 20)
        .attr('y', height - 20)
        .attr('text-anchor', 'end')
        .style('font-size', '12px')
        .style('fill', '#666')
        .text('← Counterclockwise rotation in Northern Hemisphere');
}

export function onExitWhatIsHurricane() {
    console.log('Exiting What is a Hurricane section');
}

export function onProgressWhatIsHurricane(progress) {
    // Animate spiral rotation
    if (anatomySvg && progress > 0.3) {
        const rotation = progress * 360;
        anatomySvg.selectAll('path')
            .filter(d => d && d.length > 10) // Select spiral
            .transition()
            .duration(1000)
            .attr('transform', `rotate(${rotation}, ${anatomySvg.attr('width') / 2}, ${anatomySvg.attr('height') / 2})`);
    }
}