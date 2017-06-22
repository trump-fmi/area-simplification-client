ol.layer.Label = function(opt_options) {

  var options = opt_options || {};

  if(!options.style) {
    // Set ol.style.Label as default style for ol.layer.Label
    options.style = new ol.style.Label();
  }

  ol.layer.Vector.call(this, options);
};
ol.inherits(ol.layer.Label, ol.layer.Vector);


ol.style.Label = function(opt_options) {
  return this.styleFunction;
};

/**
* StyleFunction to generate the style for the a label.
* Doc: http://openlayers.org/en/latest/apidoc/ol.html#.StyleFunction
* @param {ol.Feature} feature - ol.Feature object with attributes from geojson data that represents an text label.
* @param {number} resolution - current resolution
*/
ol.style.Label.prototype.styleFunction = function(feature, resolution) {
  var scale = 1; // 0.2 * (Math.log(feature.get("t")) - Math.log(min_t) + 0.5);

  var name = feature.get("name");
  var t = feature.get("t");

  if(window.min_t < 0.125 && t > 12){
    console.log(name);
    return null;
  }

  var label_factor = 1.1 * parseInt(feature.get("lbl_fac"));

  var font_string = label_factor + "px Consolas";

  // Remove escaped character for \\n to \n
  if (name.indexOf("\\") >= 0) {
    name = name.replace("\\n", "\n");
  }

  // Get max label length for case that label has more than one row, e.g. Frankfurt\nam Main
  var the_lines = name.split("\n");
  var max_length = 0;
  var arrayLength = the_lines.length;
  for (var i = 0; i < arrayLength; i++) {
     if (max_length < the_lines[i].length) {
      max_length = the_lines[i].length;
    }
  }

  // TODO: ?
  // ol.style.Style.call(this, options.style);

  // Create label style with text and circle
  var style = new ol.style.Style({
    image: new ol.style.Circle({
      radius: label_factor * max_length * 0.26,
      stroke: new ol.style.Stroke({
        color: "red",
        width: 1
      })
    }),
    text: new ol.style.Text({
      text: name,
      scale: scale,
      font: font_string,
      fill: new ol.style.Fill({
        color: '#0000FF'
      })
    })
  });

  return style;
};

ol.source.Label = function(org_options) {

  this.labelServerUrl = org_options.url;

  var options = {
    format:new ol.format.GeoJSON(),
    strategy:ol.loadingstrategy.bbox,
    url: this.featureLoader.bind(this)
  }

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

  // TODO: Don´t create a temporary View object for each call od featureLoader, find another solution
  var tempView = new ol.View();
  var zoomLevelFromResolution = tempView.getZoomForResolution(number);

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
