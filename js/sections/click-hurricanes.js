// js/sections/click-hurricanes.js
import * as d3 from 'd3';
import * as topojson from 'https://cdn.jsdelivr.net/npm/topojson-client@3/+esm';
import { initializeIdaViewer, IDA_TIMESTAMPS, setIdaTimestamp } from '../ida_viewer.js';
import { initializeHarveyViewer, HARVEY_TIMESTAMPS, setHarveyTimestamp} from '../harvey_viewer.js';
import { initializeIanViewer, IAN_TIMESTAMPS, setIanTimestamp } from '../ian_viewer.js';
import { initializeIrmaViewer, IRMA_TIMESTAMPS, setIrmaTimestamp } from '../irma_viewer.js';

let svg, mapGroup, landGroup, stormGroup;
let projection, pathGenerator;
let zoom;
let originalStormPositions = [];
let isGlobeInitialized = false;

let width = 800;
let height = 600;
let tooltip;

const harveyCoords = HARVEY_TIMESTAMPS.map(d => [d.lon, d.lat]);

const harveyBounds = d3.geoBounds({
  type: "Feature",
  geometry: {
    type: "MultiPoint",
    coordinates: harveyCoords
  }
});

const ianCoords = IAN_TIMESTAMPS.map(d => [d.lon, d.lat]);

const ianBounds = d3.geoBounds({
  type: "Feature",
  geometry: {
    type: "MultiPoint",
    coordinates: ianCoords
  }
});

const idaCoords = IDA_TIMESTAMPS.map(d => [d.lon, d.lat]);

const idaBounds = d3.geoBounds({
  type: "Feature",
  geometry: {
    type: "MultiPoint",
    coordinates: idaCoords
  }
});

const irmaCoords = IRMA_TIMESTAMPS.map(d => [d.lon, d.lat]);

const irmaBounds = d3.geoBounds({
  type: "Feature",
  geometry: {
    type: "MultiPoint",
    coordinates: irmaCoords
  }
});


function showStormTooltip(event, storm) {
    if (!tooltip) return;

    tooltip.html(`
        <strong>${storm.name}</strong><br>
        Click to view detailed data
    `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
        .transition()
        .duration(200)
        .style('opacity', 1);
}

function hideStormTooltip() {
    if (!tooltip) return;

    tooltip.transition()
        .duration(200)
        .style('opacity', 0);
}

export function initializeClickHurricanes() {
    console.log('Initializing Click Hurricanes section...');

    const container = d3.select('#cities-visualization');
    container.html('<div class="graph-placeholder">Interactive globe loading...</div>');
}

// js/sections/click-hurricanes.js (Revised onEnterClickHurricanes)

export function onEnterClickHurricanes() {
    console.log('Entering Click Hurricanes section');
    d3.select('globe svg').remove();

    const container = d3.select('#cities-visualization');
    // Calculate dimensions
    width = container.node().getBoundingClientRect().width || 500;
    height = Math.min(width * 0.75, 500);

    container.html('');

    // --- STEP 1: Implement a 2-Column Grid Layout inside the .visualization container ---
    // This allows the globe to take one column and the panel/controls the other.
    
    // Set the .visualization container to be a dynamic grid
    container.style('display', 'grid')
             .style('grid-template-columns', '70% 30%') // 50/50 split
             .style('gap', '20px')
             .style('padding', '0');
    
    // --- Column 1: Globe Wrapper ---
    const globeWrapper = container.append('div').attr('id', 'globe-wrapper');
    
    // Place Globe in Left Column (uses existing globe-container styles for background/border)
    globeWrapper.append('div')
        .attr('id', 'globe-container')
        .style('height', `${height}px`);
    
    d3.select('#globe-container').append('div').attr('id', 'globe');


    // --- Column 2: Panel and Controls Column ---
    const panelColumn = container.append('div')
        .attr('id', 'panel-column')
        .style('display', 'flex')
        .style('flex-direction', 'column')
        .style('justify-content', 'center') // Center content vertically
        .style('padding-top', '50px');
    
    
    // Place Viewers Container in Right Column (Panels will flow here naturally)
    const viewersContainer = panelColumn.append('div')
        .attr('id', 'hurricane-viewers'); // This is where the viewer panels are attached

    // Individual viewer panels
    const viewers = ['ida', 'harvey', 'ian', 'irma'];
    viewers.forEach(viewer => {
        viewersContainer.append('div')
            .attr('id', `${viewer}-viewer`)
            .attr('class', 'viewer-panel hidden');
    });

    // Place Controls and Instructions below the panels in the Right Column
    panelColumn.append('div')
        .attr('class', 'globe-controls'); // Controls

    panelColumn.append('p')
        .attr('class', 'instructions') // Instructions
        .text('Click on any hurricane marker to zoom in and view detailed data');

    // Initialize the globe visualization
    initializeGlobe();
}

function initializeGlobe() {
    const container = d3.select('#globe');

    // projection and path generator
    projection = d3.geoNaturalEarth1()
        .center([-82, 27])
        .scale(width * 1.3)
        .translate([width / 2, height / 2]);

    pathGenerator = d3.geoPath(projection);

    // SVG container
    svg = container.append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('width', width)
        .attr('height', height)
        .attr('role', 'img');

    // map group
    mapGroup = svg.append('g')
        .attr('class', 'map');

    // water background
    mapGroup.append('rect')
        .attr('class', 'water')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height);

    // groups for different map elements
    landGroup = mapGroup.append('g').attr('class', 'land');
    stormGroup = mapGroup.append('g').attr('class', 'storms');

    zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', (event) => {
            mapGroup.attr('transform', event.transform);
        });

    svg.call(zoom);

    // tooltip
    tooltip = d3.select('#globe-container')
        .append('div')
        .attr('id', 'storm-tooltip')
        .attr('class', 'tooltip');
    loadGeographicData();
}

