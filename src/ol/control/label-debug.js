ol.control.LabelDebug = function(opt_options) {

  var options = opt_options || {};
  var className = options.className !== undefined ? options.className : 'ol-label-debug';

  this.state = {
    open: false,
    layers: []
  };

  this.btn = document.createElement('button');
  this.btn.className = 'menu-toggle-button';
  this.buttonIcon = {
    openMenu: '>_',
    closeMenu: 'X'
  }
  this.btn.innerHTML = this.buttonIcon.openMenu;
  ol.events.listen(this.btn, ol.events.EventType.CLICK, this.toggleMenu, this);

  this.container = document.createElement('div');
  this.container.className = 'ol-label-debug ol-control ol-collapsed';

  this.menu = document.createElement('div');
  this.menu.className = '';

  this.container.appendChild(this.btn);
  this.container.appendChild(this.menu);

  ol.control.Control.call(this, {
    element: this.container,
    target: options.target
  });
};
// Inherit from ol.control.Control class
ol.inherits(ol.control.LabelDebug, ol.control.Control);

ol.control.LabelDebug.prototype.toggleMenu = function() {
  if(this.state.open === true) {
    this.closeMenu();
  } else {
    this.openMenu();
  }

  this.state.open = !this.state.open;
}

ol.control.LabelDebug.prototype.openMenu = function() {

  var map = this.getMap();
  var layers = map.getLayers();

  this.btn.innerHTML = this.buttonIcon.closeMenu;
  // this.container.classList.remove('ol-collapsed');
  this.menu.style.display = '';

  if(this.menu.innerHTML.length == 0){
    this.renderMenuContents();
  };

}

ol.control.LabelDebug.prototype.closeMenu = function(){

  var map = this.getMap();
  var layers = map.getLayers();

  // this.container.classList.add('ol-collapsed');

  this.btn.innerHTML = this.buttonIcon.openMenu;
  this.menu.style.display = "none";

}

