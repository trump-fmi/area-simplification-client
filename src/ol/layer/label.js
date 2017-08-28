ol.layer.Label = function(opt_options) {

	var options = opt_options || {};

	if (!options.style) {
		if (options.title == 'Icons') {
			options.style = ol.style.IconLabel;
		} else {
			options.style = ol.style.Label;
		}
	}

	ol.layer.Vector.call(this, options);
};
ol.inherits(ol.layer.Label, ol.layer.Vector);
