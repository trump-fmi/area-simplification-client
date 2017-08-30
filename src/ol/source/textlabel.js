ol.source.TextLabel = function(org_options) {
  ol.source.Label.call(this, org_options);
};

ol.source.TextLabel.prototype = Object.create(ol.source.Label.prototype);
ol.source.TextLabel.prototype.constructor = ol.source.TextLabel;

/**
 * Feature loader function
 * @param {Array} extent - Array that representisthe area to be loaded with: [minx, miny, maxx, maxy]
 * @param {number} number - the number representing the resolution (map units per pixel)
 * @param {ol.proj.Projection} projection - the projection that is used for this feature
 */
ol.source.TextLabel.prototype.featureLoader = function(extent, number, projection){
  return ol.source.Label.prototype.featureLoader.call(this, extent, number, projection);
}

/*
 * Get corresponding mint t value for a given zoom level.
 * @param {number} zoom - current zoom level
 */
ol.source.TextLabel.prototype.zoomLevelToMinT = function(zoom) {
  if (zoom <= 3) {
    return 0.01;
  } else {
    return Math.pow(2, 9 - (zoom - 1));
  }
}
