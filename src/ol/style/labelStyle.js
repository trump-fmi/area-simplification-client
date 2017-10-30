ol.style.labelStyle = function(feature,resolution) {
  // create new label
  var label = new ol.Label(feature, resolution);
  return label.render();
}
