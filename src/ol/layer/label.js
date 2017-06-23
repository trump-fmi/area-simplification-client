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
  var options = {};
  options.feature = feature;
  options.resolution = resolution;
  return new ol.style.Label(options);
};
