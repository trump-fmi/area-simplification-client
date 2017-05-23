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

ol.source.Label.prototype.featureLoader = function(extent, test, number){

    var min = ol.proj.toLonLat(extent.slice(0,2));
    var max = ol.proj.toLonLat(extent.slice(2,4));

    var parameters = {
        x_min: min[0],
        x_max: max[0],
        y_min: min[1],
        y_max: max[1],
        t_min: 0.001  //TODO: use real val
    };

    return this.buildQuery(parameters);
}


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
