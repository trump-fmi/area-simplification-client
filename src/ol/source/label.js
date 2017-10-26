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
    return 10000;
  } else {
    return Math.pow(2, 9 - (zoom - 1));
  }
}


/**
 * Builds a query in the format of:
 *    http://<label-server>/label/<label-type>?x_min=8&x_max=9&y_min=53&y_max=53.06&t_min=0.001
 */
ol.source.Label.prototype.buildQuery = function(params) {
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
