import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import * as topojson from 'https://cdn.jsdelivr.net/npm/topojson-client@3/+esm';
import { initializeIdaViewer } from './ida_viewer.js';
import { initializeHarveyViewer } from './harvey_viewer.js'; 
import { initializeIanViewer } from './ian_viewer.js'; 
import { initializeIrmaViewer } from './irma_viewr.js';

const container = d3.select('#globe');
const size = Math.min(window.innerWidth * 1, 700);
const width = size;
const height = size * (3 / 4);

const storms = [
  {
    id: 'ida',
    name: 'Hurricane Ida (2021)',
    lon: -89.98,
    lat: 29.28
  },
  {
    id: 'ian',
    name: 'Hurricane Ian (2022)',
    lon: -81.4,
    lat: 27.5
  },
  {
    id: 'irma',
    name: 'Hurricane Irma (2017)',
    lon: -81.5,
    lat: 24.7
  },
  {
    id: 'harvey',
    name: 'Hurricane Harvey (2017)',
    lon: -97.0,
    lat: 28.0
  }
];

const projection = d3.geoMercator();
const pathGenerator = d3.geoPath(projection);


const svg = container.append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .attr('role', 'img');

const mapGroup = svg.append('g')
  .attr('class', 'map');

mapGroup.append('rect')
  .attr('class', 'water')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', width)
  .attr('height', height);

const landGroup = mapGroup.append('g').attr('class', 'land');
const stormGroup = mapGroup.append('g').attr('class', 'storms');

const render = () => {
  landGroup.selectAll('path').attr('d', pathGenerator);

  stormGroup.selectAll('circle')
    .attr('transform', d => {
      const [x, y] = projection([d.lon, d.lat]);
      return `translate(${x}, ${y})`;
    });
};

const zoom = d3.zoom()
  .scaleExtent([1, 8])
  .on('zoom', (event) => {
    mapGroup.attr('transform', event.transform);
  });

svg.call(zoom);


function zoomToStorm(d) {
  const [x, y] = projection([d.lon, d.lat]);
  const k = 4;

  svg.transition()
    .duration(750)
    .call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(k)
        .translate(-x, -y)
    )
    .on('end', () => {
      if (d.id === 'ida') {
        d3.select('#ida-viewer').classed('hidden', false);
        d3.select('#globe').style('opacity', 0.5);
        initializeIdaViewer();
      }
      if (d.id === 'harvey') {
        d3.select('#harvey-viewer').classed('hidden', false);
        d3.select('#globe').style('opacity', 0.5);
        initializeHarveyViewer()
      };
      if (d.id === 'ian') {
        d3.select('#ian-viewer').classed('hidden', false);
        d3.select('#globe').style('opacity', 0.5);
        initializeIanViewer()
      };
      if (d.id === 'irma') {
        d3.select('#irma-viewer').classed('hidden', false);
        d3.select('#globe').style('opacity', 0.5);
        initializeIrmaViewer()
      };
    });
}

function resetZoom() {
  d3.select('#ida-viewer').classed('hidden', true);
  d3.select('#harvey-viewer').classed('hidden', true);
  d3.select('#ian-viewer').classed('hidden', true);
  d3.select('#irma-viewer').classed('hidden', true);
  d3.select('#globe').style('opacity', 1); 

  svg.transition()
    .duration(750)
    .call(zoom.transform, d3.zoomIdentity);
}

d3.select('#reset-view').on('click', resetZoom);

const borderGroup = mapGroup.append('g').attr('class', 'borders');
const labelGroup  = mapGroup.append('g').attr('class', 'labels');

const TARGET_COUNTRIES = new Set([
  "Mexico",
  "Cuba",
  "Bahamas",
  "Haiti",
  "Jamaica",
  "Dominican Rep.",
  "Puerto Rico"
]);

const TARGET_STATES = new Set([
  "Florida",
  "Texas",
  "Louisiana",
  "Mississippi",
  "Alabama",
  "Georgia"
]);

const LABEL_OFFSETS = {
  "Mexico":            { dx: 10, dy: -5 },
  "Cuba":              { dx: -25,  dy: 5 },
  "Bahamas":           { dx: 10, dy: 0 },
  "Haiti":             { dx: 0,  dy: -20 },
  "Jamaica":           { dx: 5,  dy: 15 },
  "Dominican Rep.":    { dx: 10, dy: 30 },
  "Puerto Rico":       { dx: 5, dy: -9 },

  "Florida":           { dx: 5,  dy: -15 },
  "Texas":             { dx: 10, dy: -5 },
  "Louisiana":         { dx: 0, dy: 12 },
  "Mississippi":       { dx: 10, dy: -10 },
  "Alabama":           { dx: 0,  dy: 15 },
  "Georgia":           { dx: 3,  dy: -5 }
};
  
Promise.all([
  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'),
  d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
])
.then(([world, us]) => {

  const allCountries = topojson.feature(world, world.objects.countries).features;
  const allStates = topojson.feature(us, us.objects.states).features;

  const filteredCountries = allCountries.filter(
    d => TARGET_COUNTRIES.has(d.properties.name)
  );

  const filteredStates = allStates.filter(
    d => TARGET_STATES.has(d.properties.name)
  );

  const regionCollection = {
    type: "FeatureCollection",
    features: [...filteredCountries, ...filteredStates]
  };

  projection.fitExtent([[20, 20], [width - 20, height - 20]], regionCollection);

  landGroup.selectAll('path')
    .data(allCountries)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', pathGenerator);

  borderGroup.selectAll('.country-outline')
    .data(filteredCountries)
    .enter()
    .append('path')
    .attr('class', 'country-outline')
    .attr('d', pathGenerator);

  borderGroup.selectAll('.state-outline')
    .data(filteredStates)
    .enter()
    .append('path')
    .attr('class', 'state-outline')
    .attr('d', pathGenerator);

  labelGroup.selectAll('.country-label')
    .data(filteredCountries)
    .enter()
    .append('text')
    .attr('class', 'country-label')
    .attr('transform', d => `translate(${pathGenerator.centroid(d)})`)
    .attr('dx', d => LABEL_OFFSETS[d.properties.name]?.dx || 0)
    .attr('dy', d => LABEL_OFFSETS[d.properties.name]?.dy || 0)
    .text(d => d.properties.name)
    .attr('text-anchor', 'middle');

  labelGroup.selectAll('.state-label')
    .data(filteredStates)
    .enter()
    .append('text')
    .attr('class', 'state-label')
    .attr('transform', d => `translate(${pathGenerator.centroid(d)})`)
    .attr('dx', d => LABEL_OFFSETS[d.properties.name]?.dx || 0)
    .attr('dy', d => LABEL_OFFSETS[d.properties.name]?.dy || 0)
    .text(d => d.properties.name)
    .attr('text-anchor', 'middle');

  stormGroup.selectAll('circle')
    .data(storms)
    .enter()
    .append('circle')
    .attr('class', 'storm')
    .attr('r', 6)
    .on('click', (event, d) => zoomToStorm(d))
    .append('title')
    .text(d => d.name);

  render();
});