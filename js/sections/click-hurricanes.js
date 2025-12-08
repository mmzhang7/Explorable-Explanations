// js/sections/click-hurricanes.js
import * as d3 from 'd3';
import * as topojson from 'https://cdn.jsdelivr.net/npm/topojson-client@3/+esm';
import { initializeIdaViewer } from '../ida_viewer.js';
import { initializeHarveyViewer } from '../harvey_viewer.js';
import { initializeIanViewer } from '../ian_viewer.js';
import { initializeIrmaViewer } from '../irma_viewer.js';

let svg, mapGroup, landGroup, stormGroup, borderGroup, labelGroup;
let projection, pathGenerator;
let zoom;
let isGlobeInitialized = false;

let width = 800;
let height = 600;
let tooltip;

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

export function onEnterClickHurricanes() {
    console.log('Entering Click Hurricanes section');

    const container = d3.select('#cities-visualization');
    // container size adjustments
    width = container.node().getBoundingClientRect().width || 800;
    height = Math.min(width * 0.75, 500);

    container.html('');

    // globe main container
    const globeContainer = container.append('div')
        .attr('id', 'globe-container')
        .style('height', `${height}px`);

    // SVG container
    globeContainer.append('div')
        .attr('id', 'globe');

    // hurricane viewer panels container
    const viewersContainer = globeContainer.append('div')
        .attr('id', 'hurricane-viewers');

    // individual viewer panels
    const viewers = ['ida', 'harvey', 'ian', 'irma'];
    viewers.forEach(viewer => {
        viewersContainer.append('div')
            .attr('id', `${viewer}-viewer`)
            .attr('class', 'viewer-panel hidden');
    });

    // controls
    const controls = container.append('div')
        .attr('class', 'globe-controls');

    controls.append('button')
        .attr('id', 'reset-view')
        .attr('class', 'button-primary')
        .text('Reset View');

    // instructions (styles defined in CSS)
    container.append('p')
        .attr('class', 'instructions')
        .text('Click on any hurricane marker to zoom in and view detailed data');

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
    borderGroup = mapGroup.append('g').attr('class', 'borders');
    labelGroup = mapGroup.append('g').attr('class', 'labels');
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
    // Countries we want outlined + labeled
    const TARGET_COUNTRIES = new Set([
        "Mexico",
        "Cuba",
        "Bahamas",
        "Haiti",
        "Jamaica",
        "Dominican Rep.",
        "Puerto Rico"
    ]);

    // US States we want outlined + labeled
    const TARGET_STATES = new Set([
        "Florida",
        "Texas",
        "Louisiana",
        "Mississippi",
        "Alabama",
        "Georgia"
    ]);

    const LABEL_OFFSETS = {
        "Mexico": { dx: 10, dy: -5 },
        "Cuba": { dx: -25, dy: 5 },
        "Bahamas": { dx: 10, dy: 0 },
        "Haiti": { dx: 0, dy: -20 },
        "Jamaica": { dx: 5, dy: 15 },
        "Dominican Rep.": { dx: 10, dy: 30 },
        "Puerto Rico": { dx: 5, dy: -9 },
        "Florida": { dx: 5, dy: -15 },
        "Texas": { dx: 10, dy: -5 },
        "Louisiana": { dx: 0, dy: 12 },
        "Mississippi": { dx: 10, dy: -10 },
        "Alabama": { dx: 0, dy: 15 },
        "Georgia": { dx: 3, dy: -5 }
    };

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
            const allStates = topojson.feature(us, us.objects.states).features;

            // Filter only the selected ones
            const filteredCountries = allCountries.filter(
                d => TARGET_COUNTRIES.has(d.properties.name)
            );

            const filteredStates = allStates.filter(
                d => TARGET_STATES.has(d.properties.name)
            );

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

            // OUTLINES for only selected countries
            borderGroup.selectAll('.country-outline')
                .data(filteredCountries)
                .enter()
                .append('path')
                .attr('class', 'country-outline')
                .attr('d', pathGenerator)
                .attr('fill', 'none')
                .attr('stroke', '#2c3e50')
                .attr('stroke-width', 1.5);

            // OUTLINES for only selected states
            borderGroup.selectAll('.state-outline')
                .data(filteredStates)
                .enter()
                .append('path')
                .attr('class', 'state-outline')
                .attr('d', pathGenerator)
                .attr('fill', 'none')
                .attr('stroke', '#2c3e50')
                .attr('stroke-width', 1.5);

            // LABELS for selected countries
            labelGroup.selectAll('.country-label')
                .data(filteredCountries)
                .enter()
                .append('text')
                .attr('class', 'country-label')
                .attr('transform', d => `translate(${pathGenerator.centroid(d)})`)
                .attr('dx', d => LABEL_OFFSETS[d.properties.name]?.dx || 0)
                .attr('dy', d => LABEL_OFFSETS[d.properties.name]?.dy || 0)
                .text(d => d.properties.name)
                .attr('text-anchor', 'middle')
                .style('font-size', '12px')
                .style('font-weight', 'bold')
                .style('fill', '#2c3e50')
                .style('pointer-events', 'none');

            // LABELS for selected states
            labelGroup.selectAll('.state-label')
                .data(filteredStates)
                .enter()
                .append('text')
                .attr('class', 'state-label')
                .attr('transform', d => `translate(${pathGenerator.centroid(d)})`)
                .attr('dx', d => LABEL_OFFSETS[d.properties.name]?.dx || 0)
                .attr('dy', d => LABEL_OFFSETS[d.properties.name]?.dy || 0)
                .text(d => d.properties.name)
                .attr('text-anchor', 'middle')
                .style('font-size', '12px')
                .style('font-weight', 'bold')
                .style('fill', '#2c3e50')
                .style('pointer-events', 'none');

            // storm markers
            stormGroup.selectAll('circle')
                .data(storms)
                .enter()
                .append('circle')
                .attr('class', 'storm')
                .attr('r', 8)
                .attr('fill', d => d.color)
                .attr('stroke', 'white')
                .attr('stroke-width', 2)
                .attr('transform', d => {
                    const [x, y] = projection([d.lon, d.lat]);
                    return `translate(${x}, ${y})`;
                })
                .style('cursor', 'pointer')
                .on('mouseover', function (event, d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('r', 12)
                        .attr('stroke-width', 3);
                    showStormTooltip(event, d);
                })
                .on('mouseout', function (event, d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('r', 8)
                        .attr('stroke-width', 2);
                    hideStormTooltip();
                })
                .on('click', (event, d) => zoomToStorm(d))
                .append('title')
                .text(d => d.name);

            // Pulsing marker animation
            // storm labels

            stormGroup.selectAll('circle')
                .data(storms)
                .enter()
                .append('circle')
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
    console.log('Has projection?', !!projection);
    console.log('Has svg?', !!svg);
    console.log('Has zoom?', !!zoom);

    if (!projection || !svg || !zoom) {
        console.error('Missing required elements for zoom!');
        return;
    }

    const [x, y] = projection([storm.lon || 0, storm.lat || 0]);
    console.log('Projected coordinates:', { x, y });
    console.log('Storm lon/lat:', { lon: storm.lon, lat: storm.lat });

    const k = 4;
    console.log('Zoom scale (k):', k);

    console.log('Starting zoom transition...');

    svg.transition()
        .duration(750)
        .call(
            zoom.transform,
            d3.zoomIdentity
                .translate(width / 2, height / 2)
                .scale(k)
                .translate(-x, -y)
        )
        .on('start', () => {
            console.log('Zoom transition started');
        })
        .on('interrupt', () => {
            console.log('Zoom transition interrupted');
        })
        .on('end', () => {
            console.log('=== Zoom transition ENDED ===');
            console.log('Now showing viewer for:', storm.id);

            // Log viewer elements before hiding
            const viewers = d3.selectAll('.viewer-panel');
            console.log('Total viewer panels found:', viewers.size());
            viewers.each(function (d, i) {
                const el = d3.select(this);
                console.log(`Viewer ${i}: id=${el.attr('id')}, hidden=${el.classed('hidden')}`);
            });

            // hide all viewers
            d3.selectAll('.viewer-panel').classed('hidden', true);
            console.log('All viewers hidden');

            // show current viewer and dim globe
            const targetViewer = d3.select(`#${storm.id}-viewer`);
            console.log('Target viewer element:', targetViewer.node());

            if (targetViewer.empty()) {
                console.error(`Viewer #${storm.id}-viewer not found!`);
                console.log('Available viewer IDs:');
                d3.selectAll('.viewer-panel').each(function () {
                    console.log('-', d3.select(this).attr('id'));
                });
            } else {
                targetViewer.classed('hidden', false);
                console.log(`Viewer ${storm.id} shown (hidden=${targetViewer.classed('hidden')})`);
            }

            // Check globe opacity
            const globe = d3.select('#globe');
            console.log('Globe element:', globe.node());
            globe.style('opacity', 0.5);
            console.log('Globe opacity set to 0.5');

            // Log which viewer function will be called
            console.log('Calling viewer initialization function for:', storm.id);

            // initialize specific viewer content
            if (storm.id === 'ida') {
                console.log('Calling initializeIdaViewer()...');
                initializeIdaViewer();
            } else if (storm.id === 'harvey') {
                console.log('Calling initializeHarveyViewer()...');
                initializeHarveyViewer();
            } else if (storm.id === 'ian') {
                console.log('Calling initializeIanViewer()...');
                initializeIanViewer();
            } else if (storm.id === 'irma') {
                console.log('Calling initializeIrmaViewer()...');
                initializeIrmaViewer();
            } else {
                console.error('Unknown storm ID:', storm.id);
            }

            console.log('=== zoomToStorm COMPLETE ===');
        });
}