ol.control.LabelDebug.prototype.renderMenuContents = function() {
  // var menuContent = document.createElement("div");
  // menuContent.innerHTML = "Test<br>Test 12344";

  var map = this.getMap();

  var rangeCSS = {
    'width': '300px',
  }

  var rowContainerTemplate = document.createElement('div');
  Object.assign(rowContainerTemplate.style, {
    'margin': '10px',
  });

  // Checkbox for enabling the drawing of the circles
  var drawCirclesCheckboxContainer = rowContainerTemplate.cloneNode();

  var drawCirclesCheckbox = document.createElement('input');
  drawCirclesCheckbox.setAttribute('type', 'checkbox');
  drawCirclesCheckbox.id = 'drawCirclesCheckbox';

  var drawCircleLabel = document.createElement('label');
  drawCircleLabel.htmlFor = 'drawCirclesCheckbox';
  drawCircleLabel.appendChild(drawCirclesCheckbox);
  drawCircleLabel.appendChild(document.createTextNode('Draw circles around the labels.'))

  drawCirclesCheckboxContainer.appendChild(drawCircleLabel);

  ol.events.listen(drawCirclesCheckbox, ol.events.EventType.CHANGE,
    ol.control.LabelDebug.prototype.toggleDrawCircles_.bind(this));

  window.debugDrawCirc = false;

  // Slider for coefficient of labelfactor
  var labelfactorSliderContainer = rowContainerTemplate.cloneNode();

  var labelfactorRange = document.createElement('input');
  Object.assign(labelfactorRange.style, rangeCSS);
  labelfactorRange.setAttribute('type', 'range');
  labelfactorRange.setAttribute('id', 'labelfactorRange');
  labelfactorRange.setAttribute('min', '0.0');
  labelfactorRange.setAttribute('max', '3.0');
  labelfactorRange.setAttribute('step', '0.1');
  labelfactorRange.defaultValue = '1.1';

  var labelfactorLabel = document.createElement('label');
  labelfactorLabel.id = 'sliderLabel';
  labelfactorLabel.htmlFor = 'labelfactorRange';
  labelfactorLabel.appendChild(document.createTextNode('Set the coefficient of the labelFactor. (1.1)'))

  labelfactorSliderContainer.appendChild(labelfactorLabel);
  labelfactorSliderContainer.appendChild(document.createElement('br'));
  labelfactorSliderContainer.appendChild(labelfactorRange);

  ol.events.listen(labelfactorRange, "input",
    ol.control.LabelDebug.prototype.changeLabelFactor_.bind(this));

  window.labelFacCoeff = 1.1;

  // Slider for controlling the calculation of the min_t value
  var minTFactorSliderContainer = rowContainerTemplate.cloneNode();

  var minTFactorRange = document.createElement('input');
  Object.assign(minTFactorRange.style, rangeCSS);
  minTFactorRange.setAttribute('type', 'range');
  minTFactorRange.setAttribute('id', 'minTFactorRange');
  minTFactorRange.setAttribute('min', '0.0');
  minTFactorRange.setAttribute('max', '20');
  minTFactorRange.setAttribute('step', '0.1');
  minTFactorRange.defaultValue = '9';

  var minTLabel = document.createElement('label');
  minTLabel.id = 'minTLabel';
  minTLabel.htmlFor = 'minTFactorRange';
  minTLabel.appendChild(document.createTextNode('Set the offset for the calculation of the min_t. (9)'))

  ol.events.listen(minTFactorRange, "input",
    ol.control.LabelDebug.prototype.changeMinTFactor_.bind(this));

  minTFactorSliderContainer.appendChild(minTLabel);
  minTFactorSliderContainer.appendChild(document.createElement('br'));
  minTFactorSliderContainer.appendChild(minTFactorRange);

  window.minTFac = 9;

  // TODO new

  var minTCoeffRangeContainer = rowContainerTemplate.cloneNode();

  var minTCoeffRange = document.createElement('input');
  Object.assign(minTCoeffRange.style, rangeCSS);
  minTCoeffRange.setAttribute('type', 'range');
  minTCoeffRange.setAttribute('id', 'minTCoeffRange');
  minTCoeffRange.setAttribute('min', '0.0');
  minTCoeffRange.setAttribute('max', '5');
  minTCoeffRange.setAttribute('step', '0.1');
  minTCoeffRange.defaultValue = '1.0';

  var minTCoeffLabel = document.createElement('label');
  minTCoeffLabel.id = 'minTCoeffLabel';
  minTCoeffLabel.htmlFor = 'minTCoeffRange';
  minTCoeffLabel.appendChild(document.createTextNode('Set the coefficient for the calculation of the min_t. (1.0)'))

  ol.events.listen(minTCoeffRange, "input",
    ol.control.LabelDebug.prototype.changeMinTCoeff_.bind(this));

  minTCoeffRangeContainer.appendChild(minTCoeffLabel);
  minTCoeffRangeContainer.appendChild(document.createElement('br'));
  minTCoeffRangeContainer.appendChild(minTCoeffRange);

  window.minTCoeff = 1.0;

  /* Create slider control for zoom level */
  var zoomSliderContainer = rowContainerTemplate.cloneNode();

  var zoomLevelDelta = document.createElement('input');
  Object.assign(zoomLevelDelta.style, {
    'margin-left': '10px',
    'width': '50px'
  });
  zoomLevelDelta.setAttribute('type', 'number');
  zoomLevelDelta.setAttribute('id', 'zoomLevelDelta');
  zoomLevelDelta.setAttribute('min', '0.0');
  zoomLevelDelta.setAttribute('max', '10.0');
  zoomLevelDelta.setAttribute('step', '0.1');
  zoomLevelDelta.setAttribute('value', '1.0');

  var zoomSliderInput = document.createElement('input');
  Object.assign(zoomSliderInput.style, {
    'width': '600px',
    'margin-top': '10px'
  });
  zoomSliderInput.setAttribute('type', 'range');
  zoomSliderInput.setAttribute('id', 'zoomSliderInput');
  zoomSliderInput.setAttribute('min', 0.0);
  zoomSliderInput.setAttribute('max', 28.0);
  zoomSliderInput.setAttribute('step', zoomLevelDelta.value);
  zoomSliderInput.defaultValue = map.getView().getZoom();

  var zoomSliderLabel = document.createElement('label');
  zoomSliderLabel.id = 'zoomSliderLabel';
  zoomSliderLabel.htmlFor = 'zoomSliderInput';
  zoomSliderLabel.appendChild(document.createTextNode('Use the slider to change the zoom level with the defined zoom delta:'))

  var zoomLevelLabel = document.createElement('label');
  Object.assign(zoomLevelLabel.style, {
    'margin-left': '10px',
    'position': 'relative',
    'top': '-6px'
  });
  zoomLevelLabel.id = 'zoomLevelLabel';
  zoomLevelLabel.htmlFor = 'zoomLevelLabel';
  zoomLevelLabel.appendChild(document.createTextNode("zoom: " + map.getView().getZoom()));

  // Add onchange listener for zoomLevelDelta
  ol.events.listen(zoomLevelDelta, "input", zoomDeltaChange);
  function zoomDeltaChange() {
    zoomSliderInput.setAttribute('step', zoomLevelDelta.value);
  }

  // Add on input listener for zoomSliderInput
  ol.events.listen(zoomSliderInput, "input", changeZoomLevel);
  function changeZoomLevel() {
    document.getElementById('zoomLevelLabel').innerHTML = "zoom: " + zoomSliderInput.value;
    map.getView().setZoom(zoomSliderInput.value);
  }

  // Add listener on view to detect changes on zoom level
  map.on("moveend", function(e) {
    // Get zoom level and round to 3 decimal places
    var newZoomLevel = map.getView().getZoom();
    newZoomLevel = Math.round(newZoomLevel * 1000) / 1000;
    document.getElementById('zoomLevelLabel').innerHTML = "zoom: " + newZoomLevel;
    document.getElementById('zoomSliderInput').value = newZoomLevel;
  });

  // Add zoom slider
  zoomSliderContainer.appendChild(zoomSliderLabel);
  zoomSliderContainer.appendChild(zoomLevelDelta);
  zoomSliderContainer.appendChild(document.createElement('br'));
  zoomSliderContainer.appendChild(zoomSliderInput);
  zoomSliderContainer.appendChild(zoomLevelLabel);


  var demoModeControlContainer = rowContainerTemplate.cloneNode();
  var demoModeControlBtn = document.createElement('button');
  demoModeControlBtn.className = 'demo-mode-button';
  demoModeControlBtn.id = 'demoModeControlBtn';
  demoModeControlBtn.isDemoModeRunning = false;
  demoModeControlBtn.innerHTML = '&#9658';

  var demoModeControlLabel = document.createElement('label');
  demoModeControlLabel.id = 'demoModeControlLabel';
  demoModeControlLabel.htmlFor = 'demoModeControlBtn';
  demoModeControlLabel.innerHTML = 'Demo mode: ';

  ol.events.listen(demoModeControlBtn, ol.events.EventType.CLICK, toggleDemoMode);
  var this_ = this;
  function toggleDemoMode() {
    if (this.isDemoModeRunning) { // Demo is currently running
      demoModeControlBtn.innerHTML = '&#9658;'; // Play icon
      this_.stopDemoMode_();
    } else { // Demo mode is not running, start it
      demoModeControlBtn.innerHTML = '&#10074;&#10074;'; // Stop icon
      this_.startDemoMode_();
    }
    this.isDemoModeRunning = !this.isDemoModeRunning;
  }
  demoModeControlContainer.appendChild(demoModeControlLabel);
  demoModeControlContainer.appendChild(demoModeControlBtn);

  // Create container div for all debug menu entries
  var menuContent = document.createElement('div');
  menuContent.appendChild(drawCirclesCheckboxContainer);
  menuContent.appendChild(labelfactorSliderContainer);
  menuContent.appendChild(minTFactorSliderContainer);
  menuContent.appendChild(minTCoeffRangeContainer);
  menuContent.appendChild(zoomSliderContainer);
  menuContent.appendChild(demoModeControlContainer);

  this.menu.appendChild(menuContent);

  // Override function resolutionToMinT if debug mode is active
  resolutionToMinT = this.resolutionToMinT;
  // Override function calculateLabelFactor if debug mode is active
  calculateLabelFactor = this.calculateLabelFactor;
}

