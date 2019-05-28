ol.layer.Label=function(e){var l=e||{};l.style||(l.style=ol.style.labelStyle),void 0===l.updateWhileAnimating&&(l.updateWhileAnimating=!0),void 0===l.updateWhileInteracting&&(l.updateWhileInteracting=!0),ol.layer.Vector.call(this,l)},ol.inherits(ol.layer.Label,ol.layer.Vector);
ol.layer.Label = function(opt_options) {

  var options = opt_options || {};

  if(!options.style) {
    options.style = ol.style.labelStyle
  }

  // If no preffered options for update while animating or interacting are given, set them as default to true
  if (options.updateWhileAnimating === undefined) {
    options.updateWhileAnimating = true;
  }
  if (options.updateWhileInteracting === undefined) {
    options.updateWhileInteracting = true;
  }


  ol.layer.Vector.call(this, options);
};
ol.inherits(ol.layer.Label, ol.layer.Vector);

function resolutionToMinT(e){var t=Math.log2(156543.03390625)-Math.log2(e);return t<=3?1e4:Math.pow(2,9-(t-1))}ol.source.Label=function(e){this.labelServerUrl=e.url,e.format=new ol.format.GeoJSON,e.strategy=ol.loadingstrategy.bbox,e.url=this.featureLoader.bind(this),e.updateWhileAnimating=!0,e.updateWhileInteracting=!0,ol.source.Vector.call(this,e)},ol.source.Label.prototype=Object.create(ol.source.Vector.prototype),ol.source.Label.prototype.addFeatureInternal=function(e){var t=e.get("osm");if(this.addToIndex_(t,e)){this.setupChangeEvents_(t,e);var o=e.getGeometry();if(o){var r=o.getExtent();this.featuresRtree_&&this.featuresRtree_.insert(r,e)}else this.nullGeometryFeatures_[t]=e;this.dispatchEvent(new ol.source.Vector.Event(ol.source.VectorEventType.ADDFEATURE,e))}},ol.source.Label.prototype.loadFeatures=function(e,t,o){var r,n,a=this.loadedExtentsRtree_,l=this.strategy_(e,t);for(r=0,n=l.length;r<n;++r){var i=l[r];a.forEachInExtent(i,function(e){return ol.extent.containsExtent(e.extent,i)&&t==e.resolution})||(this.loader_.call(this,i,t,o),a.insert(i,{extent:i.slice(),resolution:t}))}},ol.source.Label.prototype.constructor=ol.source.Label,ol.source.Label.prototype.featureLoader=function(e,t,o){var r=ol.proj.toLonLat(e.slice(0,2)),n=ol.proj.toLonLat(e.slice(2,4)),a=resolutionToMinT(t),l={x_min:r[0],x_max:n[0],y_min:r[1],y_max:n[1],t_min:a};return this.buildQuery(l)},ol.source.Label.prototype.buildQuery=function(e){void 0!==e&&"object"==typeof e||(e={});var t="?",o=0;for(var r in e){o++;var n=r,a=e[r];t+=1==o?n+"="+a:"&"+n+"="+a}return this.labelServerUrl+t};
ol.source.Label = function(org_options) {

  this.labelServerUrl = org_options.url;

  // TODO: Allow user to set own options here?!
  // overwrite needed options:
  org_options.format = new ol.format.GeoJSON();
  org_options.strategy = ol.loadingstrategy.bbox
  org_options.url = this.featureLoader.bind(this);
  org_options.updateWhileAnimating = true;
  org_options.updateWhileInteracting = true;

  ol.source.Vector.call(this, org_options);
};

ol.source.Label.prototype = Object.create(ol.source.Vector.prototype);

ol.source.Label.prototype.addFeatureInternal = function(feature) {
  var featureKey = feature.get('osm');

  if (!this.addToIndex_(featureKey, feature)) {
    return;
  }

  this.setupChangeEvents_(featureKey, feature);

  var geometry = feature.getGeometry();
  if (geometry) {
    var extent = geometry.getExtent();
    if (this.featuresRtree_) {
      this.featuresRtree_.insert(extent, feature);
    }
  } else {
    this.nullGeometryFeatures_[featureKey] = feature;
  }

  this.dispatchEvent(
      new ol.source.Vector.Event(ol.source.VectorEventType.ADDFEATURE, feature));
};


ol.source.Label.prototype.loadFeatures = function(extent, resolution, projection) {

  var loadedExtentsRtree = this.loadedExtentsRtree_;
  var extentsToLoad = this.strategy_(extent, resolution);
  var i, ii;
  for (i = 0, ii = extentsToLoad.length; i < ii; ++i) {
    var extentToLoad = extentsToLoad[i];
    var alreadyLoaded = loadedExtentsRtree.forEachInExtent(extentToLoad,
        /**
         * @param {{extent: ol.Extent}} object Object.
         * @return {boolean} Contains.
         */
        function(object) {
          // console.log(object,extentToLoad);
          return ol.extent.containsExtent(object.extent, extentToLoad) && resolution == object.resolution;
        });
    if (!alreadyLoaded) {
      this.loader_.call(this, extentToLoad, resolution, projection);
      loadedExtentsRtree.insert(extentToLoad, {extent: extentToLoad.slice(), resolution: resolution});
    }
  }
}

ol.source.Label.prototype.constructor = ol.source.Label;



/**
 * Feature loader function
 * @param {Array} extent - Array that representisthe area to be loaded with: [minx, miny, maxx, maxy]
 * @param {number} resolution - the number representing the resolution (map units per pixel)
 * @param {ol.proj.Projection} projection - the projection that is used for this feature
 */
ol.source.Label.prototype.featureLoader = function(extent, resolution, projection){
  // extent: [minx, miny, maxx, maxy]
  //ol.proj.toLonLat takes coord-pair, so need to split
  var min = ol.proj.toLonLat(extent.slice(0, 2));
  var max = ol.proj.toLonLat(extent.slice(2, 4));

  // Calculate mint_t value for label request
  var min_t = resolutionToMinT(resolution);

  var parameters = {
      x_min: min[0],
      x_max: max[0],
      y_min: min[1],
      y_max: max[1],
      t_min: min_t
  };

  return this.buildQuery(parameters);
}

