import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Global coordinate bounds for Hurricane Ida data
const GLOBAL_BOUNDS_GEOJSON = {
    "type": "Feature",
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-101.99999856731257, 18.000004776530474], 
            [-101.99999856731257, 39.99995192126619], 
            [-83.00000513455085, 39.99995192126619], 
            [-83.00000513455085, 18.000004776530474], 
            [-101.99999856731257, 18.000004776530474]
        ]]
    }
};
let currentIndex = 0;

// fast '_sampled.csv' files (sampled 1/3)
const IDA_FILES = [
  './data/ida_20210827_18Z_sampled.csv', './data/ida_20210827_23Z_sampled.csv', './data/ida_20210828_00Z_sampled.csv', 
  './data/ida_20210828_06Z_sampled.csv', './data/ida_20210828_12Z_sampled.csv', './data/ida_20210828_18Z_sampled.csv',
  './data/ida_20210829_00Z_sampled.csv', './data/ida_20210829_06Z_sampled.csv', './data/ida_20210829_12Z_sampled.csv',
  './data/ida_20210829_16Z_sampled.csv', './data/ida_20210829_18Z_sampled.csv', './data/ida_20210830_00Z_sampled.csv', 
  './data/ida_20210830_06Z_sampled.csv'
];
const IDA_TIMESTAMPS = [
  { file: './data/ida_20210827_18Z_sampled.csv', lat: 21.5076, lon: -82.6180, color: '#ffea00' },
  { file: './data/ida_20210827_23Z_sampled.csv', lat: 22.4274, lon: -83.2202, color: '#ffea00' },
  { file: './data/ida_20210828_00Z_sampled.csv', lat: 22.6019, lon: -83.5154, color: '#ffea00' },
  { file: './data/ida_20210828_06Z_sampled.csv', lat: 23.5036, lon: -84.6960, color: '#ffea00' },
  { file: './data/ida_20210828_12Z_sampled.csv', lat: 24.4314, lon: -85.7114, color: '#ffea00' },
  { file: './data/ida_20210828_18Z_sampled.csv', lat: 25.6026, lon: -86.6013, color: '#ffea00' },
  { file: './data/ida_20210829_00Z_sampled.csv', lat: 26.7153, lon: -87.6048, color: '#ff8000' },
  { file: './data/ida_20210829_06Z_sampled.csv', lat: 27.6082, lon: -88.7029, color: '#ff00cc' },
  { file: './data/ida_20210829_12Z_sampled.csv', lat: 28.5055, lon: -89.6031, color: '#ff00cc' },
  { file: './data/ida_20210829_16Z_sampled.csv', lat: 29.0850, lon: -90.2170, color: '#ff00cc' },
  { file: './data/ida_20210829_18Z_sampled.csv', lat: 29.2293, lon: -90.4059, color: '#ff00cc' },
  { file: './data/ida_20210830_00Z_sampled.csv', lat: 29.9071, lon: -90.6185, color: '#ff0033' },
  { file: './data/ida_20210830_06Z_sampled.csv', lat: 30.6006, lon: -90.8074, color: '#ffea00' }
];

const dataCache = {};
const viewerId = '#ida-viewer';
let viewerReady = false;

// Fixed dimensions (290x400)
const width = 290, height = 400;
const POINT_SIZE = 1.5;
let timer = null; 
const ANIMATION_DELAY = 500; 

// D3 vars
let canvas, ctx, projection, colorScale, timestampLabel;

// Data Loading
async function loadData() {
  const promises = IDA_FILES.map(file => {
    if (dataCache[file]) {
      return Promise.resolve(dataCache[file]);
    }
    
    return d3.csv(file, d3.autoType).then(data => {
      dataCache[file] = data.map(d => ({
        lon: +d.lon,
        lat: +d.lat,
        CMI: +d.CMI, 
        time: d.time
      }));
      return dataCache[file];
    });
  });

  try {
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Error loading one or more Ida data files. Check file paths:', error);
    return false;
  }
}

// Animation Controls

function nextTimestamp() {
    const slider = d3.select('#timestamp-slider').node();
    let nextIndex = parseInt(slider.value) + 1;

    if (nextIndex >= IDA_FILES.length) {
        stopAnimation();
        return;
    }
    
    slider.value = nextIndex;
    updateViewer(nextIndex);
}

function startAnimation() {
    if (timer) return; 

    const slider = d3.select('#timestamp-slider').node();
    if (parseInt(slider.value) === IDA_FILES.length - 1) {
        resetAnimation();
    }

    timer = setInterval(nextTimestamp, ANIMATION_DELAY);
    d3.select('#play-pause-btn').text('Pause');
}