function loadGeographicData() {
    

    // Hurricane data
    const storms = [
        {
            id: 'ida',
            name: 'Hurricane Ida (2021)',
            lon: -89.98,
            lat: 29.28,
            color: '#e74c3c'
        },
        {
            id: 'ian',
            name: 'Hurricane Ian (2022)',
            lon: -81.4,
            lat: 27.5,
            color: '#3498db'
        },
        {
            id: 'irma',
            name: 'Hurricane Irma (2017)',
            lon: -81.5,
            lat: 24.7,
            color: '#2ecc71'
        },
        {
            id: 'harvey',
            name: 'Hurricane Harvey (2017)',
            lon: -97.0,
            lat: 28.0,
            color: '#f39c12'
        }
    ];
    

    Promise.all([
        d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'),
        d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
    ])
        .then(([world, us]) => {
            const allCountries = topojson.feature(world, world.objects.countries).features;

            // world land
            landGroup.selectAll('path')
                .data(allCountries)
                .enter()
                .append('path')
                .attr('class', 'country')
                .attr('d', pathGenerator)
                .attr('fill', '#388e3c')
                .attr('stroke', '#2e7d32')
                .attr('stroke-width', 0.5);


            // Pulsing marker animation
            // storm labels

            stormGroup.selectAll('circle')
                .data(storms)
                .enter()
                .append('circle')
                .each(function(d) {
                    // Store original projected position
                    const [x, y] = projection([d.lon, d.lat]);
                    d.originalX = x;
                    d.originalY = y;
                })
                .attr('class', 'storm')
                .attr('r', 8)
                .attr('fill', d => d.color)
                .attr('stroke', 'white')
                .attr('stroke-width', 2)
                .attr('transform', d => {
                    const [x, y] = projection([d.lon, d.lat]);
                    console.log(`Storm ${d.id} at:`, { lon: d.lon, lat: d.lat, x, y });
                    return `translate(${x}, ${y})`;
                })
                .style('cursor', 'pointer')
                .on('mouseover', function (event, d) {
                    console.log(`Mouse over ${d.id}`);
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('r', 12)
                        .attr('stroke-width', 3);
                    showStormTooltip(event, d);
                })
                .on('mouseout', function (event, d) {
                    console.log(`Mouse out ${d.id}`);
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('r', 8)
                        .attr('stroke-width', 2);
                    hideStormTooltip();
                })
                .on('click', function (event, d) {
                    console.log(`=== CLICK on ${d.id} ===`);
                    console.log('Event:', event);
                    console.log('Storm data:', d);
                    zoomToStorm(d);
                })
                .append('title')
                .text(d => d.name);
            // Setup reset button (using module-level function)
            d3.select('#reset-view').on('click', resetZoom);

            const harveyTrack = stormGroup.append('g')
            .attr('class', 'harvey-track')
            .style('display', 'none');

            harveyTrack.selectAll('circle')
            .data(HARVEY_TIMESTAMPS)
            .enter()
            .append('circle')
            .attr('class', 'harvey-timestamp')
            .attr('r', 5)
            .attr('fill', d => d.color)
            .attr('stroke', 'black')
            .attr('transform', d => {
                const [x, y] = projection([d.lon, d.lat]);
                return `translate(${x}, ${y})`;
            })
            .on("mouseenter", function () {
                d3.select(this)
                .transition()
                .duration(150)
                .attr("r", 6)
            })
            .on("mouseleave", function () {
                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr("r", 5)
                    .attr('fill', d => d.color)
                    .attr('stroke', 'black')
            })
            .on('click', (event, d) => {
                // Only update the Harvey viewer timestamp
                const idx = HARVEY_TIMESTAMPS.indexOf(d);
                setHarveyTimestamp(idx);
            });


            const ianTrack = stormGroup.append('g')
            .attr('class', 'ian-track')
            .style('display', 'none');

            ianTrack.selectAll('circle')
            .data(IAN_TIMESTAMPS)
            .enter()
            .append('circle')
            .attr('class', 'ian-timestamp')
            .attr('r', 5)
            .attr('fill', d => d.color)
            .attr('stroke', 'black')
            .attr('transform', d => {
                const [x, y] = projection([d.lon, d.lat]);
                return `translate(${x}, ${y})`;
            })
            .on("mouseenter", function () {
                d3.select(this)
                .transition()
                .duration(150)
                .attr("r", 6)
            })
            .on("mouseleave", function () {
                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr("r", 5)
                    .attr('fill', d => d.color)
                    .attr('stroke', 'black')
            })
            .on('click', (event, d) => {
                // Only update the Ian viewer timestamp
                const idx = IAN_TIMESTAMPS.indexOf(d);
                setIanTimestamp(idx);
            });

            const irmaTrack = stormGroup.append('g')
            .attr('class', 'irma-track')
            .style('display', 'none');

            irmaTrack.selectAll('circle')
            .data(IRMA_TIMESTAMPS)
            .enter()
            .append('circle')
            .attr('class', 'irma-timestamp')
            .attr('r', 5)
            .attr('fill', d => d.color)
            .attr('stroke', 'black')
            .attr('transform', d => {
                const [x, y] = projection([d.lon, d.lat]);
                return `translate(${x}, ${y})`;
            })
            .on("mouseenter", function () {
                d3.select(this)
                .transition()
                .duration(150)
                .attr("r", 6)
            })
            .on("mouseleave", function () {
                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr("r", 5)
                    .attr('fill', d => d.color)
                    .attr('stroke', 'black')
            })
            .on('click', (event, d) => {
                // Only update the Irma viewer timestamp
                const idx = IRMA_TIMESTAMPS.indexOf(d);
                setIrmaTimestamp(idx);
            });

            const idaTrack = stormGroup.append('g')
            .attr('class', 'ida-track')
            .style('display', 'none');

            idaTrack.selectAll('circle')
            .data(IDA_TIMESTAMPS)
            .enter()
            .append('circle')
            .attr('class', 'ida-timestamp')
            .attr('r', 5)
            .attr('fill', d => d.color)
            .attr('stroke', 'black')
            .attr('transform', d => {
                const [x, y] = projection([d.lon, d.lat]);
                return `translate(${x}, ${y})`;
            })
            .on("mouseenter", function (event, d) {
                d3.select(this)
                .transition()
                .duration(150)
                .attr("r", 6)
            })
            .on("mouseleave", function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(150)
                    .attr("r", 5)
                    .attr('fill', d => d.color)
                    .attr('stroke', 'black')
            })
            .on('click', (event, d) => {
                // Only update the ida viewer timestamp
                const idx = IDA_TIMESTAMPS.indexOf(d);
                setIdaTimestamp(idx);
            });

            isGlobeInitialized = true;

        }).catch(error => {
            console.error('Error loading geographic data:', error);
            createFallbackGlobe();
        });
}

