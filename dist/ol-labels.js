/**
 * Set of controls included in maps by default. Unless configured otherwise,
 * this returns a collection containing an instance of each of the following
 * controls:
 * * {@link ol.control.Zoom}
 * * {@link ol.control.Rotate}
 * * {@link ol.control.Attribution}
 *
 * @param {olx.control.DefaultsOptions=} opt_options Defaults options.
 * @return {ol.Collection.<ol.control.Control>} Controls.
 * @api
 */
ol.control.defaults = function(opt_options) {

  var options = opt_options ? opt_options : {};

  var controls = new ol.Collection();

  var zoomControl = options.zoom !== undefined ? options.zoom : true;
  if (zoomControl) {
    controls.push(new ol.control.Zoom(options.zoomOptions));
  }

  var rotateControl = options.rotate !== undefined ? options.rotate : true;
  if (rotateControl) {
    controls.push(new ol.control.Rotate(options.rotateOptions));
  }

  var attributionControl = options.attribution !== undefined ?
    options.attribution : true;
  if (attributionControl) {
    controls.push(new ol.control.Attribution(options.attributionOptions));
  }

  var labelDebugControl = options.labelDebug !== undefined ?
    options.labelDebug : true;
  if (labelDebugControl) {
    controls.push(new ol.control.LabelDebug(options.labelDebugOptions));
  }

  return controls;

};

