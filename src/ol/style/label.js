
ol.style.Label = function(opt_options) {

  var options = opt_options || {};

  // ol.Feature object with attributes from geojson data that represents an text label.
  var feature = options.feature;
  var resolution = options.resolution;

  if (!feature || !resolution) {
    // TODO: Implement a more appropriate handling when this happens
    return null;
  }
  delete options.feature;
  delete options.resolution;

  var labelText = feature.get("name");
  var t = feature.get("t");

  // Don#t show too big labels like a capital cityname on a high zoom levels
  if(window.min_t < 0.125 && t > 12){
    return null;
  }

  // Calculate the label size by the given value label factor
  var labelFactor = 1.1 * parseInt(feature.get("lbl_fac"));
  var fontConfig = labelFactor + "px Consolas";

  // Remove escaped character from JSON format string: \\n to \n
  if (labelText.indexOf("\\") >= 0) {
    labelText = labelText.replace("\\n", "\n");
  }

  var maxLabelLength = this.getMaxLabelLength(labelText);

  options.image = new ol.style.Circle({
    radius: labelFactor * maxLabelLength * 0.26,
    stroke: new ol.style.Stroke({
      color: "red",
      width: 1
    })
  });

  options.text = new ol.style.Text({
    text: labelText,
    scale: 1,
    font: fontConfig,
    fill: new ol.style.Fill({
      color: '#0000FF'
    })
  });

  ol.style.Style.call(this, options);
};
ol.inherits(ol.style.Label, ol.style.Style);


/**
 * Get max label length for the case that label has more than one row, e.g. Frankfurt\nam Main
 * @param {string} labelText - text of the label
 */
ol.style.Label.prototype.getMaxLabelLength = function(labelText) {

  var lines = labelText.split("\n");
  var maxLength = 0;
  var arrayLength = lines.length;
  for (var i = 0; i < arrayLength; i++) {
     if (maxLength < lines[i].length) {
      maxLength = lines[i].length;
    }
  }
  return maxLength;
};
