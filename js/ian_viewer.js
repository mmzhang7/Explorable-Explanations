import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Global coordinate bounds for Hurricane Ian data
const GLOBAL_BOUNDS_GEOJSON = {
    "type": "Feature",
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-90, 20],
            [-90, 42],
            [-71, 42],
            [-71, 20],
            [-90, 20]
        ]]
    }
};
let currentIndex = 0;

// fast '_sampled.csv' files (sampled 1/3)
const IAN_FILES = [
  './data/ian_20220927_06Z_sampled.csv', './data/ian_20220927_08Z_sampled.csv', './data/ian_20220927_12Z_sampled.csv',
  './data/ian_20220927_18Z_sampled.csv', './data/ian_20220928_00Z_sampled.csv', './data/ian_20220928_02Z_sampled.csv', 
  './data/ian_20220928_06Z_sampled.csv', './data/ian_20220928_12Z_sampled.csv', './data/ian_20220928_18Z_sampled.csv', 
  './data/ian_20220928_19Z_sampled.csv', './data/ian_20220928_20Z_sampled.csv', './data/ian_20220929_00Z_sampled.csv', 
  './data/ian_20220929_06Z_sampled.csv', './data/ian_20220929_12Z_sampled.csv'
];
const IAN_TIMESTAMPS = [
  
  { file: './data/ian_20220927_06Z_sampled.csv', lat: 21.7813, lon: -83.4997, color: '#ff0033' },
  { file: './data/ian_20220927_08Z_sampled.csv', lat: 22.2059, lon: -83.6443, color: '#ff0033' },
  { file: './data/ian_20220927_12Z_sampled.csv', lat: 22.5847, lon: -83.5720, color: '#ff0033' },
  { file: './data/ian_20220927_18Z_sampled.csv', lat: 23.5382, lon: -83.3310, color: '#ff0033' },

  { file: './data/ian_20220928_00Z_sampled.csv', lat: 24.3312, lon: -83.1141, color: '#ff0033' },
  { file: './data/ian_20220928_02Z_sampled.csv', lat: 24.5944, lon: -83.0659, color: '#ff0033' },
  { file: './data/ian_20220928_06Z_sampled.csv', lat: 25.1629, lon: -83.0418, color: '#ff00cc' },
  { file: './data/ian_20220928_12Z_sampled.csv', lat: 25.9456, lon: -82.9454, color: '#9d00ff' },
  { file: './data/ian_20220928_18Z_sampled.csv', lat: 26.5724, lon: -82.7044, color: '#ff00cc' },
  { file: './data/ian_20220928_19Z_sampled.csv', lat: 26.7016, lon: -82.5116, color: '#ff00cc' },
  { file: './data/ian_20220928_20Z_sampled.csv', lat: 26.8092, lon: -82.4152, color: '#ff00cc' },

  { file: './data/ian_20220929_00Z_sampled.csv', lat: 27.1529, lon: -82.2224, color: '#ff0033' },
  { file: './data/ian_20220929_06Z_sampled.csv', lat: 27.6877, lon: -81.0404, color: '#ffea00' },
  { file: './data/ian_20220929_12Z_sampled.csv', lat: 28.3912, lon: -80.5218, color: '#00e676' }
];

const dataCache = {};
const viewerId = '#ian-viewer';
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
  const promises = IAN_FILES.map(file => {
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
    console.error('Error loading one or more Ian data files. Check file paths:', error);
    return false;
  }
}

// Animation Controls

function nextTimestamp() {
    const slider = d3.select('#timestamp-slider').node();
    let nextIndex = parseInt(slider.value) + 1;

    if (nextIndex >= IAN_FILES.length) {
        stopAnimation();
        return;
    }
    
    slider.value = nextIndex;
    updateViewer(nextIndex);
}

function startAnimation() {
    if (timer) return; 

    const slider = d3.select('#timestamp-slider').node();
    if (parseInt(slider.value) === IAN_FILES.length - 1) {
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
  container.append('h3').text('Hurricane Ian Progression Heatmap');
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
    .attr('max', IAN_FILES.length - 1)
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
    .attr('id', 'ian-viewer-canvas')
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

  const fileName = IAN_FILES[fileIndex];
  const data = dataCache[fileName]; 

  if (!data || data.length === 0) {
      timestampLabel.text(`Timestamp: ${fileName.replace('.csv', '')} - (No Data Available)`);
      ctx.clearRect(0, 0, width, height); 
      return;
  }
  
  let displayTime = "(unknown)";

  const match = fileName.match(/ian_(\d{4})(\d{2})(\d{2})_(\d{2})Z/);
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

export async function initializeIanViewer(initialIndex = 0) {
  // if already initialized, don't re-create UI — just set the timestamp
  if (viewerReady) {
    // viewer already exists; just show and set timestamp
    d3.select(viewerId).classed('hidden', false);
    setIanTimestamp(initialIndex);
    return;
  }

  const loadSuccess = await loadData();

  if (loadSuccess) {
    createViewerUI(initialIndex);
  } else {
    d3.select(viewerId).html('<p>Error: Could not load all Hurricane Ian data files. Check file paths and accessibility.</p>');
  }
}

export function setIanTimestamp(index) {
  d3.select('#timestamp-slider').property('value', index);
  stopAnimation();
  updateViewer(index);
}

export { IAN_TIMESTAMPS };
