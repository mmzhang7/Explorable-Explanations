import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Global coordinate bounds for Hurricane Harvey data
const GLOBAL_BOUNDS_GEOJSON = {
    "type": "Feature",
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104, 24.0],
            [-104, 46.0],
            [-85, 46.0],
            [-85, 24.0],
            [-104, 24.0]
        ]]
    }
};

// fast '_sampled.csv' files (sampled 1/3)
const HARVEY_FILES = [
  'data/harvey_20170824_12Z_sampled.csv', 'data/harvey_20170824_18Z_sampled.csv', 'data/harvey_20170825_00Z_sampled.csv', 
  'data/harvey_20170825_03Z_sampled.csv', 'data/harvey_20170825_06Z_sampled.csv', 'data/harvey_20170825_09Z_sampled.csv',
  'data/harvey_20170825_12Z_sampled.csv', 'data/harvey_20170825_15Z_sampled.csv', 'data/harvey_20170825_18Z_sampled.csv', 
  'data/harvey_20170825_21Z_sampled.csv', 'data/harvey_20170826_00Z_sampled.csv', 'data/harvey_20170826_03Z_sampled.csv', 
  'data/harvey_20170826_06Z_sampled.csv', 'data/harvey_20170826_09Z_sampled.csv', 'data/harvey_20170826_12Z_sampled.csv', 
  'data/harvey_20170826_15Z_sampled.csv'
];

const dataCache = {};
const viewerId = '#harvey-viewer';
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
  const promises = HARVEY_FILES.map(file => {
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
    console.error('Error loading one or more Harvey data files. Check file paths:', error);
    return false;
  }
}

// Animation Controls

function nextTimestamp() {
    const slider = d3.select('#timestamp-slider').node();
    let nextIndex = parseInt(slider.value) + 1;

    if (nextIndex >= HARVEY_FILES.length) {
        stopAnimation();
        return;
    }
    
    slider.value = nextIndex;
    updateViewer(nextIndex);
}

function startAnimation() {
    if (timer) return; 

    const slider = d3.select('#timestamp-slider').node();
    if (parseInt(slider.value) === HARVEY_FILES.length - 1) {
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
function createViewerUI() {
  const container = d3.select(viewerId);

  container.html('');
  container.append('h3').text('Hurricane Harvey Progression Heatmap');
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
    .attr('max', HARVEY_FILES.length - 1)
    .attr('value', 0)
    .attr('step', 1)
    .on('input', function() {
      stopAnimation();
      updateViewer(+this.value);
    });

  // 3. Canvas Container 
  canvas = container.append('canvas')
    .attr('width', width)
    .attr('height', height)
    .attr('id', 'harvey-viewer-canvas')
    .node();
  
  ctx = canvas.getContext('2d');

  projection = d3.geoMercator()
    .scale(1) 
    .translate([width / 2, height / 2]);

  // fixed projection scale/center once
  projection.fitExtent([[0, 0], [width, height]], GLOBAL_BOUNDS_GEOJSON);

  colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([200, 300]);

  viewerReady = true;
  updateViewer(0);
}

/**
 * Renders heatmap data to the Canvas 
 */

function updateViewer(fileIndex) {
  if (!viewerReady) return;

  const fileName = HARVEY_FILES[fileIndex];
  const data = dataCache[fileName]; 

  if (!data || data.length === 0) {
      timestampLabel.text(`Timestamp: ${fileName.replace('.csv', '')} - (No Data Available)`);
      ctx.clearRect(0, 0, width, height); 
      return;
  }
  
  const match = fileName.match(/harvey_(\d{4})(\d{2})(\d{2})_(\d{2})Z/);
  if (match) {
    const [_, YYYY, MM, DD, HH] = match;
    const displayTime = `${MM}/${DD}/${YYYY} ${HH}:00`;
    timestampLabel.text(`Timestamp: ${displayTime}`);
  } else {
    timestampLabel.text(`Timestamp: (unknown)`);
  }

  
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

export async function initializeHarveyViewer() {
  const loadSuccess = await loadData();

  if (loadSuccess) {
    createViewerUI();
  } else {
    d3.select(viewerId).html('<p>Error: Could not load all Hurricane Harvey data files. Check file paths and accessibility.</p>');
  }
}