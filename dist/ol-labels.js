ol.layer.Label = function(opt_options) {

  if(!opt_options.style) {
    opt_options.style = new ol.style.Style({
    	text: new ol.style.Label({
    		label_factor: 10,
        	name: 'Teststadt',
        	font_string: '',
        })
    })
  }

  ol.layer.Vector.call(this, opt_options);

};
ol.inherits(ol.layer.Label, ol.layer.Vector);

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

ol.style.Label = function(opt_options) {

  if (!opt_options.fill) {
    opt_options.fill = new ol.style.Fill({
      color: '#FF0000'
    })
  }
  opt_options.scale = 1;
  opt_options.font_string = this.computeScale.bind(this, opt_options);

  var options = {
    text: opt_options.name,
    scale: opt_options.scale,
    font: opt_options.font_string,
    fill: opt_options.fill,
  }

  ol.style.Text.call(this, options);
};
ol.inherits(ol.style.Label, ol.style.Text);


ol.style.Label.prototype.computeScale = function(opt_options) {
  var font_string = opt_options.label_factor + "px Ubuntu Mono";

  return font_string;
};
