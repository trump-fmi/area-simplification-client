
/*
 * Constructor of ol.style.Label
 * @param {ol.Feature} feature - ol.Feature object with attributes from geojson data that represents an text label.
 */
ol.style.Label = function(feature, resolution) {

  // Get needed fields from feature object
  var labelText = feature.get("name");
  var t = feature.get("t");

  var labelTextColor = '#fff';
  var labelBorderColor = '#333';
  var labelFontType = "Consolas";
  var labelCircleColor = "red";

  var min_t = resolutionToMinT(resolution);

  if(min_t > t) {
    return null;
  }

  // Calculate the label size by the given value label factor
  var calculatedLabelFactor = calculateLabelFactor(feature);
  var fontConfig = calculatedLabelFactor + "px " + labelFontType;

  // Remove escaped character from JSON format string: \\n to \n
  if (labelText.indexOf("\\") >= 0) {
    labelText = labelText.replace("\\n", "\n");
  }

  var maxLabelLength = getMaxLabelLength(labelText);
  var circleRadius = calculatedLabelFactor * maxLabelLength * 0.26;

  this.image = new ol.style.Circle({
    radius: circleRadius,
    stroke: new ol.style.Stroke({
      color: labelCircleColor
    })
  });

  this.text = new ol.style.Text({
    text: labelText,
    font: fontConfig,
    stroke: new ol.style.Stroke({
      color: labelBorderColor,
      width: 4
    }),
    fill: new ol.style.Fill({
      color: labelTextColor
    })
  });

  if(min_t < 1.1 && t > 12){
    this.text = new ol.style.Text({
      text: labelText,
      font: fontConfig,
      stroke: new ol.style.Stroke({
        color: [255, 255, 255, .6],
        width: 2
      }),
      fill: new ol.style.Fill({
        color: [0, 0, 0, .5]
      })
    });
  }

  if(min_t < 0.3 && t > 12){
    return null;
  }

  // TODO: Remove global variable here
  var style = new ol.style.Style({
    image: window.debugDrawCirc == true ? this.image : null,
    text: this.text
  });

  return style;

  // Pass this Label object as options params for ol.style.Style
  // ol.style.Style.call(this, this);
};

function calculateLabelFactor(feature) {
  var labelFactor = feature.get("lbl_fac");
  var calculatedLabelFactor = parseInt(labelFactor) * 1.1;
  return calculatedLabelFactor;
}

/**
 * Get max label length for the case that label has more than one row, e.g. Frankfurt\nam Main
 * @param {string} labelText - text of the label
 */
function getMaxLabelLength(labelText) {
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