function createFallbackGlobe() {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;

    svg.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', radius)
        .attr('fill', '#1a237e');

    const continents = [
        { name: 'North America', x: centerX - radius * 0.3, y: centerY - radius * 0.1, width: radius * 0.4, height: radius * 0.5 },
        { name: 'South America', x: centerX - radius * 0.2, y: centerY + radius * 0.2, width: radius * 0.2, height: radius * 0.4 },
        { name: 'Africa', x: centerX + radius * 0.1, y: centerY - radius * 0.1, width: radius * 0.3, height: radius * 0.5 }
    ];

    continents.forEach(continent => {
        svg.append('rect')
            .attr('x', continent.x)
            .attr('y', continent.y)
            .attr('width', continent.width)
            .attr('height', continent.height)
            .attr('fill', '#388e3c')
            .attr('rx', 5)
            .attr('ry', 5);
    });

    const storms = [
        { id: 'ida', name: 'Ida (2021)', x: centerX - 50, y: centerY - 20, color: '#e74c3c' },
        { id: 'ian', name: 'Ian (2022)', x: centerX + 30, y: centerY - 10, color: '#3498db' },
        { id: 'irma', name: 'Irma (2017)', x: centerX + 20, y: centerY + 40, color: '#2ecc71' },
        { id: 'harvey', name: 'Harvey (2017)', x: centerX - 80, y: centerY + 10, color: '#f39c12' }
    ];

    storms.forEach(storm => {
        svg.append('circle')
            .attr('cx', storm.x)
            .attr('cy', storm.y)
            .attr('r', 8)
            .attr('fill', storm.color)
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .on('click', () => zoomToStorm(storm));

        svg.append('text')
            .attr('x', storm.x)
            .attr('y', storm.y - 15)
            .attr('text-anchor', 'middle')
            .style('font-size', '11px')
            .style('font-weight', 'bold')
            .style('fill', storm.color)
            .text(storm.name);
    });

    isGlobeInitialized = true;
}