/**
 * Calculate the min_t value from the resolution.
 * @param {number} resolution - current resolution
 */
function resolutionToMinT(resolution) {
  var zoom = Math.log2(156543.03390625) - Math.log2(resolution);
  if (zoom <= 3) {
    return 10000;
  } else {
    return Math.pow(2, 9 - (zoom - 1));
  }
}


/**
 * Builds a query in the format of:
 *    http://<label-server>/label/<label-type>?x_min=8&x_max=9&y_min=53&y_max=53.06&t_min=0.001
 */
ol.source.Label.prototype.buildQuery = function(params) {
  if (typeof params === 'undefined' || typeof params !== 'object') {
        params = {};
    }
    var query = '?';
    var index = 0;
    for (var i in params) {
        index++;
        var param = i;
        var value = params[i];
        if (index == 1) {
            query += param + '=' + value;
        } else {
            query += '&' + param + '=' + value;
        }
    }
    return this.labelServerUrl + query;
}

let ICON_CACHE={},TEXT_CACHE={};const ICON_TYPE="icon",TEXT_TYPE="text",ICON_MAPPING={aboriginal:"buddhist.svg",administration:"town_hall.svg",airport:"aerodrome.12.svg",artgallery:"artwork.svg",assortment:"buddhist.svg",atm:"atm.svg",bank:"bank.svg",bar:"bar.svg",bbq:"picnic.svg",beergarden:"biergarten.svg",bicycle_shop:"shop/bicycle.svg",boat:"buddhist.svg",breastfeeding:"buddhist.svg",bus:"bus_stop.12.svg",cafeteria:"shop/coffee.svg",car:"shop/car.svg",car_share:"rental_car.svg",casino:"buddhist.svg",catholicgrave:"grave_yard_christian.svg",church:"christian.svg",cinema:"cinema.svg",clock:"buddhist.svg",coffee:"shop/coffee.svg",communitycentre:"community_centre.svg",congress:"town_hall.svg",court:"courthouse.svg",dance_class:"buddhist.svg",dancinghall:"buddhist.svg",daycare:"buddhist.svg",dentist:"dentist.svg",drinkingfountain:"fountain.svg","e-bike-charging":"charging_station.svg",fast_food:"fast_food.svg",ferry:"ferry.svg",fillingstation:"fuel.svg",firemen:"firestation.svg",firstaid:"buddhist.svg",fountain:"fountain.svg",hospital:"hospital.svg",ice_cream:"shop/ice_cream.svg",library:"library.svg",market:"shop/supermarket.svg",medicalstore:"pharmacy.svg",medicine:"pharmacy.svg",music_classical:"shop/musical_instrument.svg",nursing_home_icon:"buddhist.svg",parking:"parking.svg",parking_bicycle:"bicycle_parking.svg",perfumery:"shop/perfumery.svg",police:"police.svg",postal:"post_office.svg",restaurant:"restaurant.svg",sauna:"buddhist.svg",school:"buddhist.svg",spa:"buddhist.svg",stripclub:"buddhist.svg",taxi:"taxi.svg",telephone:"telephone.svg",theatre:"theatre.svg",toilets:"toilets.svg",tools:"buddhist.svg",trash:"waste_basket.10.svg",undefined:"buddhist.svg",university:"buddhist.svg",veterinary:"veterinary.svg",waiting:"bench.svg",wifi:"buddhist.svg",workoffice:"buddhist.svg"},ICON_URL="https://rawgit.com/gravitystorm/openstreetmap-carto/master/symbols/";function calculateLabelFactor(t){var e=t.get("lbl_fac");return 1.1*parseInt(e)}ol.Label=function(t,e){this.text=t.get("name"),this.feature=t,this.t=t.get("t"),this.factor=t.get("lbl_fac"),this.resolveType(),this.min_t=resolutionToMinT(e)},ol.Label.prototype.resolveType=function(){if(this.text.includes("icon:")){this.type="icon";var t=this.text.replace("icon:","");this.iconUrl=this.getIconURL(t)}else this.type="text"},ol.Label.prototype.render=function(){var t=null;if(this.min_t>this.t)return null;if("icon"==this.type){const e=this.text;void 0===ICON_CACHE[e]?(t=new ol.style.Style({image:new ol.style.Icon({crossOrigin:"anonymous",src:this.iconUrl})}),ICON_CACHE[e]=t):t=ICON_CACHE[e]}else if("text"==this.type){var e=window.debugDrawCirc?this.text+":debug":this.text;if(void 0===TEXT_CACHE[e]){var s=calculateLabelFactor(this.feature),i=s+"px Consolas";this.text.indexOf("\\")>=0&&(this.text=this.text.replace("\\n","\n"));var r=s*this.getMaxLabelLength(this.text)*.26,a=new ol.style.Circle({radius:r,stroke:new ol.style.Stroke({color:"red"})}),o=new ol.style.Text({text:this.text,font:i,stroke:new ol.style.Stroke({color:"#333",width:4}),fill:new ol.style.Fill({color:"#fff"})});t=new ol.style.Style({image:1==window.debugDrawCirc?a:null,text:o}),TEXT_CACHE[e]=t}else t=TEXT_CACHE[e]}return t},ol.Label.prototype.getIconURL=function(t){let e=ICON_MAPPING[void 0];return void 0!==ICON_MAPPING[t]&&(e=ICON_MAPPING[t]),ICON_URL+e},ol.Label.prototype.getMaxLabelLength=function(t){for(var e=t.split("\n"),s=0,i=e.length,r=0;r<i;r++)s<e[r].length&&(s=e[r].length);return s};

/*
 * Constructor of ol.style.Label
 * @param {ol.Feature} feature - ol.Feature object with attributes from geojson data that represents an text label.
 */

 let ICON_CACHE = {};
 let TEXT_CACHE = {};

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
  this.feature = feature;
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

  // //basic settings of display
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

  if(this.type == ICON_TYPE){
    // console.log(this.feature);
    // console.log(this.text);

    const cache_key = this.text;

    if(typeof ICON_CACHE[cache_key] === 'undefined'){
      style =new ol.style.Style({
          image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
            crossOrigin: 'anonymous',
            // size: [95, 95],
            src: this.iconUrl
          }))
        });

      ICON_CACHE[cache_key] = style;
    }else{
      style = ICON_CACHE[cache_key];
    }

  }else if(this.type == TEXT_TYPE){

    var cache_key = window.debugDrawCirc ? this.text + ':debug' : this.text;


     if(typeof TEXT_CACHE[cache_key] === 'undefined'){
       var calculatedlabelFactor = calculateLabelFactor(this.feature);
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

       TEXT_CACHE[cache_key] = style;
     }else{
       style = TEXT_CACHE[cache_key];
     }


  }

  return style;
  // return null;

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