ol.control.LabelDebug.prototype.toggleDrawCircles_ = function(event) {
  event.preventDefault();
  window.debugDrawCirc = document.getElementById('drawCirclesCheckbox').checked;
  this.updateLabelLayer_();
};

ol.control.LabelDebug.prototype.changeLabelFactor_ = function(event) {
  event.preventDefault();
  var range = document.getElementById('labelfactorRange');
  document.getElementById('sliderLabel').innerHTML = 'Set the coefficient of the labelFactor. (' + range.value + ')';
  window.labelFacCoeff = range.value;
  this.updateLabelLayer_();
};

ol.control.LabelDebug.prototype.changeMinTFactor_ = function(event) {
  event.preventDefault();
  var range = document.getElementById('minTFactorRange');
  document.getElementById('minTLabel').innerHTML = 'Set the offset for the calculation of the min_t. (' + range.value + ')';
  window.minTFac = range.value;
  this.updateLabelLayer_();
};

ol.control.LabelDebug.prototype.changeMinTCoeff_ = function(event) {
  event.preventDefault();
  var range = document.getElementById('minTCoeffRange');
  document.getElementById('minTCoeffLabel').innerHTML = 'Set the coefficient for the calculation of the min_t. (' + range.value + ')';
  window.minTCoeff = range.value;
  this.updateLabelLayer_();
};

ol.control.LabelDebug.prototype.updateLabelLayer_ = function() {
  // Refresh layers after updating the draw circle settings
  this.getMap().getLayers().forEach(function(layer) {
    if (layer instanceof ol.layer.Label) {
      layer.getSource().refresh();
    }
  });
}

ol.control.LabelDebug.prototype.startDemoMode_ = function() {
  startDemoMode();
}

ol.control.LabelDebug.prototype.stopDemoMode_ = function() {
  var view = this.getMap().getView();
  // Only found workaround solution for stopping a running animation: https://github.com/openlayers/openlayers/issues/3714
  view.setResolution(view.getResolution());
}

ol.control.LabelDebug.prototype.resolutionToMinT = function (resolution) {
  var zoom = Math.log2(156543.03390625) - Math.log2(resolution);
  if (zoom <= 3) {
    return 10000;
  } else {
    /* TODO: Find a better solaution than a global variable.
     * It must be possible to use the label source without the debug mode. */
    var calculatedMinT = window.minTCoeff * Math.pow(2, window.minTFac - (zoom - 1));
    return calculatedMinT;
  }
}

ol.control.LabelDebug.prototype.calculateLabelFactor = function (feature) {
  var labelFactor = feature.get("lbl_fac");
  var calculatedLabelFactor = parseInt(labelFactor) * window.labelFacCoeff;
  return calculatedLabelFactor;
}
