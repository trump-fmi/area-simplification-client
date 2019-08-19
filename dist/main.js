//Debug enabled?
const DEBUG = window.location.hash.toLowerCase() === "#debug";

//*************** CONFIG ****************
const START_LOCATION = [9.180769, 48.777106];
const START_ZOOM = 12;
const MIN_ZOOM = 0;
const MAX_ZOOM = 19;
const TILE_SERVER_URL = "http://" + (DEBUG ? "seeigel.informatik.uni-stuttgart.de" : window.location.hostname);
const TILE_SERVER_PORT = "80";
const TILE_SERVER_ENDPOINTS_PORT = "80";
const LABEL_SERVER_URL = "http://" + (DEBUG ? "seeigel.informatik.uni-stuttgart.de" : window.location.hostname);
const LABEL_SERVER_PORT = "80";
const AREA_SERVER_URL = "http://" + (DEBUG ? "seeigel.informatik.uni-stuttgart.de" : window.location.hostname);
const AREA_SERVER_PORT = "80";
const ADDRESS_TYPE = "nominatim";
const ADDRESS_DATA_PROVIDER = "osm";
const ADDRESS_DATA_LOCALE = "en";
const ADDRESS_SUGGESTIONS = 5;

const TILES_Z_INDEX = 0;
const AREAS_Z_INDEX_BASE = 10;
const LABEL_Z_INDEX = 10000;
//***************************************

//Container that holds the map
const MAP_CONTAINER = 'map';

//Put together required URLs
const tileEndpointsUrl = TILE_SERVER_URL + ":" + TILE_SERVER_ENDPOINTS_PORT + "/tileEndpoints";
const tileRetrievalUrl = TILE_SERVER_URL + ":" + TILE_SERVER_PORT;
const labelCollectionUrl = LABEL_SERVER_URL + ":" + LABEL_SERVER_PORT + "/labelCollections";
const labelRetrievalUrl = LABEL_SERVER_URL + ":" + LABEL_SERVER_PORT + "/";
const areaTypesUrl = AREA_SERVER_URL + ":" + AREA_SERVER_PORT + "/types";
const areaRetrievalUrl = AREA_SERVER_URL + ":" + AREA_SERVER_PORT + "/get/";

//Create map
var map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    keyboardEventTarget: document,
    layers: [],
    target: MAP_CONTAINER,
    view: new ol.View({
        center: ol.proj.fromLonLat(START_LOCATION),
        zoom: START_ZOOM,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM
    })
});

//Create geocoder
let geocoder = new Geocoder(ADDRESS_TYPE, {
    provider: ADDRESS_DATA_PROVIDER,
    lang: ADDRESS_DATA_LOCALE,
    placeholder: 'Search for...',
    targetType: 'glass-button',
    limit: ADDRESS_SUGGESTIONS,
    autoComplete: true,
    keepOpen: true,
    preventDefault: true
});
//Align button appropriately
geocoder.element.style.top = '275px';

//Register listener for address choose events
geocoder.on('addresschosen', function (event) {

    //Iterate over all layers of the map
    map.getLayers().forEach(function (layer) {
        //Only consider area layers
        if (!(layer instanceof ol.layer.Area)) {
            return;
        }

        //Highlight features of this layer at the target position
        layer.highlightFeaturesAt(event.coordinate);
    });

    //Move view to target location
    map.getView().setCenter(event.coordinate);
});

//Add controls to map
map.addControl(new ol.control.ZoomSlider());
map.addControl(new ol.control.DebugMenu());
map.addControl(new ol.control.LayerMenu());
map.addControl(new ol.control.Rotate());
map.addControl(geocoder);

//Add select interaction to map
//map.addInteraction(new ol.interaction.Select());


//Get all available tile endpoints and create layers for them subsequently
httpGET(tileEndpointsUrl, function (response) {
    var tileEndpoints = JSON.parse(response);
    addTileLayersToMap(tileEndpoints);
});

//Get all available area types and create layers for them subsequently
httpGET(areaTypesUrl, function (response) {
    var areaTypes = JSON.parse(response);
    addAreaLayersToMap(areaTypes);
});

//Get all available label collections and create layers for them subsequently
httpGET(labelCollectionUrl, function (response) {
    var labelEndpointsJSON = JSON.parse(response);
    addLabelLayersToMap(labelEndpointsJSON);
});


function addTileLayersToMap(tileEndpoints) {
    // Add tile layers to map
    for (var i = 0; i < tileEndpoints.length; i++) {
        var tileEndpoint = tileEndpoints[i];
        var tileEndpointUrl = tileRetrievalUrl + tileEndpoint.uri + "{z}/{x}/{y}.png";
        var isLayerVisible = (tileEndpoint.name === "default");

        //Create new tile layer
        var tileLayer = new ol.layer.Tile({
            source: new ol.source.OSM({
                url: tileEndpointUrl,
                crossOrigin: null
            }),
            title: tileEndpoint.name,
            description: tileEndpoint.description,
            preload: 5,
            visible: isLayerVisible,
            zIndex: TILES_Z_INDEX
        });

        //Add layer to map
        map.addLayer(tileLayer);
    }
}


function addAreaLayersToMap(areaTypes) {
    //Sanity check
    if (!Array.isArray(areaTypes)) {
        return;
    }

    //iterate over all area types
    for (var i = 0; i < areaTypes.length; i++) {
        var areaType = areaTypes[i];

        //Create new area layer
        var areaLayer = new ol.layer.Area({
            source: new ol.source.Area({
                url: (areaRetrievalUrl + areaType.resource)
            }, map),
            title: areaType.name,
            visible: true,
            zIndex: (AREAS_Z_INDEX_BASE + areaType.z_index)
        }, areaType, map);

        //Add layer to map
        map.addLayer(areaLayer)
    }
}


function addLabelLayersToMap(endpointsObject) {
    // Add label layers to map
    var labelEndpoints = endpointsObject.endpoints;
    for (var i = 0; i < labelEndpoints.length; i++) {
        var labelName = labelEndpoints[i];
        var labelEndpointUrl = labelRetrievalUrl + endpointsObject.pathPrefix + "/" + labelName;
        var isLayerVisible = (labelName === "citynames");

        //Create new label layer
        var labelLayer = new ol.layer.Label({
            source: new ol.source.Label({
                url: labelEndpointUrl
            }),
            style: null,
            title: labelName,
            visible: isLayerVisible,
            zIndex: LABEL_Z_INDEX
        });

        //Add layer to map
        map.addLayer(labelLayer);
    }
}


function httpGET(url, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
            callback(xmlHttp.responseText);
    };
    xmlHttp.open("GET", url, true); // true for asynchronous
    xmlHttp.send(null);
}
