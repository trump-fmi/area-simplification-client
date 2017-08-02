ol.control.LabelDebug = function(opt_options) {

  var options = opt_options ? opt_options : {};

  var className = options.className !== undefined ? options.className : 'ol-label-debug';

  // window.labelDebug = false;

  var defaultCSS = {
    'padding': '2px 10px'
  }

  // Checkbox for enabling the drawing of the circles
  var drawCirclesCheckboxDiv = document.createElement('div');
  Object.assign(drawCirclesCheckboxDiv.style, defaultCSS);

  var drawCirclesCheckbox = document.createElement('input');
  drawCirclesCheckbox.setAttribute('type', 'checkbox');
  drawCirclesCheckbox.id = 'drawCirclesCheckbox';

  var drawCircleLabel = document.createElement('label');
  drawCircleLabel.htmlFor = 'drawCirclesCheckbox';
  drawCircleLabel.appendChild(document.createTextNode('Draw circles around the labels.'))

  drawCirclesCheckboxDiv.appendChild(drawCirclesCheckbox);
  drawCirclesCheckboxDiv.appendChild(drawCircleLabel);

  ol.events.listen(drawCirclesCheckbox, ol.events.EventType.CHANGE,
    ol.control.LabelDebug.prototype.toggleDrawCircles_.bind(this));

  // Slider for coefficient of labelfactor
  var labelfactorSlider = document.createElement('div');
  Object.assign(labelfactorSlider.style, defaultCSS);

  var labelfactorRange = document.createElement('input');
  labelfactorRange.setAttribute('type', 'range');
  labelfactorRange.id = 'labelfactorRange';
  labelfactorRange.min = '0.0';
  labelfactorRange.max = '3.0';
  labelfactorRange.step = '0.1';
  labelfactorRange.defaultValue = '1.1';

  var sliderLabel = document.createElement('label');
  sliderLabel.htmlFor = 'sliderLabel';
  sliderLabel.appendChild(document.createTextNode('Set the coefficient of the labelFactor.'))

  labelfactorSlider.appendChild(sliderLabel);
  labelfactorSlider.appendChild(document.createElement('br'));
  labelfactorSlider.appendChild(labelfactorRange);

  ol.events.listen(labelfactorRange, ol.events.EventType.CHANGE,
    ol.control.LabelDebug.prototype.changeLabelFactor_.bind(this));

  // Hide Button
  var hideButton = document.createElement('button');
  Object.assign(hideButton.style, {
    'padding': '15px 32px',
    'margin': '2px 10px',
    'width': 'auto',
  });
  var hideButtonText = document.createTextNode('Hide debug mode');
  hideButton.appendChild(hideButtonText);
  ol.events.listen(hideButton, ol.events.EventType.CLICK,
    ol.control.LabelDebug.prototype.hideDebugMode_.bind(this));

  // the parent div
  var cssClasses = className + ' ' + ol.css.CLASS_UNSELECTABLE + ' ' +
    ol.css.CLASS_CONTROL;
  var element = document.createElement('div');
  var br = document.createElement('br');
  element.className = cssClasses;
  element.appendChild(drawCirclesCheckboxDiv);
  element.appendChild(document.createElement('br'));
  element.appendChild(labelfactorSlider);
  element.appendChild(document.createElement('br'));
  element.appendChild(hideButton);

  Object.assign(element.style, {
    background: 'lightgrey',
    bottom: '20px',
    width: '800px',
    // display: 'none',
  });

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
};
ol.inherits(ol.control.LabelDebug, ol.control.Control);

ol.control.LabelDebug.prototype.toggleDrawCircles_ = function(event) {
  event.preventDefault();
  // TODO: test enable/disable circles
  window.debugDrawCirc = document.getElementById('drawCirclesCheckbox').checked;
};

ol.control.LabelDebug.prototype.changeLabelFactor_ = function(event) {
  event.preventDefault();
  // TODO: test change coefficient of the labelFactor
  var range = document.getElementById('labelfactorRange');
  window.labelFacCoeff = range.value;
};

ol.control.LabelDebug.prototype.hideDebugMode_ = function(event) {
  event.preventDefault();
  this.element.style.display = 'none';
  // window.labelDebug = false;
};

ol.control.LabelDebug.prototype.showDebugMode_ = function(event) {
  console.log("showDebugMode_");
  event.preventDefault();
  this.element.style.display = 'inline-block';
};