ol.style.labelStyle=function(e,l){return new ol.Label(e,l).render()};
ol.style.labelStyle = function(feature,resolution) {
  // create new label
  var label = new ol.Label(feature, resolution);
  return label.render();
}

ol.control.defaults=function(o){var t=o||{},n=new ol.Collection;return(void 0===t.zoom||t.zoom)&&n.push(new ol.control.Zoom(t.zoomOptions)),(void 0===t.rotate||t.rotate)&&n.push(new ol.control.Rotate(t.rotateOptions)),(void 0===t.attribution||t.attribution)&&n.push(new ol.control.Attribution(t.attributionOptions)),n};
/**
 * Set of controls included in maps by default. Unless configured otherwise,
 * this returns a collection containing an instance of each of the following
 * controls:
 * * {@link ol.control.Zoom}
 * * {@link ol.control.Rotate}
 * * {@link ol.control.Attribution}
 *
 * @param {olx.control.DefaultsOptions=} opt_options Defaults options.
 * @return {ol.Collection.<ol.control.Control>} Controls.
 * @api
 */
ol.control.defaults = function(opt_options) {

  var options = opt_options ? opt_options : {};

  var controls = new ol.Collection();

  var zoomControl = options.zoom !== undefined ? options.zoom : true;
  if (zoomControl) {
    controls.push(new ol.control.Zoom(options.zoomOptions));
  }

  var rotateControl = options.rotate !== undefined ? options.rotate : true;
  if (rotateControl) {
    controls.push(new ol.control.Rotate(options.rotateOptions));
  }

  var attributionControl = options.attribution !== undefined ?
    options.attribution : true;
  if (attributionControl) {
    controls.push(new ol.control.Attribution(options.attributionOptions));
  }

  return controls;
};

