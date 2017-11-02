
/*
 * Constructor of ol.style.Label
 * @param {ol.Feature} feature - ol.Feature object with attributes from geojson data that represents an text label.
 */

 const ICON_TYPE = 'icon';
 const TEXT_TYPE = 'text';
 const ICON_MAPPING = {
   'aboriginal': 'buddhist.svg',
   'administration' : 'town_hall.svg',
   'airport' : 'aerodrome.12.svg',
   'artgallery' : 'artwork.svg',
   'assortment' : 'buddhist.svg',
   'atm' : 'atm.svg',
   'bank' : 'bank.svg',
   'bar' : 'bar.svg',
   'bbq' : 'picnic.svg',
   'beergarden' : 'biergarten.svg',
   'bicycle_shop' : 'shop/bicycle.svg',
   'boat' : 'buddhist.svg',
   'breastfeeding' : 'buddhist.svg',
   'bus' : 'bus_stop.12.svg',
   'cafeteria' : 'shop/coffee.svg',
   'car' : 'shop/car.svg',
   'car_share' : 'rental_car.svg',
   'casino' : 'buddhist.svg',
   'catholicgrave' : 'grave_yard_christian.svg',
   'church' : 'christian.svg',
   'cinema' : 'cinema.svg',
   'clock' : 'buddhist.svg',
   'coffee' : 'shop/coffee.svg',
   'communitycentre' : 'community_centre.svg',
   'congress' : 'town_hall.svg',
   'court' : 'courthouse.svg',
   'dance_class' : 'buddhist.svg',
   'dancinghall' : 'buddhist.svg',
   'daycare' : 'buddhist.svg',
   'dentist' : 'dentist.svg',
   'drinkingfountain' : 'fountain.svg',
   'e-bike-charging' : 'charging_station.svg',
   'fast_food' : 'fast_food.svg',
   'ferry' : 'ferry.svg',
   'fillingstation' : 'fuel.svg',
   'firemen' : 'firestation.svg',
   'firstaid' : 'buddhist.svg',
   'fountain' : 'fountain.svg',
   'hospital' : 'hospital.svg',
   'ice_cream' : 'shop/ice_cream.svg',
   'library' : 'library.svg',
   'market' : 'shop/supermarket.svg',
   'medicalstore' : 'pharmacy.svg',
   'medicine' : 'pharmacy.svg',
   'music_classical' : 'shop/musical_instrument.svg',
   'nursing_home_icon' : 'buddhist.svg',
   'parking' : 'parking.svg',
   'parking_bicycle' : 'bicycle_parking.svg',
   'perfumery' : 'shop/perfumery.svg',
   'police' : 'police.svg',
   'postal' : 'post_office.svg',
   'restaurant' : 'restaurant.svg',
   'sauna' : 'buddhist.svg',
   'school' : 'buddhist.svg',
   'spa' : 'buddhist.svg',
   'stripclub' : 'buddhist.svg',
   'taxi' : 'taxi.svg',
   'telephone' : 'telephone.svg',
   'theatre' : 'theatre.svg',
   'toilets' : 'toilets.svg',
   'tools' : 'buddhist.svg',
   'trash' : 'waste_basket.10.svg',
   'undefined': 'buddhist.svg',
   'university' : 'buddhist.svg',
   'veterinary' : 'veterinary.svg',
   'waiting': 'bench.svg',
   'wifi' : 'buddhist.svg',
   'workoffice' : 'buddhist.svg',
 };

 const ICON_URL = 'https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/';


ol.Label = function(feature, resolution) {

  // Get needed fields from feature object
  this.text = feature.get("name");
  this.t = feature.get("t");
  this.factor = feature.get("lbl_fac");

  //resolve if icon or text label
  this.resolveType();

  //get global min t
  this.min_t = resolutionToMinT(resolution);

};


ol.Label.prototype.resolveType = function(){

  if (this.text.includes('icon:')) {
    this.type = ICON_TYPE;
    var icon = this.text.replace('icon:', '');
    this.iconUrl = this.getIconURL(icon);
  }else{
    this.type = TEXT_TYPE;
  }

}

ol.Label.prototype.render = function(){

  //basic settings of display
  var labelTextColor = '#fff';
  var labelBorderColor = '#333';
  var labelFontType = "Consolas";
  var labelCircleColor = "red";

  var style = null;

  //do not render if t value of feature is lower then current min_t
  if(this.min_t > this.t){
    // console.log(this.text, min_t, this.t);
    return null;
  }


  var calculatedlabelFactor = window.labelFacCoeff * parseInt(this.factor);
  var fontConfig = calculatedlabelFactor + "px " + labelFontType;

  // Remove escaped character from JSON format string: \\n to \n
  if (this.text.indexOf("\\") >= 0) {
    this.text = this.text.replace("\\n", "\n");
  }

  // Calculate the label size by the given value label factor
  var maxLabelLength = this.getMaxLabelLength(this.text);
  var circleRadius = calculatedlabelFactor * maxLabelLength * 0.26;

  var debugCircle = new ol.style.Circle({
    radius: circleRadius,
    stroke: new ol.style.Stroke({
      color: labelCircleColor
    })
  });

  if(this.type == ICON_TYPE){
    style = new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
          crossOrigin: 'anonymous',
          src: this.iconUrl
        }))
      });

  }else if(this.type == TEXT_TYPE){

    var label = new ol.style.Text({
       text: this.text,
       font: fontConfig,
       stroke: new ol.style.Stroke({
         color: labelBorderColor,
         width: 4
       }),
       fill: new ol.style.Fill({
         color: labelTextColor
       })
     });


    style = new ol.style.Style({
      image: window.debugDrawCirc == true ? debugCircle : null,
      text: label
    });

  }

  return style;

}


ol.Label.prototype.getIconURL = function(iconName){

  let icon = ICON_MAPPING['undefined'];

  if(typeof ICON_MAPPING[iconName] !== 'undefined'){
    icon = ICON_MAPPING[iconName];
  }

  return ICON_URL + icon;
}

function calculateLabelFactor(feature) {
  var labelFactor = feature.get("lbl_fac");
  var calculatedLabelFactor = parseInt(labelFactor) * 1.1;
  return calculatedLabelFactor;
}

/**
 * Get max label length for the case that label has more than one row, e.g. Frankfurt\nam Main
 * @param {string} labelText - text of the label
 */

 ol.Label.prototype.getMaxLabelLength = function (labelText){

   var lines = labelText.split("\n");
   var maxLength = 0;
   var arrayLength = lines.length;

   for (var i = 0; i < arrayLength; i++) {
      if (maxLength < lines[i].length) {
         maxLength = lines[i].length;
     }
   }

   return maxLength;
}
