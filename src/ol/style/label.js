
ol.style.Label = function(opt_options) {
  return this.styleFunction;
};

/**
* StyleFunction to generate the style for the a label.
* Doc: http://openlayers.org/en/latest/apidoc/ol.html#.StyleFunction
* @param {ol.Feature} feature - ol.Feature object with attributes from geojson data that represents an text label.
* @param {number} resolution - current resolution
*/
ol.style.Label.prototype.styleFunction = function(feature, resolution) {
  var scale = 1; // 0.2 * (Math.log(feature.get("t")) - Math.log(min_t) + 0.5);

  var name = feature.get("name");
  var t = feature.get("t");

  if(window.min_t < 0.125 && t > 12){
    console.log(name);
    return null;
  }

  var label_factor = 1.1 * parseInt(feature.get("lbl_fac"));

  var font_string = label_factor + "px Consolas";

  // Remove escaped character for \\n to \n
  if (name.indexOf("\\") >= 0) {
    name = name.replace("\\n", "\n");
  }

  // Get max label length for case that label has more than one row, e.g. Frankfurt\nam Main
  var the_lines = name.split("\n");
  var max_length = 0;
  var arrayLength = the_lines.length;
  for (var i = 0; i < arrayLength; i++) {
     if (max_length < the_lines[i].length) {
      max_length = the_lines[i].length;
    }
  }

  // TODO: ?
  // ol.style.Style.call(this, options.style);

  // Create label style with text and circle
  var style = new ol.style.Style({
    image: new ol.style.Circle({
      radius: label_factor * max_length * 0.26,
      stroke: new ol.style.Stroke({
        color: "red",
        width: 1
      })
    }),
    text: new ol.style.Text({
      text: name,
      scale: scale,
      font: font_string,
      fill: new ol.style.Fill({
        color: '#0000FF'
      })
    })
  });

  return style;
};