function zoomToStorm(storm) {
    console.log('=== zoomToStorm STARTED ===');
    console.log('Storm clicked:', storm);

    if (!projection || !svg || !zoom) {
        console.error('Missing required elements for zoom!');
        return;
    }

    // Get the bounds for THIS specific storm
    let stormBounds;
    let trackCoords;
    
    switch(storm.id) {
        case 'ida':
            stormBounds = idaBounds;
            trackCoords = idaCoords;
            break;
        case 'harvey':
            stormBounds = harveyBounds;
            trackCoords = harveyCoords;
            break;
        case 'ian':
            stormBounds = ianBounds;
            trackCoords = ianCoords;
            break;
        case 'irma':
            stormBounds = irmaBounds;
            trackCoords = irmaCoords;
            break;
        default:
            console.error('Unknown storm ID:', storm.id);
            return;
    }

    console.log('Storm bounds:', stormBounds);
    console.log('Track coordinates count:', trackCoords.length);

    // Calculate zoom to fit ALL track points
    const [[minLon, minLat], [maxLon, maxLat]] = stormBounds;
    
    // Add padding to ensure all points are visible
    const padding = 0.5; // degrees of padding
    const paddedMinLon = minLon - padding;
    const paddedMaxLon = maxLon + padding;
    const paddedMinLat = minLat - padding;
    const paddedMaxLat = maxLat + padding;
    
    console.log('Padded bounds:', [[paddedMinLon, paddedMinLat], [paddedMaxLon, paddedMaxLat]]);

    // Calculate the center of the bounds
    const centerLon = (paddedMinLon + paddedMaxLon) / 2;
    const centerLat = (paddedMinLat + paddedMaxLat) / 2;
    const center = projection([centerLon, centerLat]);
    
    console.log('Center coordinates:', { centerLon, centerLat, center });

    // Calculate the scale needed to fit the bounds
    const topLeft = projection([paddedMinLon, paddedMaxLat]);
    const bottomRight = projection([paddedMaxLon, paddedMinLat]);
    const boundsWidth = Math.abs(bottomRight[0] - topLeft[0]);
    const boundsHeight = Math.abs(bottomRight[1] - topLeft[1]);
    
    console.log('Bounds dimensions:', { boundsWidth, boundsHeight });

    // Calculate scale with margin
    const margin = 0.2; // 20% margin
    const scale = Math.min(
        (width * (1 - margin)) / boundsWidth,
        (height * (1 - margin)) / boundsHeight
    );
    
    console.log('Calculated scale:', scale);

    // Show the track immediately
    d3.select(`.${storm.id}-track`).style('display', 'block');
    
    // Hide all other tracks
    d3.selectAll('.harvey-track, .ian-track, .ida-track, .irma-track')
        .filter(function() {
            return !d3.select(this).classed(`${storm.id}-track`);
        })
        .style('display', 'none');

    // Hide all viewers first
    d3.selectAll('.viewer-panel').classed('hidden', true);
    
    // Show the target viewer
    const targetViewer = d3.select(`#${storm.id}-viewer`);
    if (!targetViewer.empty()) {
        targetViewer.classed('hidden', false);
    }

    // Dim the globe
    d3.select('#globe').style('opacity', 1);

    console.log('Starting single zoom transition to bounds...');

    // SINGLE zoom transition to fit the bounds
    svg.transition()
        .duration(1000)
        .call(
            zoom.transform,
            d3.zoomIdentity
                .translate(width / 2, height / 2)
                .scale(scale)
                .translate(-center[0], -center[1])
        )
        .on('start', () => {
            console.log('Zoom transition started');
        })
        .on('interrupt', () => {
            console.log('Zoom transition interrupted');
        })
        .on('end', () => {
            console.log('=== Zoom transition COMPLETE ===');
            console.log('Now initializing viewer for:', storm.id);

            // Initialize the specific viewer
            switch(storm.id) {
                case 'ida':
                    initializeIdaViewer(0); // Start at first timestamp
                    break;
                case 'harvey':
                    initializeHarveyViewer(0);
                    break;
                case 'ian':
                    initializeIanViewer(0);
                    break;
                case 'irma':
                    initializeIrmaViewer(0);
                    break;
            }

            console.log('=== zoomToStorm FINISHED ===');
        });
}