function resetZoom() {
    // hide all viewers
    d3.selectAll('.viewer-panel').classed('hidden', true);
    d3.select('#globe').style('opacity', 1);

    // Reset zoom
    if (svg && zoom) {
        svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity);
    }
}

export function onExitClickHurricanes() {
    console.log('Exiting Click Hurricanes section');
    d3.select('#storm-tooltip').remove();
    tooltip = null;
    if (direction === 'up') {
        resetZoom();
    }
}

export function onProgressClickHurricanes(progress) {
    if (isGlobeInitialized && progress > 0.1 && stormGroup && projection && svg) {
        // Simple globe rotation (note: this logic is complex for Natural Earth projection 
        // but is retained/slightly simplified based on your original)

        // Calculate the rotation angle based on scroll progress
        const rotationAngle = progress * 30;

        // Calculate the new translation required to visually represent rotation
        // This is not a proper D3 projection rotation, but a transformation on the group

        stormGroup.selectAll('circle')
            .transition()
            .duration(500)
            .attr('transform', d => {
                // Get the original projected coordinates
                const [x, y] = projection([d.lon, d.lat]);

                // Rotation logic is complex on non-rotated projections; 
                // for simplicity, we'll just slightly adjust the projection center:
                const newProjection = d3.geoNaturalEarth1()
                    .center([-82 + rotationAngle * 0.1, 27]) // Rotate Westward slightly
                    .scale(width * 1.3)
                    .translate([width / 2, height / 2]);

                const [newX, newY] = newProjection([d.lon, d.lat]);

                return `translate(${newX}, ${newY})`;
            });

        // Apply the same transformation to the labels
        stormGroup.selectAll('text')
            .transition()
            .duration(500)
            .attr('transform', d => {
                const newProjection = d3.geoNaturalEarth1()
                    .center([-82 + rotationAngle * 0.1, 27])
                    .scale(width * 1.3)
                    .translate([width / 2, height / 2]);
                const [newX, newY] = newProjection([d.lon, d.lat]);
                return `translate(${newX}, ${newY - 15})`;
            });
    }
}