ol.control.LabelDebug=function(e){var t=e||{};void 0!==t.className&&t.className;this.state={open:!1,isDemoModeRunning:!1},this.btn=document.createElement("button"),this.btn.className="menu-toggle-button",this.buttonIcon={openMenu:">_",closeMenu:"X"},this.btn.innerHTML=this.buttonIcon.openMenu,ol.events.listen(this.btn,ol.events.EventType.CLICK,this.toggleMenu,this),this.container=document.createElement("div"),this.container.className="ol-label-debug ol-control ol-collapsed",this.menu=document.createElement("div"),this.menu.className="",this.container.appendChild(this.btn),this.container.appendChild(this.menu),ol.control.Control.call(this,{element:this.container,target:t.target})},ol.inherits(ol.control.LabelDebug,ol.control.Control),ol.control.LabelDebug.prototype.toggleMenu=function(){!0===this.state.open?this.closeMenu():this.openMenu(),this.state.open=!this.state.open},ol.control.LabelDebug.prototype.openMenu=function(){this.btn.innerHTML=this.buttonIcon.closeMenu,this.menu.style.display="",0==this.menu.innerHTML.length&&this.renderMenuContents()},ol.control.LabelDebug.prototype.closeMenu=function(){this.btn.innerHTML=this.buttonIcon.openMenu,this.menu.style.display="none"},ol.control.LabelDebug.prototype.renderMenuContents=function(){var e=this.getMap(),t={width:"300px"},n=document.createElement("div");Object.assign(n.style,{margin:"10px"});var o=n.cloneNode(),a=document.createElement("input");a.setAttribute("type","checkbox"),a.id="drawCirclesCheckbox";var l=document.createElement("label");l.htmlFor="drawCirclesCheckbox",l.appendChild(a),l.appendChild(document.createTextNode("Draw circles around the labels.")),o.appendChild(l),ol.events.listen(a,ol.events.EventType.CHANGE,ol.control.LabelDebug.prototype.toggleDrawCircles_.bind(this)),window.debugDrawCirc=!1;var i=n.cloneNode(),r=document.createElement("input");Object.assign(r.style,t),r.setAttribute("type","range"),r.setAttribute("id","labelfactorRange"),r.setAttribute("min","0.0"),r.setAttribute("max","3.0"),r.setAttribute("step","0.1"),r.defaultValue="1.1";var d=document.createElement("label");d.id="sliderLabel",d.htmlFor="labelfactorRange",d.appendChild(document.createTextNode("Set the coefficient of the labelFactor. (1.1)")),i.appendChild(d),i.appendChild(document.createElement("br")),i.appendChild(r),ol.events.listen(r,"input",ol.control.LabelDebug.prototype.changeLabelFactor_.bind(this)),window.labelFacCoeff=1.1;var c=n.cloneNode(),u=document.createElement("input");Object.assign(u.style,t),u.setAttribute("type","range"),u.setAttribute("id","minTFactorRange"),u.setAttribute("min","0.0"),u.setAttribute("max","20"),u.setAttribute("step","0.1"),u.defaultValue="9";var s=document.createElement("label");s.id="minTLabel",s.htmlFor="minTFactorRange",s.appendChild(document.createTextNode("Set the offset for the calculation of the min_t. (9)")),ol.events.listen(u,"input",ol.control.LabelDebug.prototype.changeMinTFactor_.bind(this)),c.appendChild(s),c.appendChild(document.createElement("br")),c.appendChild(u),window.minTFac=9;var m=n.cloneNode(),p=document.createElement("input");Object.assign(p.style,t),p.setAttribute("type","range"),p.setAttribute("id","minTCoeffRange"),p.setAttribute("min","0.0"),p.setAttribute("max","5"),p.setAttribute("step","0.1"),p.defaultValue="1.0";var b=document.createElement("label");b.id="minTCoeffLabel",b.htmlFor="minTCoeffRange",b.appendChild(document.createTextNode("Set the coefficient for the calculation of the min_t. (1.0)")),ol.events.listen(p,"input",ol.control.LabelDebug.prototype.changeMinTCoeff_.bind(this)),m.appendChild(b),m.appendChild(document.createElement("br")),m.appendChild(p),window.minTCoeff=1;var h=n.cloneNode(),g=document.createElement("input");Object.assign(g.style,{"margin-left":"10px",width:"50px"}),g.setAttribute("type","number"),g.setAttribute("id","zoomLevelDelta"),g.setAttribute("min","0.0"),g.setAttribute("max","10.0"),g.setAttribute("step","0.1"),g.setAttribute("value","1.0");var f=document.createElement("input");Object.assign(f.style,{width:"600px","margin-top":"10px"}),f.setAttribute("type","range"),f.setAttribute("id","zoomSliderInput"),f.setAttribute("min",0),f.setAttribute("max",28),f.setAttribute("step",g.value),f.defaultValue=e.getView().getZoom();var L=document.createElement("label");L.id="zoomSliderLabel",L.htmlFor="zoomSliderInput",L.appendChild(document.createTextNode("Use the slider to change the zoom level with the defined zoom delta:"));var v=document.createElement("label");Object.assign(v.style,{"margin-left":"10px",position:"relative",top:"-6px"}),v.id="zoomLevelLabel",v.htmlFor="zoomLevelLabel",v.appendChild(document.createTextNode("zoom: "+e.getView().getZoom())),ol.events.listen(g,"input",function(){f.setAttribute("step",g.value)}),ol.events.listen(f,"input",function(){document.getElementById("zoomLevelLabel").innerHTML="zoom: "+f.value,e.getView().setZoom(f.value)}),e.on("moveend",function(t){var n=e.getView().getZoom();n=Math.round(1e3*n)/1e3,document.getElementById("zoomLevelLabel").innerHTML="zoom: "+n,document.getElementById("zoomSliderInput").value=n}),h.appendChild(L),h.appendChild(g),h.appendChild(document.createElement("br")),h.appendChild(f),h.appendChild(v);var C=n.cloneNode(),M=document.createElement("button");M.className="demo-mode-button",M.id="demoModeControlBtn",M.innerHTML="&#9658";var y=document.createElement("label");y.id="demoModeControlLabel",y.htmlFor="demoModeControlBtn",y.innerHTML="Demo mode: ",ol.events.listen(M,ol.events.EventType.CLICK,function(){T.state.isDemoModeRunning?(M.innerHTML="&#9658;",T.stopDemoMode_()):(M.innerHTML="&#10074;&#10074;",T.startDemoMode_());T.state.isDemoModeRunning=!T.state.isDemoModeRunning});var T=this;C.appendChild(y),C.appendChild(M);var w=document.createElement("div");w.appendChild(o),w.appendChild(i),w.appendChild(c),w.appendChild(m),w.appendChild(h),w.appendChild(C),this.menu.appendChild(w),resolutionToMinT=this.resolutionToMinT,calculateLabelFactor=this.calculateLabelFactor},ol.control.LabelDebug.prototype.toggleDrawCircles_=function(e){e.preventDefault(),window.debugDrawCirc=document.getElementById("drawCirclesCheckbox").checked,this.updateLabelLayer_()},ol.control.LabelDebug.prototype.changeLabelFactor_=function(e){e.preventDefault();var t=document.getElementById("labelfactorRange");document.getElementById("sliderLabel").innerHTML="Set the coefficient of the labelFactor. ("+t.value+")",window.labelFacCoeff=t.value,this.updateLabelLayer_()},ol.control.LabelDebug.prototype.changeMinTFactor_=function(e){e.preventDefault();var t=document.getElementById("minTFactorRange");document.getElementById("minTLabel").innerHTML="Set the offset for the calculation of the min_t. ("+t.value+")",window.minTFac=t.value,this.updateLabelLayer_()},ol.control.LabelDebug.prototype.changeMinTCoeff_=function(e){e.preventDefault();var t=document.getElementById("minTCoeffRange");document.getElementById("minTCoeffLabel").innerHTML="Set the coefficient for the calculation of the min_t. ("+t.value+")",window.minTCoeff=t.value,this.updateLabelLayer_()},ol.control.LabelDebug.prototype.updateLabelLayer_=function(){this.getMap().getLayers().forEach(function(e){e instanceof ol.layer.Label&&e.getSource().refresh()})},ol.control.LabelDebug.prototype.resolutionToMinT=function(e){var t=Math.log2(156543.03390625)-Math.log2(e);return t<=3?1e4:window.minTCoeff*Math.pow(2,window.minTFac-(t-1))},ol.control.LabelDebug.prototype.calculateLabelFactor=function(e){var t=e.get("lbl_fac");return parseInt(t)*window.labelFacCoeff},ol.control.LabelDebug.prototype.startDemoMode_=function(){var e=this,t=this.getMap().getView(),n=(t.getRotation(),t.getCenter()),o=3e3,a=Math.round(6*Math.random())+4;o*=Math.abs(14-a);var l,i,r,d,c=(l=[8,12],i=[48,54],r=Math.random()*(l[1]-l[0]+1)+l[0],d=Math.random()*(i[1]-i[0]+1)+i[0],ol.proj.fromLonLat([r,d])),u=(Math.round(100*new ol.geom.LineString([n,c]).getLength()),Math.random()*(2*Math.PI));t.animate({center:c,duration:2*o,rotation:u},function(){setTimeout(function(){e.state.isDemoModeRunning&&e.startDemoMode_()},1)}),t.animate({zoom:a,duration:o},{zoom:14,duration:o})},ol.control.LabelDebug.prototype.stopDemoMode_=function(){var e=this.getMap().getView();e.setResolution(e.getResolution())};
ol.control.LabelDebug = function(opt_options) {

  var options = opt_options || {};
  var className = options.className !== undefined ? options.className : 'ol-label-debug';

  this.state = {
    open: false,
    isDemoModeRunning: false
  };

  this.btn = document.createElement('button');
  this.btn.className = 'menu-toggle-button';
  this.buttonIcon = {
    openMenu: '>_',
    closeMenu: 'X'
  }
  this.btn.innerHTML = this.buttonIcon.openMenu;
  ol.events.listen(this.btn, ol.events.EventType.CLICK, this.toggleMenu, this);

  this.container = document.createElement('div');
  this.container.className = 'ol-label-debug ol-control ol-collapsed';

  this.menu = document.createElement('div');
  this.menu.className = '';

  this.container.appendChild(this.btn);
  this.container.appendChild(this.menu);

  ol.control.Control.call(this, {
    element: this.container,
    target: options.target
  });
};
// Inherit from ol.control.Control class
ol.inherits(ol.control.LabelDebug, ol.control.Control);

