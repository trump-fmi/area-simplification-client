ol.control.LabelDebug = function(opt_options) {

  var options = opt_options ? opt_options : {};

  var className = options.className !== undefined ? options.className : 'ol-label-debug';

  // Checkbox for enabling the drawing of the circles
  var drawCirclesCheckbox = document.createElement('input');
  drawCirclesCheckbox.setAttribute('type', 'checkbox');
  drawCirclesCheckbox.id = "drawCirclesCheckbox";

  var drawCircleLabel = document.createElement('label');
  drawCircleLabel.htmlFor = "drawCirclesCheckbox";
  drawCircleLabel.appendChild(document.createTextNode('Draw circles around the labels.'))

  ol.events.listen(drawCirclesCheckbox, ol.events.EventType.CHANGE, 
    ol.control.LabelDebug.prototype.drawCircles_.bind(this));

  // the parent div
  var cssClasses = className + ' ' + ol.css.CLASS_UNSELECTABLE + ' ' +
      ol.css.CLASS_CONTROL;
  var element = document.createElement('div');
  element.className = cssClasses;
  element.appendChild(drawCirclesCheckbox);
  element.appendChild(drawCircleLabel);
  Object.assign(element.style,{background:"green", bottom:"65px"});

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });  

};
ol.inherits(ol.control.LabelDebug, ol.control.Control);

ol.control.LabelDebug.prototype.drawCircles_ = function(event) {
  event.preventDefault();
  // TODO: enable/disable circles
};

