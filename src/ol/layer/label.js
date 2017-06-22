ol.layer.Label = function(opt_options) {

  var options = opt_options || {};

  if(!options.style) {
    // Set ol.style.Label as default style for ol.layer.Label
    options.style = new ol.style.Label();
  }

  ol.layer.Vector.call(this, options);
};
ol.inherits(ol.layer.Label, ol.layer.Vector);
