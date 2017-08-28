/**
 * Constructor of ol.style.IconLabel
 * @param {ol.Feature} feature - ol.Feature object with attributes from geojson data that represents an text label.
 */
ol.style.IconLabel = function(feature, resolution) {

  // Get needed fields from feature object
  var labelText = feature.get("name");
  if (!labelText.includes('icon:')) {
    return null;
  }
  labelText = labelText.replace('icon:', '');
  window.icon_names.add(labelText);
  var t = feature.get("t");
  var labelFactor = feature.get("lbl_fac");

  var labelTextColor = '#fff';
  var labelBorderColor = '#333';
  var labelFontType = "Consolas";
  var labelCircleColor = "red";


  // Don't show too big labels like a capital cityname on a high zoom levels
  //if(window.min_t > t){

  //}
  var min_t = resToMinT(resolution);

  if (min_t > t) {
    // return null;
    // console.log(labelText,window.min_t,t);
    return null;
  }

  // Calculate the label size by the given value label factor
  var calculatedlabelFactor = 1.1 * parseInt(labelFactor);
  var fontConfig = 4 * labelFactor + "px " + labelFontType;

  // Remove escaped character from JSON format string: \\n to \n
  if (labelText.indexOf("\\") >= 0) {
    labelText = labelText.replace("\\n", "\n");
  }

  var maxLabelLength = getMaxLabelLength(labelText);
  var circleRadius = labelFactor * maxLabelLength * 0.26;

  var iconSrc = iconMapping[labelText];
  if(!iconSrc) {
    console.log(labelText);
    iconSrc = iconMapping['undefined'];
  }

  this.image = new ol.style.Icon({
    // anchor: [0.5, 46],
    // anchorXUnits: 'fraction',
    // anchorYUnits: 'pixels',
    src: iconSrc,
    scale: 1,
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

  if (window.min_t < 1.1 && t > 12) {
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

  if (window.min_t < .3 && t > 12) {
    return null;
  }

  var style = new ol.style.Style({
    image: this.image,
    // text: this.text
  });

  return style;

  // Pass this Label object as options params for ol.style.Style
  // ol.style.Style.call(this, this);
};


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

function resToMinT(res) {

  var zoom = Math.log2(156543.03390625) - Math.log2(res);

  console.log(res, zoom);

  if (zoom <= 3) {
    return 0.01;
  } else {
    return 1000 * Math.pow(2, 9 - (zoom - 1));
  }
};

var iconMapping = {

  // 'undefined': 'http://vignette3.wikia.nocookie.net/utau/images/c/cf/Unknown-icon.png',
  // 'aboriginal': 'https://cdn1.iconfinder.com/data/icons/hawcons/32/698879-icon-14-flag-128.png',
  // 'waiting': 'https://cdn2.iconfinder.com/data/icons/cosmo-furniture/40/bench-512.png',
  // 'aboriginal': 'http://icons.iconarchive.com/icons/yusuke-kamiyamane/fugue/16/plus-small-icon.png',
  'aboriginal': 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/buddhist.svg',
  'administration' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/town_hall.svg',
  'airport' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/aerodrome.12.svg',
  'artgallery' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/artwork.svg',
  'assortment' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/buddhist.svg',
  'atm' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/atm.svg',
  'bank' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/bank.svg',
  'bar' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/bar.svg',
  'bbq' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/picnic.svg',
  'beergarden' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/biergarten.svg',
  'bicycle_shop' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/shop/bicycle.svg',
  'boat' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/buddhist.svg',
  'breastfeeding' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/buddhist.svg',
  'bus' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/bus_stop.12.svg',
  'cafeteria' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/shop/coffee.svg',
  'car' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/shop/car.svg',
  'car_share' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/rental_car.svg',
  'casino' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/buddhist.svg',
  'catholicgrave' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/grave_yard_christian.svg',
  'church' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/christian.svg',
  'cinema' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/cinema.svg',
  'clock' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/buddhist.svg',
  'coffee' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/shop/coffee.svg',
  'communitycentre' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/community_centre.svg',
  'congress' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/town_hall.svg',
  'court' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/courthouse.svg',
  'dance_class' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/buddhist.svg',
  'dancinghall' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/buddhist.svg',
  'daycare' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/buddhist.svg',
  'dentist' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/dentist.svg',
  'drinkingfountain' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/fountain.svg',
  'e-bike-charging' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/charging_station.svg',
  'fast_food' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/fast_food.svg',
  'ferry' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/ferry.svg',
  'fillingstation' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/fuel.svg',
  'firemen' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/firestation.svg',
  'firstaid' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/buddhist.svg',
  'fountain' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/fountain.svg',
  'hospital' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/hospital.svg',
  'ice_cream' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/shop/ice_cream.svg',
  'library' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/library.svg',
  'market' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/shop/supermarket.svg',
  'medicalstore' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/pharmacy.svg',
  'medicine' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/pharmacy.svg',
  'music_classical' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/shop/musical_instrument.svg',
  'nursing_home_icon' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/buddhist.svg',
  'parking' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/parking.svg',
  'parking_bicycle' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/bicycle_parking.svg',
  'perfumery' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/shop/perfumery.svg',
  'police' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/police.svg',
  'postal' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/post_office.svg',
  'restaurant' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/restaurant.svg',
  'sauna' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/buddhist.svg',
  'school' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/buddhist.svg',
  'spa' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/buddhist.svg',
  'stripclub' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/buddhist.svg',
  'taxi' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/taxi.svg',
  'telephone' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/telephone.svg',
  'theatre' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/theatre.svg',
  'toilets' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/toilets.svg',
  'tools' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/buddhist.svg',
  'trash' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/waste_basket.10.svg',
  'undefined': 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/buddhist.svg',
  'university' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/buddhist.svg',
  'veterinary' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/veterinary.svg',
  'waiting': 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/bench.svg',
  'wifi' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/buddhist.svg',
  'workoffice' : 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/buddhist.svg',
}
