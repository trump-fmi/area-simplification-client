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