function resetZoom() {
    // hide all viewers
    d3.selectAll('.viewer-panel').classed('hidden', true);
    d3.select('#globe').style('opacity', 1);

    d3.select('.harvey-track').style('display', 'none');
    d3.select('.storm-harvey').style('display', 'block');
    d3.select('.ian-track').style('display', 'none');
    d3.select('.storm-ian').style('display', 'block');
    d3.select('.ida-track').style('display', 'none');
    d3.select('.storm-ida').style('display', 'block');
    d3.select('.irma-track').style('display', 'none');
    d3.select('.storm-irma').style('display', 'block');

    // Reset zoom
    if (svg && zoom) {
        svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);
    }
}

export function onExitClickHurricanes() {
    console.log('Exiting Click Hurricanes section');
    d3.select('#globe-svg').remove();
    d3.select('#storm-tooltip').remove();
    d3.selectAll('.viewer-panel').classed('hidden', true);
    svg = null;
    projection = null;
    zoom = null;
    isGlobeInitialized = false;
    resetZoom();
}

export function onProgressClickHurricanes(progress) {
    if (!isGlobeInitialized || !stormGroup) return;
    
    // Reset to original positions
    stormGroup.selectAll('circle.storm')
        .attr('transform', d => {
            return `translate(${d.originalX || 0}, ${d.originalY || 0})`;
        });
}