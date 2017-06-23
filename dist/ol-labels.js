ol.layer.Label = function(opt_options) {

  var options = opt_options || {};

  if(!options.style) {
    // Set ol.style.Label as default style for ol.layer.Label
    options.style = this.styleFunction.bind(this);
  }

  ol.layer.Vector.call(this, options);
};
ol.inherits(ol.layer.Label, ol.layer.Vector);

/**
* StyleFunction to generate the style for a label.
* Doc: http://openlayers.org/en/latest/apidoc/ol.html#.StyleFunction
* @param {ol.Feature} feature - ol.Feature object with attributes from geojson data that represents an text label.
* @param {number} resolution - current resolution
*/
ol.layer.Label.prototype.styleFunction = function(feature, resolution) {
  // Create new ol.style.Label object
  return new ol.style.Label(feature);
};

ol.source.Label = function(org_options) {

  this.labelServerUrl = org_options.url;

  var options = {
    format:new ol.format.GeoJSON(),
    strategy:ol.loadingstrategy.bbox,
    url: this.featureLoader.bind(this)
  }

  // TODO: Search if there is a better solution than creating here a ol.View object
  this.viewToCalcZoomLevel = new ol.View();

  ol.source.Vector.call(this, options);
};
ol.inherits(ol.source.Label, ol.source.Vector);

/**
 * Feature loader function
 */
ol.source.Label.prototype.featureLoader = function(extent, number, projection){
  // extent: [minx, miny, maxx, maxy]
  //ol.proj.toLonLat takes coord-pair, so need to split
  var min = ol.proj.toLonLat(extent.slice(0, 2));
  var max = ol.proj.toLonLat(extent.slice(2, 4));

  var zoomLevelFromResolution = this.viewToCalcZoomLevel.getZoomForResolution(number);

  // Set global variable min_t
  // TODO: Find better solution than global variable
  min_t = window.min_t = this.zoomLevelToMinT(zoomLevelFromResolution);

  var parameters = {
      x_min: min[0],
      x_max: max[0],
      y_min: min[1],
      y_max: max[1],
      t_min: min_t
  };

  return this.buildQuery(parameters);
}

/*
 * Get corresponding mint t value for a given zoom level.
 * @param {number} zoom - current zoom level
 */
ol.source.Label.prototype.zoomLevelToMinT = function(zoom) {
  if (zoom <= 3) {
    return Number.POSITIVE_INFINITY;
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
        return params;
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
ol.style.Label = function(feature) {

  // Get needed fields from feature object
  var labelText = feature.get("name");
  var t = feature.get("t");
  var labelFactor = feature.get("lbl_fac");

  var labelTextColor = '#0000FF';
  var labelFontType = "Consolas";
  var labelCircleColor = "red";


  // Don#t show too big labels like a capital cityname on a high zoom levels
  if(window.min_t < 0.125 && t > 12){
    return null;
  }

  // Calculate the label size by the given value label factor
  var calculatedlabelFactor = 1.1 * parseInt(labelFactor);
  var fontConfig = labelFactor + "px " + labelFontType;

  // Remove escaped character from JSON format string: \\n to \n
  if (labelText.indexOf("\\") >= 0) {
    labelText = labelText.replace("\\n", "\n");
  }

  var maxLabelLength = this.getMaxLabelLength(labelText);
  var circleRadius = labelFactor * maxLabelLength * 0.26;

  this.image = new ol.style.Circle({
    radius: circleRadius,
    stroke: new ol.style.Stroke({
      color: labelCircleColor
    })
  });

  this.text = new ol.style.Text({
    text: labelText,
    font: fontConfig,
    fill: new ol.style.Fill({
      color: labelTextColor
    })
  });

  // Pass this Label object as options params for ol.style.Style
  ol.style.Style.call(this, this);
};
ol.inherits(ol.style.Label, ol.style.Style);


/**
 * Get max label length for the case that label has more than one row, e.g. Frankfurt\nam Main
 * @param {string} labelText - text of the label
 */
ol.style.Label.prototype.getMaxLabelLength = function(labelText) {

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