ol.control.LabelDebug.prototype.toggleMenu = function() {
  if(this.state.open === true) {
    this.closeMenu();
  } else {
    this.openMenu();
  }
  this.state.open = !this.state.open;
}

ol.control.LabelDebug.prototype.openMenu = function() {
  this.btn.innerHTML = this.buttonIcon.closeMenu;
  this.menu.style.display = '';

  if(this.menu.innerHTML.length == 0){
    this.renderMenuContents();
  };
}

ol.control.LabelDebug.prototype.closeMenu = function(){
  this.btn.innerHTML = this.buttonIcon.openMenu;
  this.menu.style.display = "none";
}

ol.control.LabelDebug.prototype.renderMenuContents = function() {
  var map = this.getMap();

  var rangeCSS = {
    'width': '300px',
  }

  var rowContainerTemplate = document.createElement('div');
  Object.assign(rowContainerTemplate.style, {
    'margin': '10px',
  });

  // Checkbox for enabling the drawing of the circles
  var drawCirclesCheckboxContainer = rowContainerTemplate.cloneNode();

  var drawCirclesCheckbox = document.createElement('input');
  drawCirclesCheckbox.setAttribute('type', 'checkbox');
  drawCirclesCheckbox.id = 'drawCirclesCheckbox';

  var drawCircleLabel = document.createElement('label');
  drawCircleLabel.htmlFor = 'drawCirclesCheckbox';
  drawCircleLabel.appendChild(drawCirclesCheckbox);
  drawCircleLabel.appendChild(document.createTextNode('Draw circles around the labels.'))

  drawCirclesCheckboxContainer.appendChild(drawCircleLabel);

  ol.events.listen(drawCirclesCheckbox, ol.events.EventType.CHANGE,
    ol.control.LabelDebug.prototype.toggleDrawCircles_.bind(this));

  window.debugDrawCirc = false;

  // Slider for coefficient of labelfactor
  var labelfactorSliderContainer = rowContainerTemplate.cloneNode();

  var labelfactorRange = document.createElement('input');
  Object.assign(labelfactorRange.style, rangeCSS);
  labelfactorRange.setAttribute('type', 'range');
  labelfactorRange.setAttribute('id', 'labelfactorRange');
  labelfactorRange.setAttribute('min', '0.0');
  labelfactorRange.setAttribute('max', '3.0');
  labelfactorRange.setAttribute('step', '0.1');
  labelfactorRange.defaultValue = '1.1';

  var labelfactorLabel = document.createElement('label');
  labelfactorLabel.id = 'sliderLabel';
  labelfactorLabel.htmlFor = 'labelfactorRange';
  labelfactorLabel.appendChild(document.createTextNode('Set the coefficient of the labelFactor. (1.1)'))

  labelfactorSliderContainer.appendChild(labelfactorLabel);
  labelfactorSliderContainer.appendChild(document.createElement('br'));
  labelfactorSliderContainer.appendChild(labelfactorRange);

  ol.events.listen(labelfactorRange, "input",
    ol.control.LabelDebug.prototype.changeLabelFactor_.bind(this));

  window.labelFacCoeff = 1.1;

  // Slider for controlling the calculation of the min_t value
  var minTFactorSliderContainer = rowContainerTemplate.cloneNode();

  var minTFactorRange = document.createElement('input');
  Object.assign(minTFactorRange.style, rangeCSS);
  minTFactorRange.setAttribute('type', 'range');
  minTFactorRange.setAttribute('id', 'minTFactorRange');
  minTFactorRange.setAttribute('min', '0.0');
  minTFactorRange.setAttribute('max', '20');
  minTFactorRange.setAttribute('step', '0.1');
  minTFactorRange.defaultValue = '9';

  var minTLabel = document.createElement('label');
  minTLabel.id = 'minTLabel';
  minTLabel.htmlFor = 'minTFactorRange';
  minTLabel.appendChild(document.createTextNode('Set the offset for the calculation of the min_t. (9)'))

  ol.events.listen(minTFactorRange, "input",
    ol.control.LabelDebug.prototype.changeMinTFactor_.bind(this));

  minTFactorSliderContainer.appendChild(minTLabel);
  minTFactorSliderContainer.appendChild(document.createElement('br'));
  minTFactorSliderContainer.appendChild(minTFactorRange);

  window.minTFac = 9;

  var minTCoeffRangeContainer = rowContainerTemplate.cloneNode();
  var minTCoeffRange = document.createElement('input');
  Object.assign(minTCoeffRange.style, rangeCSS);
  minTCoeffRange.setAttribute('type', 'range');
  minTCoeffRange.setAttribute('id', 'minTCoeffRange');
  minTCoeffRange.setAttribute('min', '0.0');
  minTCoeffRange.setAttribute('max', '5');
  minTCoeffRange.setAttribute('step', '0.1');
  minTCoeffRange.defaultValue = '1.0';

  var minTCoeffLabel = document.createElement('label');
  minTCoeffLabel.id = 'minTCoeffLabel';
  minTCoeffLabel.htmlFor = 'minTCoeffRange';
  minTCoeffLabel.appendChild(document.createTextNode('Set the coefficient for the calculation of the min_t. (1.0)'))

  ol.events.listen(minTCoeffRange, "input",
    ol.control.LabelDebug.prototype.changeMinTCoeff_.bind(this));

  minTCoeffRangeContainer.appendChild(minTCoeffLabel);
  minTCoeffRangeContainer.appendChild(document.createElement('br'));
  minTCoeffRangeContainer.appendChild(minTCoeffRange);

  window.minTCoeff = 1.0;

  /* Create slider control for zoom level */
  var zoomSliderContainer = rowContainerTemplate.cloneNode();
  var zoomLevelDelta = document.createElement('input');
  Object.assign(zoomLevelDelta.style, {
    'margin-left': '10px',
    'width': '50px'
  });
  zoomLevelDelta.setAttribute('type', 'number');
  zoomLevelDelta.setAttribute('id', 'zoomLevelDelta');
  zoomLevelDelta.setAttribute('min', '0.0');
  zoomLevelDelta.setAttribute('max', '10.0');
  zoomLevelDelta.setAttribute('step', '0.1');
  zoomLevelDelta.setAttribute('value', '1.0');

  var zoomSliderInput = document.createElement('input');
  Object.assign(zoomSliderInput.style, {
    'width': '600px',
    'margin-top': '10px'
  });
  zoomSliderInput.setAttribute('type', 'range');
  zoomSliderInput.setAttribute('id', 'zoomSliderInput');
  zoomSliderInput.setAttribute('min', 0.0);
  zoomSliderInput.setAttribute('max', 28.0);
  zoomSliderInput.setAttribute('step', zoomLevelDelta.value);
  zoomSliderInput.defaultValue = map.getView().getZoom();

  var zoomSliderLabel = document.createElement('label');
  zoomSliderLabel.id = 'zoomSliderLabel';
  zoomSliderLabel.htmlFor = 'zoomSliderInput';
  zoomSliderLabel.appendChild(document.createTextNode('Use the slider to change the zoom level with the defined zoom delta:'))

  var zoomLevelLabel = document.createElement('label');
  Object.assign(zoomLevelLabel.style, {
    'margin-left': '10px',
    'position': 'relative',
    'top': '-6px'
  });
  zoomLevelLabel.id = 'zoomLevelLabel';
  zoomLevelLabel.htmlFor = 'zoomLevelLabel';
  zoomLevelLabel.appendChild(document.createTextNode("zoom: " + map.getView().getZoom()));

  // Add onchange listener for zoomLevelDelta
  ol.events.listen(zoomLevelDelta, "input", zoomDeltaChange);
  function zoomDeltaChange() {
    zoomSliderInput.setAttribute('step', zoomLevelDelta.value);
  }

  // Add on input listener for zoomSliderInput
  ol.events.listen(zoomSliderInput, "input", changeZoomLevel);
  function changeZoomLevel() {
    document.getElementById('zoomLevelLabel').innerHTML = "zoom: " + zoomSliderInput.value;
    map.getView().setZoom(zoomSliderInput.value);
  }

  // Add listener on view to detect changes on zoom level
  map.on("moveend", function(e) {
    // Get zoom level and round to 3 decimal places
    var newZoomLevel = map.getView().getZoom();
    newZoomLevel = Math.round(newZoomLevel * 1000) / 1000;
    document.getElementById('zoomLevelLabel').innerHTML = "zoom: " + newZoomLevel;
    document.getElementById('zoomSliderInput').value = newZoomLevel;
  });

  // Add zoom slider
  zoomSliderContainer.appendChild(zoomSliderLabel);
  zoomSliderContainer.appendChild(zoomLevelDelta);
  zoomSliderContainer.appendChild(document.createElement('br'));
  zoomSliderContainer.appendChild(zoomSliderInput);
  zoomSliderContainer.appendChild(zoomLevelLabel);

  var demoModeControlContainer = rowContainerTemplate.cloneNode();
  var demoModeControlBtn = document.createElement('button');
  demoModeControlBtn.className = 'demo-mode-button';
  demoModeControlBtn.id = 'demoModeControlBtn';
  demoModeControlBtn.innerHTML = '&#9658';

  var demoModeControlLabel = document.createElement('label');
  demoModeControlLabel.id = 'demoModeControlLabel';
  demoModeControlLabel.htmlFor = 'demoModeControlBtn';
  demoModeControlLabel.innerHTML = 'Demo mode: ';

  ol.events.listen(demoModeControlBtn, ol.events.EventType.CLICK, toggleDemoMode);
  var this_ = this;
  function toggleDemoMode() {
    if (this_.state.isDemoModeRunning) { // Demo is currently running
      demoModeControlBtn.innerHTML = '&#9658;'; // Play icon
      this_.stopDemoMode_();
    } else { // Demo mode is not running, start it
      demoModeControlBtn.innerHTML = '&#10074;&#10074;'; // Stop icon
      this_.startDemoMode_();
    }
    this_.state.isDemoModeRunning = !this_.state.isDemoModeRunning;
  }
  demoModeControlContainer.appendChild(demoModeControlLabel);
  demoModeControlContainer.appendChild(demoModeControlBtn);

  // Create container div for all debug menu entries
  var menuContent = document.createElement('div');
  menuContent.appendChild(drawCirclesCheckboxContainer);
  menuContent.appendChild(labelfactorSliderContainer);
  menuContent.appendChild(minTFactorSliderContainer);
  menuContent.appendChild(minTCoeffRangeContainer);
  menuContent.appendChild(zoomSliderContainer);
  menuContent.appendChild(demoModeControlContainer);

  this.menu.appendChild(menuContent);

  // Override function resolutionToMinT if debug mode is active
  resolutionToMinT = this.resolutionToMinT;
  // Override function calculateLabelFactor if debug mode is active
  calculateLabelFactor = this.calculateLabelFactor;
}

