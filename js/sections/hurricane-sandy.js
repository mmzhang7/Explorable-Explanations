import * as d3 from 'd3';

export function initializeHurricaneSandy() {
    console.log('Initializing Hurricane Sandy section...');
    
    const container = d3.select('#sandy-visualization');
    container.html('<div class="graph-placeholder">Loading Hurricane Sandy key facts...</div>');
}
 
export function onEnterHurricaneSandy() {
    console.log('Entering Hurricane Sandy section');
    
    const container = d3.select('#sandy-visualization');
    container.html('');
    
    const factsGrid = container.append('div')
        .attr('class', 'sandy-facts-grid');
    
    const keyFacts = [
        {
            title: '254',
            fact: 'Lives lost across multiple countries',
            detail: 'Most deaths were in the US, with others in Canada and Caribbean nations'
        },
        {
            title: 'Transportation Shutdown',
            fact: 'NYC subway system flooded, airports closed, bridges damaged',
            detail: 'City came to a complete standstill for days'
        },
        {
            title: 'Unprepared Infrastructure',
            fact: 'NYC lacked storm surge barriers or adequate flood protection',
            detail: 'Critical systems were at sea level and vulnerable'
        },
        {
            title: 'Late Season Surprise',
            fact: 'October arrival caught many off-guard',
            detail: 'Despite evacuation orders, many residents underestimated the threat'
        },
    ];
    
    factsGrid.selectAll('.fact-card')
        .data(keyFacts)
        .enter()
        .append('div')
        .attr('class', 'fact-card')
        .html(d => `
            <h4>${d.title}</h4>
            <p class="fact-main">${d.fact}</p>
            <p class="fact-detail">${d.detail}</p>
        `);
}


export function onExitHurricaneSandy() {
    console.log('Exiting Hurricane Sandy section');
}

export function onProgressHurricaneSandy(progress) {
    if (progress > 0.1) {
        d3.selectAll('.fact-card')
            .style('opacity', 0)
            .transition()
            .duration(500)
            .delay((d, i) => i * 100)
            .style('opacity', 1);
    }
}

