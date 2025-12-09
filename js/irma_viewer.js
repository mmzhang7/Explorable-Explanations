import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Global coordinate bounds for Hurricane Irma data
const GLOBAL_BOUNDS_GEOJSON = {
    "type": "Feature",
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-82, 18],
            [-82, 30],
            [-82, 30],
            [-60, 18],
            [-82, 18]
        ]]
    }
};
let currentIndex = 0;

// fast '_sampled.csv' files (sampled 1/3)
const IRMA_FILES = [
  './data/irma_20170907_12Z_sampled.csv', './data/irma_20170907_18Z_sampled.csv', './data/irma_20170908_00Z_sampled.csv', 
  './data/irma_20170908_05Z_sampled.csv', './data/irma_20170908_06Z_sampled.csv', './data/irma_20170908_12Z_sampled.csv', 
  './data/irma_20170908_18Z_sampled.csv', './data/irma_20170909_00Z_sampled.csv', './data/irma_20170909_03Z_sampled.csv', 
  './data/irma_20170909_06Z_sampled.csv', './data/irma_20170909_12Z_sampled.csv', './data/irma_20170909_18Z_sampled.csv', 
  './data/irma_20170910_00Z_sampled.csv', './data/irma_20170910_06Z_sampled.csv', './data/irma_20170910_12Z_sampled.csv', 
  './data/irma_20170910_13Z_sampled.csv'
  
];

const IRMA_TIMESTAMPS = [
  { file: './data/irma_20170907_12Z_sampled.csv', lat: 20.1980, lon: -68.9962, color: '#9d00ff' },
  { file: './data/irma_20170907_18Z_sampled.csv', lat: 20.6895, lon: -70.4136, color: '#9d00ff' },
  { file: './data/irma_20170908_00Z_sampled.csv', lat: 21.1274, lon: -71.8198, color: '#9d00ff' },
  { file: './data/irma_20170908_05Z_sampled.csv', lat: 21.1274, lon: -71.8198, color: '#ff00cc' },
  { file: './data/irma_20170908_06Z_sampled.csv', lat: 21.1274, lon: -71.8198, color: '#ff00cc' },
  { file: './data/irma_20170908_12Z_sampled.csv', lat: 21.1274, lon: -71.8198, color: '#ff00cc' },
  { file: './data/irma_20170908_18Z_sampled.csv', lat: 21.5121, lon: -73.0139, color: '#9d00ff' },
  { file: './data/irma_20170909_00Z_sampled.csv', lat: 21.5121, lon: -73.2036, color: '#9d00ff' },
  { file: './data/irma_20170909_03Z_sampled.csv', lat: 21.8336, lon: -74.7103, color: '#9d00ff' },
  { file: './data/irma_20170909_06Z_sampled.csv', lat: 22.0406, lon: -76.0049, color: '#ff00cc' },
  { file: './data/irma_20170909_12Z_sampled.csv', lat: 22.7217, lon: -79.3077, color: '#ff0033' },
  { file: './data/irma_20170909_18Z_sampled.csv', lat: 23.1123, lon: -80.2117, color: '#ff8000' },
  { file: './data/irma_20170910_00Z_sampled.csv', lat: 23.4302, lon: -80.9148, color: '#ff0033' },
  { file: './data/irma_20170910_06Z_sampled.csv', lat: 23.7034, lon: -81.3054, color: '#ff00cc' },
  { file: './data/irma_20170910_12Z_sampled.csv', lat: 24.5213, lon: -81.5063, color: '#ff00cc' },
  { file: './data/irma_20170910_13Z_sampled.csv', lat: 24.7140, lon: -81.5063, color: '#ff00cc' }
];


const dataCache = {};
const viewerId = '#irma-viewer';
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
  const promises = IRMA_FILES.map(file => {
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
    console.error('Error loading one or more Irma data files. Check file paths:', error);
    return false;
  }
}

// Animation Controls

function nextTimestamp() {
    const slider = d3.select('#timestamp-slider').node();
    let nextIndex = parseInt(slider.value) + 1;

    if (nextIndex >= IRMA_FILES.length) {
        stopAnimation();
        return;
    }
    
    slider.value = nextIndex;
    updateViewer(nextIndex);
}

function startAnimation() {
    if (timer) return; 

    const slider = d3.select('#timestamp-slider').node();
    if (parseInt(slider.value) === IRMA_FILES.length - 1) {
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
  container.append('h3').text('Hurricane Irma Progression Heatmap');
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
    .attr('max', IRMA_FILES.length - 1)
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
    .attr('id', 'irma-viewer-canvas')
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

  const fileName = IRMA_FILES[fileIndex];
  const data = dataCache[fileName]; 

  if (!data || data.length === 0) {
      timestampLabel.text(`Timestamp: ${fileName.replace('.csv', '')} - (No Data Available)`);
      ctx.clearRect(0, 0, width, height); 
      return;
  }
  
  let displayTime = "(unknown)";

  const match = fileName.match(/irma_(\d{4})(\d{2})(\d{2})_(\d{2})Z/);
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

export async function initializeIrmaViewer(initialIndex = 0) {
  // if already initialized, don't re-create UI — just set the timestamp
  if (viewerReady) {
    // viewer already exists; just show and set timestamp
    d3.select(viewerId).classed('hidden', false);
    setIrmaTimestamp(initialIndex);
    return;
  }

  const loadSuccess = await loadData();

  if (loadSuccess) {
    createViewerUI(initialIndex);
  } else {
    d3.select(viewerId).html('<p>Error: Could not load all Hurricane Irma data files. Check file paths and accessibility.</p>');
  }
}

export function setIrmaTimestamp(index) {
  d3.select('#timestamp-slider').property('value', index);
  stopAnimation();
  updateViewer(index);
}

export { IRMA_TIMESTAMPS };
