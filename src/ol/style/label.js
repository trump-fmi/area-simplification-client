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
