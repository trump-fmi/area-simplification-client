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
