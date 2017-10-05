/**
 * Constructor of ol.style.Label
 * @param {ol.Feature} feature - ol.Feature object with attributes from geojson data that represents an text label.
 */
ol.style.Label = function(feature,resolution) {

  // Get needed fields from feature object
  var labelText = feature.get("name");
  var t = feature.get("t");
  var labelFactor = feature.get("lbl_fac");

  var labelTextColor = '#fff';
  var labelBorderColor = '#333';
  var labelFontType = "Consolas";
  var labelCircleColor = "red";

  labelText = this.checkForValidText(labelText);
  if(null == labelText) {
    return null;
  }

  // Don't show too big labels like a capital cityname on a high zoom levels
  //if(window.min_t > t){

  //}
  var min_t = this.resToMinT(resolution);

  if(min_t > t){
    // return null;
    // console.log(labelText,window.min_t,t);
    return null;
  }

  // Calculate the label size by the given value label factor
  var calculatedlabelFactor = 1.1 * parseInt(labelFactor);
  var fontConfig = this.calcFontConfig(labelFactor, labelFontType);

  // Remove escaped character from JSON format string: \\n to \n
  if (labelText.indexOf("\\") >= 0) {
    labelText = labelText.replace("\\n", "\n");
  }

  var maxLabelLength = this.getMaxLabelLength(labelText);
  var circleRadius = labelFactor * maxLabelLength * 0.26;

  this.image = this.getImageStyle(labelText, circleRadius, labelCircleColor);

  this.text = this.getTextStyle(labelText, fontConfig, labelBorderColor,
   labelTextColor);

  if(window.min_t < 1.1 && t > 12){
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

  if(window.min_t < .3 && t > 12){
    return null;
  }

  var style = new ol.style.Style({
        image: this.image,
        text: this.text
      });

  return style;

  // Pass this Label object as options params for ol.style.Style
  // ol.style.Style.call(this, this);
};

/**
 * This is only needed for the icon labels.
 * @param {string} labelText - text of the label
 */
ol.style.Label.prototype.checkForValidText = function(labelText) {
  return labelText;
};

/**
 * Calculate the configuration string for the font of the label.
 * @param {string} labelFactor - label specific size factor
 * @param {string} labelFontType - general font type
 */
ol.style.Label.prototype.calcFontConfig = function(labelFactor, 
  labelFontType) {
  return labelFactor + "px " + labelFontType;
};

/**
 * Get the image style that should be displayed.
 * @param {string} labelText - text of the label
 * @param {string} circleRadius - radius of the circle
 * @param {string} labelCircleColor - color of the circle
 */
ol.style.Label.prototype.getImageStyle = function(labelText, circleRadius,
  labelCircleColor) {
  if(window.debug == true) {
    return new ol.style.Circle({
      radius: circleRadius,
      stroke: new ol.style.Stroke({
        color: labelCircleColor
      })
    });
  } else {
    return null;
  }
};

/**
 * Get the text style that should be displayed.
 * @param {string} labelText - text of the label
 * @param {string} fontConfig - configuration string for the font of the label
 * @param {string} labelBorderColor - colour of the border of the label
 * @param {string} labelTextColor - colour of the text
 */
ol.style.Label.prototype.getTextStyle = function(labelText, fontConfig,
  labelBorderColor, labelTextColor) {
  return new ol.style.Text({
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
};

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

ol.style.Label.prototype.resToMinT = function(res){

  var zoom = Math.log2(156543.03390625) - Math.log2(res);

  console.log(res,zoom);

  if (zoom <= 3) {
    return 0.01;
  } else {
    return Math.pow(2, 9 - (zoom - 1));
  }
}
