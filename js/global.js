import * as d3 from 'd3';
import scrollama from 'scrollama';

// Import all section modules
import { 
    initializeHook, 
    onEnterHook, 
    onExitHook, 
    onProgressHook 
} from './sections/hook.js';

import { 
    initializeWhatIsHurricane, 
    onEnterWhatIsHurricane, 
    onExitWhatIsHurricane, 
    onProgressWhatIsHurricane 
} from './sections/what-is-hurricane.js';

import { 
    initializeBuildHurricane, 
    onEnterBuildHurricane, 
    onExitBuildHurricane, 
    onProgressBuildHurricane 
} from './sections/build-hurricane.js';

import { 
    initializeClickHurricanes, 
    onEnterClickHurricanes, 
    onExitClickHurricanes, 
    onProgressClickHurricanes 
} from './sections/click-hurricanes.js';

import { 
    initializeDestructiveTrends, 
    onEnterDestructiveTrends, 
    onExitDestructiveTrends, 
    onProgressDestructiveTrends 
} from './sections/destructive-trends.js';

import { 
    initializePreparednessAction, 
    onEnterPreparednessAction, 
    onExitPreparednessAction, 
    onProgressPreparednessAction 
} from './sections/preparedness-action.js';

// Initialize Scrollama
const scroller = scrollama();

// Store current section
let currentSection = 0;
const sections = [
    { 
        id: 'hook-section', 
        title: 'Hook',
        initialize: initializeHook,
        onEnter: onEnterHook,
        onExit: onExitHook,
        onProgress: onProgressHook
    },
    { 
        id: 'what-is-hurricane-section', 
        title: 'What is a Hurricane?',
        initialize: initializeWhatIsHurricane,
        onEnter: onEnterWhatIsHurricane,
        onExit: onExitWhatIsHurricane,
        onProgress: onProgressWhatIsHurricane
    },
    { 
        id: 'build-hurricane-section', 
        title: 'Build Your Own Hurricane',
        initialize: initializeBuildHurricane,
        onEnter: onEnterBuildHurricane,
        onExit: onExitBuildHurricane,
        onProgress: onProgressBuildHurricane
    },
    { 
        id: 'click-hurricanes-section', 
        title: 'Click on Different Hurricanes',
        initialize: initializeClickHurricanes,
        onEnter: onEnterClickHurricanes,
        onExit: onExitClickHurricanes,
        onProgress: onProgressClickHurricanes
    },
    { 
        id: 'destructive-trends-section', 
        title: 'Destructive Power & Trends',
        initialize: initializeDestructiveTrends,
        onEnter: onEnterDestructiveTrends,
        onExit: onExitDestructiveTrends,
        onProgress: onProgressDestructiveTrends
    },
    { 
        id: 'preparedness-action-section', 
        title: 'Preparedness & Action',
        initialize: initializePreparednessAction,
        onEnter: onEnterPreparednessAction,
        onExit: onExitPreparednessAction,
        onProgress: onProgressPreparednessAction
    }
];

// Initialize all visualizations
function initializeVisualizations() {
    console.log('Initializing hurricane visualizations...');
    
    // Initialize each section
    sections.forEach((section, index) => {
        console.log(`Initializing section ${index + 1}: ${section.title}`);
        section.initialize();
    });
}

// Setup Scrollama
function setupScrollama() {
    scroller
        .setup({
            step: '.scroll-section',
            offset: 0.6, // Trigger when section is 60% in view
            progress: true,
            debug: false,
            order: false
        })
        .onStepEnter(handleStepEnter)
        .onStepExit(handleStepExit)
        .onStepProgress(handleStepProgress);
    
    // Handle window resize
    window.addEventListener('resize', scroller.resize);
}

// Handle step enter
function handleStepEnter(response) {
    console.log('Entering section:', response.index + 1, response.element.id);
    currentSection = response.index;
    
    // Update progress indicator
    updateProgressIndicator();
    
    // Update navigation buttons
    updateNavigationButtons(); 
    
    // Add active class to current section
    d3.selectAll('.scroll-section').classed('active', false);
    d3.select(response.element).classed('active', true);
    
    // Trigger section-specific actions
    const section = sections[response.index];
    if (section && section.onEnter) {
        section.onEnter();
    }
}