ol.control.LabelDebug.prototype.toggleDrawCircles_ = function(event) {
  event.preventDefault();
  window.debugDrawCirc = document.getElementById('drawCirclesCheckbox').checked;
  this.updateLabelLayer_();
};

ol.control.LabelDebug.prototype.changeLabelFactor_ = function(event) {
  event.preventDefault();
  var range = document.getElementById('labelfactorRange');
  document.getElementById('sliderLabel').innerHTML = 'Set the coefficient of the labelFactor. (' + range.value + ')';
  window.labelFacCoeff = range.value;
  this.updateLabelLayer_();
};

ol.control.LabelDebug.prototype.changeMinTFactor_ = function(event) {
  event.preventDefault();
  var range = document.getElementById('minTFactorRange');
  document.getElementById('minTLabel').innerHTML = 'Set the offset for the calculation of the min_t. (' + range.value + ')';
  window.minTFac = range.value;
  this.updateLabelLayer_();
};

ol.control.LabelDebug.prototype.changeMinTCoeff_ = function(event) {
  event.preventDefault();
  var range = document.getElementById('minTCoeffRange');
  document.getElementById('minTCoeffLabel').innerHTML = 'Set the coefficient for the calculation of the min_t. (' + range.value + ')';
  window.minTCoeff = range.value;
  this.updateLabelLayer_();
};

