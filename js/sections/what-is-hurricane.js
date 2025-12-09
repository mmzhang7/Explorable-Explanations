import * as d3 from 'd3';

let anatomySvg;
let tooltip;

// Data for hurricane elements
const hurricaneElements = [
    { name: 'Eye', cx: 300, cy: 200, r: 30, description: 'The calm center of the hurricane with the lowest pressure.' },
    { name: 'Eye Wall', cx: 300, cy: 200, r: 60, description: 'Ring of intense thunderstorms surrounding the eye; strongest winds.' },
    { name: 'Rain Bands', cx: 300, cy: 200, r: 120, description: 'Bands of heavy rain and storms spiraling out from the eye wall.' },
    { name: 'Spiral Arms', cx: 300, cy: 200, r: 180, description: 'Outer curved cloud bands that spiral around the storm.' }
];

export function initializeWhatIsHurricane() {
    const container = d3.select('#anatomy-visualization');
    container.html('<div class="graph-placeholder">Hurricane diagram will load here</div>');
}

export function onEnterWhatIsHurricane() {
    const container = d3.select('#anatomy-visualization');
    const width = container.node().getBoundingClientRect().width || 600;
    const height = 500;

    container.html('');

    tooltip = d3.select('#tooltip');

    anatomySvg = container.append('svg')
        .attr('width', width)
        .attr('height', height);

    // Draw hurricane elements
    hurricaneElements.forEach(el => {
        anatomySvg.append('circle')
            .attr('cx', el.cx)
            .attr('cy', el.cy)
            .attr('r', el.r)
            .attr('fill', 'none')
            .attr('stroke', '#1E88E5')
            .attr('stroke-width', el.name === 'Eye' ? 3 : 2)
            .attr('stroke-dasharray', el.name === 'Eye' ? '0' : '6,4');
    });

    // Labels with arrows
    hurricaneElements.forEach((el, i) => {
        const labelX = el.cx + el.r + 20;
        const labelY = el.cy - el.r + i * 40;

        anatomySvg.append('line')
            .attr('x1', el.cx + Math.cos(Math.PI/4) * el.r)
            .attr('y1', el.cy - Math.sin(Math.PI/4) * el.r)
            .attr('x2', labelX - 10)
            .attr('y2', labelY - 10)
            .attr('stroke', '#333')
            .attr('stroke-width', 1.5)
            .attr('marker-end', 'url(#arrowhead)');

        anatomySvg.append('text')
            .attr('x', labelX)
            .attr('y', labelY)
            .text(el.name)
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .style('fill', '#1a237e')
            .style('cursor', 'pointer')
            .on('click', () => {
                tooltip.html(`<strong>${el.name}</strong><br>${el.description}`)
                    .style('opacity', 1)
                    .style('left', (labelX + 20) + 'px')
                    .style('top', (labelY) + 'px');
            });
    });

    // Arrowhead marker
    anatomySvg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 5)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#333');
}

export function onExitWhatIsHurricane() {
    if (anatomySvg) anatomySvg.remove();
    if (tooltip) tooltip.style('opacity', 0);
}

export function onProgressWhatIsHurricane(progress) {
    // Optional scroll animations
}
