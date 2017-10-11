ol.layer.Label = function(opt_options) {

  var options = opt_options || {};

  if(!options.style) {
    options.style = ol.style.Label
  }

  // If no preffered options for update while animating or interacting are given, set them as default to true
  if (options.updateWhileAnimating === undefined) {
    options.updateWhileAnimating = true;
  }
  if (options.updateWhileInteracting === undefined) {
    options.updateWhileInteracting = true;
  }


  ol.layer.Vector.call(this, options);
};
ol.inherits(ol.layer.Label, ol.layer.Vector);