ol.control.LabelDebug.prototype.updateLabelLayer_ = function() {
  // Refresh layers after updating the draw circle settings
  this.getMap().getLayers().forEach(function(layer) {
    if (layer instanceof ol.layer.Label) {
      layer.getSource().refresh();
    }
  });
}

ol.control.LabelDebug.prototype.resolutionToMinT = function (resolution) {
  var zoom = Math.log2(156543.03390625) - Math.log2(resolution);
  if (zoom <= 3) {
    return 10000;
  } else {
    /* TODO: Find a better solaution than a global variable.
     * It must be possible to use the label source without the debug mode. */
    var calculatedMinT = window.minTCoeff * Math.pow(2, window.minTFac - (zoom - 1));
    return calculatedMinT;
  }
}

ol.control.LabelDebug.prototype.calculateLabelFactor = function (feature) {
  var labelFactor = feature.get("lbl_fac");
  var calculatedLabelFactor = parseInt(labelFactor) * window.labelFacCoeff;
  return calculatedLabelFactor;
}


ol.control.LabelDebug.prototype.startDemoMode_ = function() {
  var this_ = this;
  var view = this.getMap().getView();
  var currentZoomLevel = 14;

  var currentRotation = view.getRotation();
  var currentCenter = view.getCenter();

  // Calculate the animation duration in dependence of the zoom lebel difference
  var animationDuration = 3000;
  var newZoomLevel = getRandomZoom();
  var zoomLevelDifference = Math.abs(currentZoomLevel - newZoomLevel);
  animationDuration = animationDuration * zoomLevelDifference;

  var newLocation = getRandomLocationInGermany();
  // Distance also could be used for calculation of animation duration
  var distance = (Math.round(new ol.geom.LineString([currentCenter, newLocation]).getLength() * 100) / 100) / 1000;

  var newRotation = getRandomRotation();

  function callback() {
    setTimeout(function() {
      if (this_.state.isDemoModeRunning) {
        this_.startDemoMode_();
      }
    }, 1);
  }

  view.animate({
    center: newLocation,
    duration: (animationDuration * 2),
    rotation: newRotation
  }, callback);

  view.animate({
    zoom: newZoomLevel,
    duration: animationDuration
  },
  {
    zoom: currentZoomLevel,
    duration: animationDuration
  });

  function getRandomRotation() {
    return (Math.random() * (Math.PI * 2));
  }

  // Get random zoom level between 4 - 10
  function getRandomZoom() {
    return Math.round(Math.random() * 6) + 4;
  }

  function getZoomLevelChange() {
    var newZoomLevelDiff = Math.round(Math.random()); // value between 0 - 1
    // Make random decision if new zoom level delta is positive or negative
    if (Math.round(Math.random()) > 0) {
      return newZoomLevelDiff;
    } else {
      return newZoomLevelDiff * -1;
    }
  }

  function getRandomLocationInGermany() {
    var rangeLong = [8.0, 12.0]; // More exactly = [6.0, 15.0]
    var rangeLat = [48.0, 54.0]; // More exactly = [47.5, 54.8]

    var randomLong = (Math.random() * (rangeLong[1] - rangeLong[0] + 1)) + rangeLong[0];
    var randomLat = (Math.random() * (rangeLat[1] - rangeLat[0] + 1)) + rangeLat[0];
    return ol.proj.fromLonLat([randomLong, randomLat]);
  }
}

ol.control.LabelDebug.prototype.stopDemoMode_ = function() {
  var view = this.getMap().getView();
  // Only found workaround solution for stopping a running animation: https://github.com/openlayers/openlayers/issues/3714
  view.setResolution(view.getResolution());
}

