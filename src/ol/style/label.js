ol.style.Label = function(opt_options) {

  this.computeScale(opt_options);

  if (!opt_options.fill) {
    opt_options.fill = new ol.style.Fill({
      color: '#FF0000'
    })
  }

  ol.style.Text.call(this, opt_options);

};
ol.inherits(ol.style.Text, ol.style.Fill);


ol.style.Label.prototype.computeScale = function(opt_options) {
  opt_options.scale = 0.2 * (
    Math.log(opt_options.t) - Math.log(opt_options.min_t) + 0.5);
};