ol.control.LabelDebug = function(opt_options) {

  // Override function resolutionToMinT if debug mode is active
  resolutionToMinT =  function resolutionToMinT(resolution) {
    var zoom = Math.log2(156543.03390625) - Math.log2(resolution);
    if (zoom <= 3) {
      return 0.01;
    } else {
      /* TODO: Find a better solaution than a global variable.
       * It must be possible to use the label source without the debug mode. */
      return window.minTCoeff * Math.pow(2, window.minTFac - (zoom - 1));
    }
  }

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

ol.layer.Label = function(opt_options) {

  var options = opt_options || {};

  if(!options.style) {
    options.style = ol.style.Label
  }

  ol.layer.Vector.call(this, options);
};
ol.inherits(ol.layer.Label, ol.layer.Vector);

ol.source.Label = function(org_options) {

  this.labelServerUrl = org_options.url;

  // TODO: Allow user to set own options here?!
  // overwrite needed options:
  org_options.format = new ol.format.GeoJSON();
  org_options.strategy = ol.loadingstrategy.bbox
  org_options.url = this.featureLoader.bind(this);
  org_options.updateWhileAnimating = true;
  org_options.updateWhileInteracting = true;

  ol.source.Vector.call(this, org_options);
};

ol.source.Label.prototype = Object.create(ol.source.Vector.prototype);

ol.source.Label.prototype.addFeatureInternal = function(feature) {
  var featureKey = feature.get('osm');

  if (!this.addToIndex_(featureKey, feature)) {
    return;
  }

  this.setupChangeEvents_(featureKey, feature);

  var geometry = feature.getGeometry();
  if (geometry) {
    var extent = geometry.getExtent();
    if (this.featuresRtree_) {
      this.featuresRtree_.insert(extent, feature);
    }
  } else {
    this.nullGeometryFeatures_[featureKey] = feature;
  }

  this.dispatchEvent(
      new ol.source.Vector.Event(ol.source.VectorEventType.ADDFEATURE, feature));
};


ol.source.Label.prototype.loadFeatures = function(extent, resolution, projection) {

  var loadedExtentsRtree = this.loadedExtentsRtree_;
  var extentsToLoad = this.strategy_(extent, resolution);
  var i, ii;
  for (i = 0, ii = extentsToLoad.length; i < ii; ++i) {
    var extentToLoad = extentsToLoad[i];
    var alreadyLoaded = loadedExtentsRtree.forEachInExtent(extentToLoad,
        /**
         * @param {{extent: ol.Extent}} object Object.
         * @return {boolean} Contains.
         */
        function(object) {
          // console.log(object,extentToLoad);
          return ol.extent.containsExtent(object.extent, extentToLoad) && resolution == object.resolution;
        });
    if (!alreadyLoaded) {
      this.loader_.call(this, extentToLoad, resolution, projection);
      loadedExtentsRtree.insert(extentToLoad, {extent: extentToLoad.slice(), resolution: resolution});
    }
  }
}

ol.source.Label.prototype.constructor = ol.source.Label;



/**
 * Feature loader function
 * @param {Array} extent - Array that representisthe area to be loaded with: [minx, miny, maxx, maxy]
 * @param {number} resolution - the number representing the resolution (map units per pixel)
 * @param {ol.proj.Projection} projection - the projection that is used for this feature
 */
ol.source.Label.prototype.featureLoader = function(extent, resolution, projection){
  // extent: [minx, miny, maxx, maxy]
  //ol.proj.toLonLat takes coord-pair, so need to split
  var min = ol.proj.toLonLat(extent.slice(0, 2));
  var max = ol.proj.toLonLat(extent.slice(2, 4));

  // Calculate mint_t value for label request
  var min_t = resolutionToMinT(resolution);

  var parameters = {
      x_min: min[0],
      x_max: max[0],
      y_min: min[1],
      y_max: max[1],
      t_min: min_t
  };

  return this.buildQuery(parameters);
}

/**
 * Calculate the min_t value from the resolution.
 * @param {number} resolution - current resolution
 */
function resolutionToMinT(resolution) {
  var zoom = Math.log2(156543.03390625) - Math.log2(resolution);
  if (zoom <= 3) {
    return 0.01;
  } else {
    return Math.pow(2, 9 - (zoom - 1));
  }
}


/**
 * Builds a query in the format of:
 *    http://<label-server>/label/<label-type>?x_min=8&x_max=9&y_min=53&y_max=53.06&t_min=0.001
 */
ol.source.Label.prototype.buildQuery = function(params){
  if (typeof params === 'undefined' || typeof params !== 'object') {
        params = {};
    }
    var query = '?';
    var index = 0;
    for (var i in params) {
        index++;
        var param = i;
        var value = params[i];
        if (index == 1) {
            query += param + '=' + value;
        } else {
            query += '&' + param + '=' + value;
        }
    }
    return this.labelServerUrl + query;
}


/*
 * Constructor of ol.style.Label
 * @param {ol.Feature} feature - ol.Feature object with attributes from geojson data that represents an text label.
 */
ol.style.Label = function(feature, resolution) {

  // Get needed fields from feature object
  var labelText = feature.get("name");
  var t = feature.get("t");
  var labelFactor = feature.get("lbl_fac");

  var labelTextColor = '#fff';
  var labelBorderColor = '#333';
  var labelFontType = "Consolas";
  var labelCircleColor = "red";

  var min_t = resolutionToMinT(resolution);

  if(min_t > t){
    // console.log(labelText, window.min_t, t);
    return null;
  }

  // Calculate the label size by the given value label factor
  var calculatedlabelFactor = window.labelFacCoeff * parseInt(labelFactor);
  var fontConfig = calculatedlabelFactor + "px " + labelFontType;

  // Remove escaped character from JSON format string: \\n to \n
  if (labelText.indexOf("\\") >= 0) {
    labelText = labelText.replace("\\n", "\n");
  }

  var maxLabelLength = getMaxLabelLength(labelText);
  var circleRadius = calculatedlabelFactor * maxLabelLength * 0.26;

  this.image = new ol.style.Circle({
    radius: circleRadius,
    stroke: new ol.style.Stroke({
      color: labelCircleColor
    })
  });

  this.text = new ol.style.Text({
    text: labelText,
    font: fontConfig,
    stroke: new ol.style.Stroke({
      color: labelBorderColor,
      width: 4
    }),
    fill: new ol.style.Fill({
      color: labelTextColor
    })
  });

  if(min_t < 1.1 && t > 12){
    this.text = new ol.style.Text({
      text: labelText,
      font: fontConfig,
      stroke: new ol.style.Stroke({
        color: [255, 255, 255, .6],
        width: 2
      }),
      fill: new ol.style.Fill({
        color: [0, 0, 0, .5]
      })
    });
  }

  if(min_t < 0.3 && t > 12){
    return null;
  }

  var style = new ol.style.Style({
    image: window.debugDrawCirc == true ? this.image : null,
    text: this.text
  });

  return style;

  // Pass this Label object as options params for ol.style.Style
  // ol.style.Style.call(this, this);
};


/**
 * Get max label length for the case that label has more than one row, e.g. Frankfurt\nam Main
 * @param {string} labelText - text of the label
 */
function getMaxLabelLength(labelText) {

  var lines = labelText.split("\n");
  var maxLength = 0;
  var arrayLength = lines.length;
  for (var i = 0; i < arrayLength; i++) {
     if (maxLength < lines[i].length) {
      maxLength = lines[i].length;
    }
  }
  return maxLength;
};