// Handle step exit - UPDATED LOGIC
function handleStepExit(response) {
    console.log('Exiting section:', response.index + 1, 'Direction:', response.direction);
    
    // Trigger onExit() only for the section that just left the visible scroll area.
    const section = sections[response.index];
    if (section && section.onExit) {
        // We trigger onExit regardless of direction to ensure clean-up (e.g., removing SVGs, tooltips)
        section.onExit();
    }
}

// Handle step progress (for parallax effects)
function handleStepProgress(response) {
    // You can use this for parallax effects or progressive animations
    if (sections[response.index] && sections[response.index].onProgress) {
        sections[response.index].onProgress(response.progress);
    }
}

// Update progress indicator
function updateProgressIndicator() {
    d3.select('#progress-indicator')
        .html(`Section ${currentSection + 1} of ${sections.length}<br><small>${sections[currentSection].title}</small>`);
}

// Add keyboard navigation
function setupKeyboardNavigation() {
    window.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown' || event.key === 'PageDown') {
            event.preventDefault();
            scrollToSection(currentSection + 1);
        } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
            event.preventDefault();
            scrollToSection(currentSection - 1);
        // } else if (event.key >= '1' && event.key <= '6') {
        //     event.preventDefault();
        //     scrollToSection(parseInt(event.key) - 1);
        } else if (event.key === 'Home') {
            event.preventDefault();
            scrollToSection(0);
        } else if (event.key === 'End') {
            event.preventDefault();
            scrollToSection(sections.length - 1);
        }
    });
}

// Scroll to specific section
function scrollToSection(index) {
    if (index < 0 || index >= sections.length) return;
    
    const section = document.getElementById(sections[index].id);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Add section navigation buttons (INLINE STYLES REMOVED)
function addSectionNavigation() {
    const navContainer = d3.select('body')
        .append('div')
        .attr('id', 'section-navigation'); // Styles via CSS
    
    navContainer.append('button')
        .attr('id', 'prev-section')
        .text('↑ Previous')
        .on('click', () => scrollToSection(currentSection - 1));
    
    navContainer.append('button')
        .attr('id', 'next-section')
        .text('Next ↓')
        .on('click', () => scrollToSection(currentSection + 1));
}

// Update navigation button states
function updateNavigationButtons() {
    d3.select('#prev-section')
        .style('opacity', currentSection === 0 ? 0.5 : 1)
        .style('cursor', currentSection === 0 ? 'not-allowed' : 'pointer');
    
    d3.select('#next-section')
        .style('opacity', currentSection === sections.length - 1 ? 0.5 : 1)
        .style('cursor', currentSection === sections.length - 1 ? 'not-allowed' : 'pointer');
}

// Initialize everything
async function init() {
    console.log('Starting Hurricane Scrollarama with 6 sections...');
    
    // Add section navigation buttons
    addSectionNavigation();
    
    // Initialize visualizations
    initializeVisualizations();
    
    // Setup Scrollama
    setupScrollama();
    
    // Initial updates (needed because 'init' fires before the first scrollama event)
    updateProgressIndicator();
    updateNavigationButtons();
    
    // Setup keyboard navigation
    setupKeyboardNavigation();
    
    // Update buttons on section change (MutationObserver is still needed since onStepEnter 
    // fires faster than the navigation buttons can be updated after an explicit scroll call)
    const observer = new MutationObserver(updateNavigationButtons);
    const indicator = document.getElementById('progress-indicator');
    if (indicator) {
        observer.observe(indicator, { 
            childList: true, 
            characterData: true,
            subtree: true
        });
    }

    console.log('Hurricane Scrollarama initialized successfully!');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Export for module usage (optional, but good practice)
export { scrollToSection, currentSection, sections };