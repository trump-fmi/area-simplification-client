//Debug enabled?
const DEBUG = window.location.hash.toLowerCase() === "#debug";

const labelServerUrl = "http://" + (DEBUG ? "seeigel.informatik.uni-stuttgart.de" : window.location.host);
const labelServerPort = "8080";
const tileServerUrl = "http://" + (DEBUG ? "seeigel.informatik.uni-stuttgart.de" : window.location.host);
const tileServerPort = "80";
const labelCollectionUrl = labelServerUrl + ":" + labelServerPort + "/labelCollections";

var stuttgartCoords = [
    [48.728393, 9.212838],
    [48.737420, 9.237563],
    [48.744654, 9.244445],
    [48.740113, 9.256788],
    [48.757298, 9.267822],
    [48.753659, 9.280857],
    [48.769963, 9.273356],
    [48.767676, 9.289832],
    [48.776713, 9.300168],
    [48.774874, 9.316648],
    [48.781225, 9.308429],
    [48.783514, 9.292636],
    [48.792566, 9.292669],
    [48.788067, 9.274101],
    [48.796670, 9.271380],
    [48.796719, 9.261671],
    [48.794014, 9.250679],
    [48.800344, 9.254811],
    [48.806698, 9.256843],
    [48.815741, 9.255482],
    [48.825243, 9.243133],
    [48.835641, 9.244519],
    [48.843782, 9.238345],
    [48.850561, 9.244536],
    [48.851470, 9.233543],
    [48.863679, 9.229431],
    [48.869560, 9.218438],
    [48.859616, 9.207436],
    [48.850574, 9.203310],
    [48.851027, 9.193004],
    [48.851026, 9.172391],
    [48.856902, 9.160707],
    [48.862777, 9.151769],
    [48.862320, 9.138712],
    [48.853727, 9.133223],
    [48.850115, 9.144221],
    [48.841972, 9.133236],
    [48.836549, 9.139424],
    [48.827959, 9.139433],
    [48.822970, 9.111281],
    [48.832009, 9.105086],
    [48.836520, 9.092713],
    [48.821133, 9.075574],
    [48.812090, 9.075594],
    [48.807127, 9.087277],
    [48.793101, 9.076323],
    [48.784963, 9.077027],
    [48.781356, 9.087327],
    [48.771855, 9.081171],
    [48.768229, 9.072946],
    [48.761447, 9.072961],
    [48.753767, 9.079837],
    [48.756011, 9.063371],
    [48.750133, 9.063385],
    [48.747848, 9.043502],
    [48.740153, 9.038037],
    [48.738365, 9.054499],
    [48.732493, 9.059313],
    [48.734313, 9.069592],
    [48.727525, 9.064809],
    [48.723396, 9.066104],
    [48.707157, 9.125117],
    [48.708515, 9.125801],
    [48.708070, 9.140202],
    [48.706267, 9.155975],
    [48.703555, 9.168318],
    [48.694945, 9.190256],
    [48.691323, 9.205339],
    [48.691320, 9.219737],
    [48.693126, 9.235508],
    [48.694931, 9.246481],
    [48.699911, 9.244428],
    [48.699462, 9.235513],
    [48.705798, 9.237576],
    [48.709416, 9.244438],
    [48.713492, 9.237583],
    [48.711995, 9.226415]
];

var stuttgartPolygon = [];

for (var i = 0; i < stuttgartCoords.length; i++) {
    var polygonPoints = ol.proj.fromLonLat([stuttgartCoords[i][1], stuttgartCoords[i][0]]);
    stuttgartPolygon.push(polygonPoints);
}


var areaStyles = [
    /* We are using two different styles for the polygons:
     *  - The first style is for the polygons themselves.
     *  - The second style is to draw the vertices of the polygons.
     *    In a custom `geometry` function the vertices of a polygon are
     *    returned as `MultiPoint` geometry, which will be used to render
     *    the style.
     */
    new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'blue',
            width: 3
        }),
        fill: new ol.style.Fill({
            color: 'rgba(0, 0, 255, 0.6)'
        })
    }),
    new ol.style.Style({
        image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({
                color: 'orange'
            })
        }),
        geometry: function (feature) {
            // return the coordinates of the first ring of the polygon
            var coordinates = feature.getGeometry().getCoordinates()[0];
            return new ol.geom.MultiPoint(coordinates);
        }
    })
];

var geojsonObject = {
    'type': 'FeatureCollection',
    'crs': {
        'type': 'name',
        'properties': {
            'name': 'EPSG:3857'
        }
    },
    'features': [{
        'type': 'Feature',
        'geometry': {
            'type': 'Polygon',
            'coordinates': [stuttgartPolygon]
        }
    }]
};

var areaSource = new ol.source.Vector({
    features: (new ol.format.GeoJSON()).readFeatures(geojsonObject)
});

var areaLayer = new ol.layer.Vector({
    source: areaSource,
    style: areaStyles
});


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
map.addControl(new ol.control.LabelDebug());
map.addControl(new ol.control.LayerMenu());

httpGET(labelCollectionUrl, function (response) {
    var endpointsJSON = JSON.parse(response);
    console.log(endpointsJSON);
    addLayersToMap(endpointsJSON);
});

function addLayersToMap(endpoints) {
    // Add tile layers to map
    var tileEndpoints = endpoints.tileEndpoints;
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

    //TODO
    map.addLayer(areaLayer);

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
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true); // true for asynchronous
    xmlHttp.send(null);
}