import * as d3 from 'd3';

let actionSvg;

export function initializePreparednessAction() {
    console.log('Initializing Preparedness & Action section...');
    
    const container = d3.select('#action-visualization');
    container.html('<div class="graph-placeholder">Loading action visualization...</div>');
}

export function onEnterPreparednessAction() {
    console.log('Entering Preparedness & Action section');
    
    const container = d3.select('#action-visualization');
    const width = container.node().getBoundingClientRect().width || 800;
    const height = 550;
    
    container.html('');
    
    // Create visualization container
    const vizContainer = container.append('div')
        .attr('id', 'preparedness-viz-container');
    
    // Create visualization SVG
    actionSvg = vizContainer.append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);
    
    // Create action visualization
    createActionVisualization(width, height);
    
    // Add impact visualization (static boxes, styles defined in CSS)
    const impactContainer = container.append('div')
        .attr('class', 'impact-container');
    
    // impactContainer.html(`
    //     <h4>The Power of Preparedness</h4>
    //     <div>
    //         <div>
    //             <div class="font-2em" style="color: #e74c3c">40%</div>
    //             <div class="font-14px">Reduction in property damage with proper preparation</div>
    //         </div>
    //         <div>
    //             <div class="font-2em" style="color: #3498db">60%</div>
    //             <div class="font-14px">Faster recovery time for prepared communities</div>
    //         </div>
    //         <div>
    //             <div class="font-2em" style="color: #2ecc71">90%</div>
    //             <div class="font-14px">Evacuation compliance when communities are prepared</div>
    //         </div>
    //     </div>
    // `);
    
    // Add action steps grid (always visible, styles defined in CSS)
    const actionGrid = container.append('div')
        .attr('class', 'action-grid');
    
    // actionGrid.html(`
    //     <h4>Five Key Action Steps</h4>
    //     <div>
    //         <div>
    //             <div class="icon-24px">🏠</div>
    //             <h5>Prepare Your Home</h5>
    //             <p>Install storm shutters, reinforce roofs, clear drains and gutters</p>
    //         </div>
    //         <div>
    //             <div class="icon-24px">📋</div>
    //             <h5>Create Emergency Plan</h5>
    //             <p>Know evacuation routes, have emergency supplies for 3+ days</p>
    //         </div>
    //         <div>
    //             <div class="icon-24px">📱</div>
    //             <h5>Stay Informed</h5>
    //             <p>Monitor forecasts, heed evacuation orders, use weather apps</p>
    //         </div>
    //         <div>
    //             <div class="icon-24px">👥</div>
    //             <h5>Community Action</h5>
    //             <p>Participate in disaster drills, check on neighbors, volunteer</p>
    //         </div>
    //     </div>
    // `);
}

function createActionVisualization(width, height) {
    // Action steps data
    const actions = [
        {
            step: 1,
            title: 'Be Prepared',
            description: 'If you live in a hurricane zone, always be prepared for the possibility of any natural disaster.',
            color: '#3498db'
        },
        {
            step: 2,
            title: 'Local News',
            description: 'Pay attention to local news stations for updates, and evacuation orders about potential storms.',
            color: '#2ecc71'
        },
        {
            step: 3,
            title: 'Evacuation Plan',
            description: 'Have an evacuation plan in place for your family and know what zone you are in.',
            color: '#f39c12'
        },
        {
            step: 4,
            title: 'Support Policies',
            description: 'To help prevent the increse of future disasters help push for policies that address climate change.',
            color: '#9b59b6'
        },
        {
            step: 5,
            title: 'Storm Category',
            description: 'Don\'t trust the storm category, it is not always accurate.',
            color: '#e74c3c'
        }
    ];
    
    // Create circular layout for action steps - centered and moved down
    const centerX = width / 2;
    const centerY = height * 0.65; // Move down to 65% of height for better centering
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
    
    // Add title at the top - moved up to avoid overlap with circle
    // Circle top is at centerY - radius = height * 0.65 - radius
    // Moving title to y=20 to ensure no overlap
    actionSvg.append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .style('fill', '#2c3e50')
        .text('Take Action Now');
    
    actionSvg.append('text')
        .attr('x', width / 2)
        .attr('y', 45)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#666')
        .text('Five Steps to Hurricane Resilience');
    
    // Add action titles around the circle - moved further out to avoid overlap
    actions.forEach((d, i) => {
        const angle = (i / actions.length) * Math.PI * 2 - Math.PI / 2;
        const x = centerX + Math.cos(angle) * (radius + 90); // Increased from 60 to 90 for better spacing
        const y = centerY + Math.sin(angle) * (radius + 90);
        
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
        <p><strong>What to do:</strong><br>${action.description}</p>
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
                const centerY = actionSvg.attr('height') * 0.65; // Match the centerY from createActionVisualization
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                return `translate(${x}, ${y})`;
            });
    }
}