ol.control.LayerMenu=function(e){var t=e||{};this.state={open:!1,layers:[]},this.btn=document.createElement("button"),this.btn.innerHTML="&#9776;";ol.events.listen(this.btn,ol.events.EventType.CLICK,this.toggleMenu,this),this.container=document.createElement("div"),this.container.className="ol-layer-menu ol-control ol-collapsed",this.menu=document.createElement("div"),this.menu.className="layer-menu",this.container.appendChild(this.menu),this.container.appendChild(this.btn),ol.control.Control.call(this,{element:this.container,target:t.target})},ol.inherits(ol.control.LayerMenu,ol.control.Control),ol.control.LayerMenu.prototype.toggleMenu=function(){!0===this.state.open?this.closeMenu():this.openMenu(),this.state.open=!this.state.open},ol.control.LayerMenu.prototype.activateLayerLabel=function(e){void 0!=e.target.value&&(selectedOpt=e.target.value,checked=e.target.checked,this.state.layers.getArray().filter(e=>e instanceof ol.layer.Label).forEach(e=>{e.get("title")==selectedOpt?e.setVisible(!0):e.setVisible(!1)}))},ol.control.LayerMenu.prototype.activateLayer=function(e){void 0!=e.target.value&&(selectedOpt=e.target.value,checked=e.target.checked,this.state.layers.getArray().filter(e=>!(e instanceof ol.layer.Label)).forEach(e=>{e.get("title")==selectedOpt?e.setVisible(!0):e.setVisible(!1)}))},ol.control.LayerMenu.prototype.openMenu=function(){this.getMap().getLayers();this.btn.innerHTML="X",this.container.classList.remove("ol-collapsed"),""==this.menu.innerHTML&&this.renderMenuContents()},ol.control.LayerMenu.prototype.closeMenu=function(){this.getMap().getLayers();this.container.classList.add("ol-collapsed"),this.btn.innerHTML="&#9776;"},ol.control.LayerMenu.prototype.renderMenuContents=function(){var e=document.createElement("div");e.innerHTML="<h5>Tiles</h5>";var t=document.createElement("ul");this.state.layers=map.getLayers(),this.state.layers.forEach(function(e,n,a){if(!(e instanceof ol.layer.Label||void 0==e.get("title"))){var l=e.get("title"),i=e.getVisible(),o=document.createElement("li");o.setAttribute("title",e.get("description"));var r=document.createElement("label"),s=document.createElement("input");s.setAttribute("type","radio"),s.setAttribute("name","tiles"),s.setAttribute("value",l),s.checked=i,r.appendChild(s);var c=document.createElement("span");c.innerHTML=l,r.appendChild(c),o.appendChild(r),t.appendChild(o)}}),e.appendChild(t),this.menu.appendChild(e),ol.events.listen(e,ol.events.EventType.CLICK,this.activateLayer,this);var n=document.createElement("div");n.innerHTML="<h5>Labels</h5>";var a=document.createElement("ul");this.state.layers.forEach(function(e,t){if(e instanceof ol.layer.Label&&void 0!=e.get("title")){var n=e.get("title"),l=e.getVisible(),i=document.createElement("li"),o=document.createElement("label"),r=document.createElement("input");r.setAttribute("type","radio"),r.setAttribute("name","labels"),r.setAttribute("value",n),r.checked=l,o.appendChild(r);var s=document.createElement("span");s.innerHTML=n,o.appendChild(s),i.appendChild(o),a.appendChild(i)}}),n.appendChild(a),this.menu.appendChild(n),ol.events.listen(n,ol.events.EventType.CLICK,this.activateLayerLabel,this)};
ol.control.LayerMenu = function(opt_options) {

  var options = opt_options || {};

  this.state = {
    open: false,
    layers: []
  };

  this.btn = document.createElement('button');
  this.btn.innerHTML = '&#9776;';

  var this_ = this;

  ol.events.listen(this.btn, ol.events.EventType.CLICK, this.toggleMenu, this);

  this.container = document.createElement('div');
  this.container.className = 'ol-layer-menu ol-control ol-collapsed';

  this.menu = document.createElement('div');
  this.menu.className = 'layer-menu';

  this.container.appendChild(this.menu);
  this.container.appendChild(this.btn);

  ol.control.Control.call(this, {
    element: this.container,
    target: options.target
  });
}

ol.inherits(ol.control.LayerMenu, ol.control.Control);

ol.control.LayerMenu.prototype.toggleMenu = function(){
  if(this.state.open === true){
    this.closeMenu();
  }else{
    this.openMenu();
  }

  this.state.open = !this.state.open;
}

ol.control.LayerMenu.prototype.activateLayerLabel = function(event){

  if(event.target.value == undefined){
    return
  }

  selectedOpt = event.target.value;
  checked = event.target.checked;

  this.state.layers.getArray()
    .filter(layer => layer instanceof ol.layer.Label)
    .forEach(
      layer => {
        const title = layer.get('title');
        if(title == selectedOpt){
          layer.setVisible(true);
        }else{
          layer.setVisible(false);
        }
      }
    )
}

ol.control.LayerMenu.prototype.activateLayer = function(event){

  if(event.target.value == undefined){
    return
  }

  selectedOpt = event.target.value;
  checked = event.target.checked;

  this.state.layers.getArray()
    .filter(layer => !(layer instanceof ol.layer.Label))
    .forEach(
      layer => {
        const title = layer.get('title');
        if(title == selectedOpt){
          layer.setVisible(true);
        }else{
          layer.setVisible(false);
        }
      }
    )
}

ol.control.LayerMenu.prototype.openMenu = function(){

  var map = this.getMap();
  var layers = map.getLayers();

  this.btn.innerHTML = 'X';

  this.container.classList.remove('ol-collapsed');


  if(this.menu.innerHTML == ''){
    this.renderMenuContents();
  };

}

ol.control.LayerMenu.prototype.closeMenu = function(){

  var map = this.getMap();
  var layers = map.getLayers();

  this.container.classList.add('ol-collapsed');

  this.btn.innerHTML = '&#9776;';

}

ol.control.LayerMenu.prototype.renderMenuContents = function(){

  var tilesContainer = document.createElement('div');
  tilesContainer.innerHTML = '<h5>Tiles</h5>';
  var tileList = document.createElement('ul');

  this.state.layers = map.getLayers();

  this.state.layers.forEach(function(layer, index, array) {

    if(layer instanceof ol.layer.Label || layer.get('title') == undefined){
      return;
    }

    var title = layer.get('title');
    var visible = layer.getVisible();

    var li = document.createElement('li');
    li.setAttribute('title', layer.get('description'));
    var label = document.createElement('label');
    var element = document.createElement('input');
    element.setAttribute('type', 'radio');
    element.setAttribute('name', 'tiles');
    element.setAttribute('value', title);

    element.checked = visible;

    label.appendChild(element);
    var name = document.createElement('span');
    name.innerHTML = title;
    label.appendChild(name);
    li.appendChild(label);
    tileList.appendChild(li);

  })

  tilesContainer.appendChild(tileList);

  this.menu.appendChild(tilesContainer);
  ol.events.listen(tilesContainer, ol.events.EventType.CLICK, this.activateLayer, this);

  var labelContainer = document.createElement('div');
  labelContainer.innerHTML = '<h5>Labels</h5>';
  var labelList = document.createElement('ul');

  // render available Tile endpoints
  this.state.layers.forEach(function(layer,idx){

    if(!(layer instanceof ol.layer.Label) || layer.get('title') == undefined){
      return;
    }

    var title = layer.get('title');
    var visible = layer.getVisible();
    // console.log(title, visible);
    var li = document.createElement('li');
    var label = document.createElement('label');
    var element = document.createElement('input');
    element.setAttribute('type', 'radio');
    element.setAttribute('name', 'labels');
    element.setAttribute('value', title);

    element.checked = visible;

    label.appendChild(element);
    var name = document.createElement('span');
    name.innerHTML = title;
    label.appendChild(name);
    li.appendChild(label);
    labelList.appendChild(li);
  });

  labelContainer.appendChild(labelList);

  this.menu.appendChild(labelContainer);
  ol.events.listen(labelContainer, ol.events.EventType.CLICK, this.activateLayerLabel, this);
}
