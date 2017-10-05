/**
 * Constructor of ol.style.TextLabel
 * @param {ol.Feature} feature - ol.Feature object with attributes from geojson data that represents an text label.
 */
ol.style.TextLabel = function(feature, resolution) {
  ol.style.Label.call(this, feature, resolution);
};

ol.style.TextLabel.prototype = Object.create(ol.style.Label.prototype);
ol.style.TextLabel.prototype.constructor = ol.style.TextLabel;
