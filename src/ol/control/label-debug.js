ol.control.LabelDebug = function(opt_options) {

  var options = opt_options ? opt_options : {};

  var className = options.className !== undefined ? options.className : 'ol-label-debug';

  var defaultCSS = {
    'padding': '15px 10px 0px',
  }

  var rangeCSS = {
    'width': '200px',
  }

  // Checkbox for enabling the drawing of the circles
  var drawCirclesCheckboxDiv = document.createElement('div');
  Object.assign(drawCirclesCheckboxDiv.style, {
    'padding': '10px 10px 0px',
  });

  var drawCirclesCheckbox = document.createElement('input');
  drawCirclesCheckbox.setAttribute('type', 'checkbox');
  drawCirclesCheckbox.id = 'drawCirclesCheckbox';

  var drawCircleLabel = document.createElement('label');
  drawCircleLabel.htmlFor = 'drawCirclesCheckbox';
  drawCircleLabel.appendChild(drawCirclesCheckbox);
  drawCircleLabel.appendChild(document.createTextNode('Draw circles around the labels.'))

  drawCirclesCheckboxDiv.appendChild(drawCircleLabel);

  ol.events.listen(drawCirclesCheckbox, ol.events.EventType.CHANGE,
    ol.control.LabelDebug.prototype.toggleDrawCircles_.bind(this));

  window.debugDrawCirc = false;

  // Slider for coefficient of labelfactor
  var labelfactorSlider = document.createElement('div');
  Object.assign(labelfactorSlider.style, defaultCSS);

  var labelfactorRange = document.createElement('input');
  Object.assign(labelfactorRange.style, rangeCSS);
  labelfactorRange.setAttribute('type', 'range');
  labelfactorRange.setAttribute('id', 'labelfactorRange');
  labelfactorRange.setAttribute('min', '0.0');
  labelfactorRange.setAttribute('max', '3.0');
  labelfactorRange.setAttribute('step', '0.1');
  labelfactorRange.defaultValue = '1.1';

  var sliderLabel = document.createElement('label');
  sliderLabel.id = 'sliderLabel';
  sliderLabel.htmlFor = 'sliderLabel';
  sliderLabel.appendChild(document.createTextNode('Set the coefficient of the labelFactor. (1.1)'))

  labelfactorSlider.appendChild(sliderLabel);
  labelfactorSlider.appendChild(document.createElement('br'));
  labelfactorSlider.appendChild(labelfactorRange);

  ol.events.listen(labelfactorRange, ol.events.EventType.CHANGE,
    ol.control.LabelDebug.prototype.changeLabelFactor_.bind(this));

  window.labelFacCoeff = 1.1;

  // Slider for controlling the calculation of the min_t value
  var minTFactorSlider = document.createElement('div');
  Object.assign(minTFactorSlider.style, defaultCSS);

  var minTFactorRange = document.createElement('input');
  Object.assign(minTFactorRange.style, rangeCSS);
  minTFactorRange.setAttribute('type', 'range');
  minTFactorRange.setAttribute('id', 'minTFactorRange');
  minTFactorRange.setAttribute('min', '0.0');
  minTFactorRange.setAttribute('max', '20');
  minTFactorRange.setAttribute('step', '0.5');
  minTFactorRange.defaultValue = '9';

  var minTLabel = document.createElement('label');
  minTLabel.id = 'minTLabel';
  minTLabel.htmlFor = 'minTLabel';
  minTLabel.appendChild(document.createTextNode('Set the offset for the calculation of the min_t. (9)'))

  ol.events.listen(minTFactorRange, ol.events.EventType.CHANGE,
    ol.control.LabelDebug.prototype.changeMinTFactor_.bind(this));

  window.minTFac = 9;

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
  minTCoeffLabel.htmlFor = 'minTCoeffLabel';
  minTCoeffLabel.appendChild(document.createTextNode('Set the coefficient for the calculation of the min_t. (1.0)'))

  ol.events.listen(minTCoeffRange, ol.events.EventType.CHANGE,
    ol.control.LabelDebug.prototype.changeMinTCoeff_.bind(this));

  window.minTCoeff = 1.0;

  minTFactorSlider.appendChild(minTLabel);
  minTFactorSlider.appendChild(document.createElement('br'));
  minTFactorSlider.appendChild(minTFactorRange);
  minTFactorSlider.appendChild(document.createElement('br'));
  minTFactorSlider.appendChild(minTCoeffLabel);
  minTFactorSlider.appendChild(document.createElement('br'));
  minTFactorSlider.appendChild(minTCoeffRange);

  // Hide Button
  var hideButton = document.createElement('button');
  Object.assign(hideButton.style, {
    'padding': '15px 32px',
    'margin': '10px 10px',
    'width': 'auto',
    'float': 'right',
    'line-height': '0.0',
  });
  var hideButtonText = document.createTextNode('Hide');
  hideButton.appendChild(hideButtonText);
  ol.events.listen(hideButton, ol.events.EventType.CLICK,
    ol.control.LabelDebug.prototype.hideDebugMode_.bind(this));

  // the parent div
  var cssClasses = className + ' ' + ol.css.CLASS_UNSELECTABLE + ' ' +
    ol.css.CLASS_CONTROL;
  var element = document.createElement('div');
  var br = document.createElement('br');
  element.className = cssClasses;
  element.appendChild(hideButton);
  element.appendChild(drawCirclesCheckboxDiv);
  // element.appendChild(document.createElement('br'));
  element.appendChild(labelfactorSlider);
  // element.appendChild(document.createElement('br'));
  element.appendChild(minTFactorSlider);

  Object.assign(element.style, {
    background: 'lightgrey',
    left: '20px',
    bottom: '20px',
    width: '800px',
    // display: 'none',
  });

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });

  window.showDebugMode = ol.control.LabelDebug.prototype.showDebugMode_.bind(this);
};
ol.inherits(ol.control.LabelDebug, ol.control.Control);

ol.control.LabelDebug.prototype.toggleDrawCircles_ = function(event) {
  event.preventDefault();
  window.debugDrawCirc = document.getElementById('drawCirclesCheckbox').checked;
};

ol.control.LabelDebug.prototype.changeLabelFactor_ = function(event) {
  event.preventDefault();
  var range = document.getElementById('labelfactorRange');
  document.getElementById('sliderLabel').innerHTML = 'Set the coefficient of the labelFactor. (' + range.value + ')';
  window.labelFacCoeff = range.value;
};

ol.control.LabelDebug.prototype.changeMinTFactor_ = function(event) {
  event.preventDefault();
  var range = document.getElementById('minTFactorRange');
  document.getElementById('minTLabel').innerHTML = 'Set the offset for the calculation of the min_t. (' + range.value + ')';
  window.minTFac = range.value;
};

ol.control.LabelDebug.prototype.changeMinTCoeff_ = function(event) {
  event.preventDefault();
  var range = document.getElementById('minTCoeffRange');
  document.getElementById('minTCoeffLabel').innerHTML = 'Set the coefficient for the calculation of the min_t. (' + range.value + ')';
  window.minTCoeff = range.value;
};

ol.control.LabelDebug.prototype.hideDebugMode_ = function(event) {
  event.preventDefault();
  this.element.style.display = 'none';
};

ol.control.LabelDebug.prototype.showDebugMode_ = function() {
  this.element.style.display = 'inline-block';
};
