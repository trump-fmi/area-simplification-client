//Debug enabled?
const DEBUG = window.location.hash.toLowerCase() === "#debug";

const labelServerUrl = "http://" + (DEBUG ? "seeigel.informatik.uni-stuttgart.de" : window.location.host);
const labelServerPort = "8080";
const tileServerUrl = "http://" + (DEBUG ? "seeigel.informatik.uni-stuttgart.de" : window.location.host);
const tileServerPort = "80";
const tileEndpointsPort = "8081";

const labelCollectionUrl = labelServerUrl + ":" + labelServerPort + "/labelCollections";
const tileEndpointsUrl = tileServerUrl + ":" + tileEndpointsPort;

//TODO configure area server URI
const areaServerUrl = "http://localhost:8080";
const areaUrlPrefix = "/area/countries";

var map = new ol.Map({
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
    layers: [],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([9.180769, 48.777106]),
        zoom: 12
    })
});

// add controls
map.addControl(new ol.control.ZoomSlider());
map.addControl(new ol.control.DebugMenu());
map.addControl(new ol.control.LayerMenu());

// Get tile endpoints
httpGET(tileEndpointsUrl, function (response) {
    var tileEndpointsJSON = JSON.parse(response);
    addTileLayersToMap(tileEndpointsJSON);
});

addAreaLayersToMap();

// Get label endpoints
httpGET(labelCollectionUrl, function (response) {
    var labelEndpointsJSON = JSON.parse(response);
    addLabelLayersToMap(labelEndpointsJSON);
});

function addTileLayersToMap(tileEndpoints) {
    // Add tile layers to map
    for (var i = 0; i < tileEndpoints.length; i++) {
        var tileEndpoint = tileEndpoints[i];
        var tileEndpointUrl = tileServerUrl + ":" + tileServerPort + tileEndpoint.uri + "{z}/{x}/{y}.png";
        var isLayerVisible = (tileEndpoint.name === "default");
        map.addLayer(
            new ol.layer.Tile({
                source: new ol.source.OSM({
                    url: tileEndpointUrl
                }),
                title: tileEndpoint.name,
                description: tileEndpoint.description,
                preload: 5,
                visible: isLayerVisible
            })
        );
    }
}

function addAreaLayersToMap(){
    //TODO parse API when it exists
    map.addLayer(new ol.layer.Area({
        source: new ol.source.Area({
            url: areaServerUrl + areaUrlPrefix
        }, map),
        title: "areas",
        visible: true
    }));
}

function addLabelLayersToMap(endpoints) {
    // Add label layers to map
    var labelEndpoints = endpoints.endpoints;
    for (var i = 0; i < labelEndpoints.length; i++) {
        var labelName = labelEndpoints[i];
        var labelEndpointUrl = labelServerUrl + ":" + labelServerPort + "/" + endpoints.pathPrefix + "/" + labelName;
        var isLayerVisible = (labelName === "citynames");
        map.addLayer(
            new ol.layer.Label({
                source: new ol.source.Label({
                    url: labelEndpointUrl
                }),
                style: null,
                title: labelName,
                visible: isLayerVisible
            })
        );
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
