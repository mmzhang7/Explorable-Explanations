import * as d3 from 'd3';

const DATA_FILE = './top10_hurricane_damage_by_type.csv';

// State management
let hookSvg = null;
let chartContainer = null;
let currentData = null;
let isInitialized = false;

/**
 * Calculate responsive dimensions based on container size
 */
function calculateDimensions() {
    const container = d3.select('#hook-visualization').node();
    if (!container) return { width: 800, height: 500 }; // Fallback

    const containerWidth = container.clientWidth;
    const containerHeight = Math.max(container.clientHeight, 400); // Minimum height

    // Calculate responsive margins
    const isMobile = containerWidth < 768;

    return {
        width: containerWidth,
        height: containerHeight,
        margin: {
            top: isMobile ? 20 : 40,
            right: isMobile ? 15 : 40,
            bottom: isMobile ? 80 : 100,
            left: isMobile ? 60 : 80
        }
    };
}

/**
 * Get computed inner dimensions
 */
function getInnerDimensions(dimensions) {
    return {
        width: dimensions.width - dimensions.margin.left - dimensions.margin.right,
        height: dimensions.height - dimensions.margin.top - dimensions.margin.bottom
    };
}

/**
 * Initializes the Hook section with responsive SVG
 */
export function initializeHook() {
    console.log('Initializing responsive Hook visualization');

    const container = d3.select('#hook-visualization');
    if (container.empty()) {
        console.error('Hook visualization container not found');
        return;
    }

    // Clear previous visualization
    container.html('');

    // Calculate responsive dimensions
    const dim = calculateDimensions();
    const inner = getInnerDimensions(dim);

    // Create responsive SVG
    hookSvg = container.append('svg')
        .attr('id', 'damage-bar-chart')
        .attr('width', dim.width)
        .attr('height', dim.height)
        .attr('viewBox', `0 0 ${dim.width} ${dim.height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('background', 'transparent');

    // Create main chart group
    chartContainer = hookSvg.append('g')
        .attr('class', 'chart-container')
        .attr('transform', `translate(${dim.margin.left},${dim.margin.top})`);

    isInitialized = true;
    return { dimensions: dim, inner: inner };
}

/**
 * Load and process data
 */
async function loadData() {
    try {
        const data = await d3.csv(DATA_FILE, d => ({
            STORM_NAME: d.STORM_NAME,
            DAMAGE_TYPE: d.DAMAGE_TYPE,
            COST_MILLIONS: +d.COST_MILLIONS || 0,
            DEATHS: +d.DEATHS || 0
        }));

        // Filter to only property damage
        return data.filter(d => d.DAMAGE_TYPE === 'PROPERTY_M');
    } catch (error) {
        console.error('Error loading data:', error);
        return null;
    }
}

/**
 * Creates the bar chart with current data
 */
function createBarChart(data, dimensions) {
    if (!chartContainer || !data || data.length === 0) {
        console.error('Cannot create chart: missing container or data');
        return;
    }

    const inner = getInnerDimensions(dimensions);

    // Clear previous chart elements
    chartContainer.selectAll('*').remove();

    // Sort data by cost (descending)
    data.sort((a, b) => b.COST_MILLIONS - a.COST_MILLIONS);

    // --- Scales ---
    const x = d3.scaleBand()
        .domain(data.map(d => d.STORM_NAME))
        .range([0, inner.width])
        .padding(0.3);

    const yMax = d3.max(data, d => d.COST_MILLIONS / 1000); // Convert millions to billions
    const y = d3.scaleLinear()
        .domain([0, yMax * 1.15]) // extra space at top
        .range([inner.height, 0])
        .nice();

    const yAxis = d3.axisLeft(y)
        .ticks(6)
        .tickFormat(d => `$${d3.format('')(d)}B`); // Show in billions

    const color = d3.scaleSequential()
        .domain([0, yMax])
        .interpolator(d3.interpolateReds);

    // --- Axes ---
    // X-axis
    const xAxis = chartContainer.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${inner.height})`)
        .call(d3.axisBottom(x).tickSize(0));

    if (dimensions.width < 768) {
        xAxis.selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-45)');
    }

    // Y-axis
    chartContainer.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);

    // --- Bars ---
    const bars = chartContainer.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.STORM_NAME))
        .attr('y', inner.height)
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .attr('fill', d => color(d.COST_MILLIONS / 1000))
        .attr('rx', 4)
        .attr('stroke', '#000000ff')
        .attr('stroke-width', 1);

    bars.transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .ease(d3.easeElasticOut.amplitude(1).period(0.5))
        .attr('y', d => y(d.COST_MILLIONS / 1000))
        .attr('height', d => inner.height - y(d.COST_MILLIONS / 1000));

    // --- Labels ---
    const labels = chartContainer.selectAll('.bar-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', d => x(d.STORM_NAME) + x.bandwidth() / 2)
        .attr('y', inner.height + 5)
        .attr('text-anchor', 'middle')
        .style('font-size', dimensions.width < 768 ? '10px' : '12px')
        .style('fill', '#000')
        .style('font-weight', 'bold')
        .style('opacity', 0)
        .text(d => `$${d3.format('.2f')(d.COST_MILLIONS / 1000)}B`);

    labels.transition()
        .duration(600)
        .delay((d, i) => i * 100 + 500)
        .attr('y', d => y(d.COST_MILLIONS / 1000) - 8)
        .style('opacity', 1);

    // --- Y-axis label ---
    chartContainer.append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -inner.height / 2)
        .attr('y', -dimensions.margin.left + 15)
        .attr('text-anchor', 'middle')
        .style('font-size', dimensions.width < 768 ? '12px' : '14px')
        .style('fill', '#000')
        .text('Damage Cost (Billions USD)');

    // --- Tooltip ---
    const tooltip = d3.select('#tooltip');

    bars.on('mouseover', function(event, d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.8)
            .attr('stroke', '#333')
            .attr('stroke-width', 2);

        tooltip
            .html(`
                <strong>${d.STORM_NAME}</strong><br/>
                Damage: $${d3.format('.2f')(d.COST_MILLIONS / 1000)}B<br/>
                Fatalities: ${d.FATALITIES || 0}
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY + 10) + 'px')
            .style('opacity', 1);
    })
    .on('mousemove', function(event) {
        tooltip
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY + 10) + 'px');
    })
    .on('mouseout', function() {
        d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 1)
            .attr('stroke', '#000000ff')
            .attr('stroke-width', 1);

        tooltip.style('opacity', 0);
    });
    // --- Interactivity ---
    setupInteractivity(bars, data, x, y, dimensions);
}


/**
 * Setup hover interactions and tooltips
 */
/**
 * Setup hover interactions and tooltips - FIXED VERSION
 */
function setupInteractivity(bars, data, x, y, dimensions) {
    // Create tooltip ONCE (not inside the hover events)
    const tooltip = d3.select('body')
        .append('div')
        .attr('id', 'bar-chart-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(255, 255, 255, 0.95)')
        .style('border', '1px solid #ddd')
        .style('border-radius', '6px')
        .style('padding', '12px')
        .style('pointer-events', 'none')
        .style('box-shadow', '0 4px 20px rgba(0,0,0,0.15)')
        .style('font-family', 'inherit')
        .style('font-size', '14px')
        .style('line-height', '1.4')
        .style('z-index', '1000')
        .style('backdrop-filter', 'blur(10px)')
        .style('opacity', 0)  // Start hidden
        .style('transition', 'opacity 0.2s ease');

    bars.on('mouseover', function (event, d) {
        // Highlight bar
        d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.8)
            .attr('stroke', '#333')
            .attr('stroke-width', 2);

        // Show tooltip
        showTooltip(tooltip, event, d, dimensions);
    })
        .on('mousemove', function (event) {
            // Update tooltip position as mouse moves
            tooltip
                .style('left', (event.pageX + 15) + 'px')
                .style('top', (event.pageY - 15) + 'px');
        })
        .on('mouseout', function () {
            // Restore bar
            d3.select(this)
                .transition()
                .duration(200)
                .attr('opacity', 1)
                .attr('stroke', '#000000ff')
                .attr('stroke-width', 1);

            // Hide tooltip (but don't remove it)
            tooltip.style('opacity', 0);
        })
        .on('click', function (event, d) {
            console.log('Selected hurricane:', d.STORM_NAME);
            // You could trigger more detailed visualization here
        });
}

/**
 * Show tooltip with data
 */
function showTooltip(tooltip, event, d, dimensions) {
    const isMobile = dimensions.width < 768;

    tooltip.html(`
        <div style="margin-bottom: 8px;">
            <strong style="color: #e74c3c; font-size: ${isMobile ? '14px' : '16px'};">${d.STORM_NAME}</strong>
        </div>
        <div style="margin-bottom: 6px;">
            <span style="color: #666;">Property Damage:</span><br>
            <strong style="color: #c0392b; font-size: ${isMobile ? '14px' : '16px'};">$${d3.format('.2f')(d.COST_MILLIONS / 1000)}B</strong>
        </div>
        <div>
            <span style="color: #666;">Fatalities:</span>
            <strong style="color: #333; margin-left: 5px;">${d.DEATHS}</strong>
        </div>
    `)
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 15) + 'px')
        .style('opacity', 1);
}

/**
 * Executes the D3 visualization when entering section
 */
export async function onEnterHook() {
    console.log('Entering Hook section');

    if (!isInitialized) {
        initializeHook();
    }

    // Load data
    currentData = await loadData();

    if (!currentData) {
        showErrorMessage();
        return;
    }

    // Get current dimensions and create chart
    const dim = calculateDimensions();
    createBarChart(currentData, dim);
}

/**
 * Clean up on exit (but keep visualization)
 */
export function onExitHook() {
    console.log('Exiting Hook section - keeping visualization');

    // Optional: Add subtle effect to indicate inactive state
    if (chartContainer) {
        chartContainer.selectAll('.bar')
            .transition()
            .duration(300)
            .attr('opacity', 0.85);
    }
}

/**
 * Handle scroll progress
 */
export function onProgressHook(progress) {
    // Optional: Add parallax or other scroll-based effects
    // For now, just track progress
    // console.log('Scroll progress:', progress);
}

/**
 * Re-enter hook section
 */
export function onReenterHook() {
    console.log('Re-entering Hook section');

    if (chartContainer) {
        chartContainer.selectAll('.bar')
            .transition()
            .duration(300)
            .attr('opacity', 1);
    }
}

/**
 * Show error message if data fails to load
 */
function showErrorMessage() {
    if (chartContainer) {
        chartContainer.append('text')
            .attr('x', getInnerDimensions(calculateDimensions()).width / 2)
            .attr('y', getInnerDimensions(calculateDimensions()).height / 2)
            .attr('text-anchor', 'middle')
            .attr('fill', '#e74c3c')
            .style('font-size', '16px')
            .text('Unable to load hurricane data');
    }
}