function stopAnimation() {
    if (timer) {
        clearInterval(timer);
        timer = null;
        d3.select('#play-pause-btn').text('Play');
    }
}

function resetAnimation() {
    stopAnimation();
    d3.select('#timestamp-slider').property('value', 0);
    updateViewer(0);
}

// Viz/UI
function createViewerUI(initialIndex = 0) {
  const container = d3.select(viewerId);

  container.html('');
  container.append('h3').text('Hurricane Ida Progression Heatmap');
  timestampLabel = container.append('div').attr('id', 'timestamp-label');

  // 1. Control Buttons
  const buttonContainer = container.append('div').attr('class', 'button-container');
  buttonContainer.append('button')
    .attr('id', 'play-pause-btn')
    .text('Play')
    .on('click', () => {
        if (timer) {
            stopAnimation();
        } else {
            startAnimation();
        }
    });

  buttonContainer.append('button')
    .attr('id', 'reset-btn')
    .text('Reset')
    .on('click', resetAnimation);


  // 2. Slider Control
  const sliderContainer = container.append('div').attr('class', 'slider-container');
  sliderContainer.append('label').attr('for', 'timestamp-slider').text('Select Timestamp: ');
  sliderContainer.append('input')
    .attr('type', 'range')
    .attr('id', 'timestamp-slider')
    .attr('min', 0)
    .attr('max', IDA_FILES.length - 1)
    .attr('value', initialIndex)      // set initial UI value
    .attr('step', 1)
    .on('change', function() {
      stopAnimation();
      currentIndex = +this.value;
      updateViewer(currentIndex);
    });

  // 3. Canvas Container 
  canvas = container.append('canvas')
    .attr('width', width)
    .attr('height', height)
    .attr('id', 'ida-viewer-canvas')
    .node();
  
  ctx = canvas.getContext('2d');

  projection = d3.geoMercator()
    .scale(1) 
    .translate([width / 2, height / 2]);

  // fixed projection scale/center once
  projection.fitExtent([[0, 0], [width, height]], GLOBAL_BOUNDS_GEOJSON);

  colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([200, 300]);

  viewerReady = true;
  currentIndex = initialIndex;
  updateViewer(initialIndex);
}

/**
 * Renders heatmap data to the Canvas 
 */

function updateViewer(fileIndex) {
  if (!viewerReady) return;

  const fileName = IDA_FILES[fileIndex];
  const data = dataCache[fileName]; 

  if (!data || data.length === 0) {
      timestampLabel.text(`Timestamp: ${fileName.replace('.csv', '')} - (No Data Available)`);
      ctx.clearRect(0, 0, width, height); 
      return;
  }
  
  let displayTime = "(unknown)";

  const match = fileName.match(/ida_(\d{4})(\d{2})(\d{2})_(\d{2})Z/);
  if (match) {
    const [_, YYYY, MM, DD, HH] = match;
    displayTime = `${MM}/${DD}/${YYYY} ${HH}:00`;
  }
  timestampLabel.text(`Timestamp: ${displayTime}`);

  // Clear Canvas 
  ctx.clearRect(0, 0, width, height);
  
  // Draw Heatmap Points
  ctx.globalAlpha = 0.5;

  for (const d of data) {
    const [x, y] = projection([d.lon, d.lat]);
    if (x < 0 || x > width || y < 0 || y > height) continue;

    ctx.fillStyle = colorScale(d.CMI);
    ctx.fillRect(x - POINT_SIZE / 2, y - POINT_SIZE / 2, POINT_SIZE, POINT_SIZE);
  }

  timestampLabel.text(`Timestamp: ${displayTime}`);
}

export async function initializeIdaViewer(initialIndex = 0) {
  // if already initialized, don't re-create UI — just set the timestamp
  if (viewerReady) {
    // viewer already exists; just show and set timestamp
    d3.select(viewerId).classed('hidden', false);
    setIdaTimestamp(initialIndex);
    return;
  }

  const loadSuccess = await loadData();

  if (loadSuccess) {
    createViewerUI(initialIndex);
  } else {
    d3.select(viewerId).html('<p>Error: Could not load all Hurricane Ida data files. Check file paths and accessibility.</p>');
  }
}

export function setIdaTimestamp(index) {
  d3.select('#timestamp-slider').property('value', index);
  stopAnimation();
  updateViewer(index);
}

export { IDA_TIMESTAMPS };
