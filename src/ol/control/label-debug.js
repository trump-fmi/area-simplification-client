ol.control.LabelDebug = function(opt_options) {

  console.log("Initialising labeldebug");

  var options = opt_options ? opt_options : {};

  var className = options.className !== undefined ? options.className : 'ol-label-debug';

  var drawCirclesCheckbox = document.createElement('input');
  drawCirclesCheckbox.setAttribute('type', 'checkbox');
  drawCirclesCheckbox.id = "drawCirclesCheckbox";

  var drawCircleLabel = document.createElement('label');
  drawCircleLabel.htmlFor = "drawCirclesCheckbox";
  drawCircleLabel.appendChild(document.createTextNode('Draw circles around the labels.'))

  ol.events.listen(drawCirclesCheckbox, ol.events.EventType.CHANGE, 
    ol.control.LabelDebug.prototype.drawCircles_.bind(this));

  var cssClasses = className + ' ' + ol.css.CLASS_UNSELECTABLE + ' ' +
      ol.css.CLASS_CONTROL;
  var element = document.createElement('div');
  element.className = cssClasses;
  element.appendChild(drawCirclesCheckbox);
  element.appendChild(drawCircleLabel);

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });

  /**
   * @type {number}
   * @private
   */
  this.duration_ = options.duration !== undefined ? options.duration : 250;

};
ol.inherits(ol.control.LabelDebug, ol.control.Control);

ol.control.LabelDebug.prototype.drawCircles_ = function(event) {
  event.preventDefault();
  console.log("drawCirclesCheckbox, state changed.");
};

