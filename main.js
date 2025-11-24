import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import * as topojson from 'https://cdn.jsdelivr.net/npm/topojson-client@3/+esm';

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

const projection = d3.geoNaturalEarth1()
  .center([-82, 27])
  .scale(width * 1.3)
  .translate([width / 2, height / 2]);

const pathGenerator = d3.geoPath(projection);

const svg = container.append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .attr('role', 'img');

const mapGroup = svg.append('g').attr('class', 'map');

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
    );
}

function resetZoom() {
  svg.transition()
    .duration(750)
    .call(zoom.transform, d3.zoomIdentity);
}

d3.select('#reset-view').on('click', resetZoom);

d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
  .then((world) => {
    const countries = topojson.feature(world, world.objects.countries);

    landGroup.selectAll('path')
      .data(countries.features)
      .enter()
      .append('path');

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
