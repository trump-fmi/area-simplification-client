/**
 * This file defines style constants that might be used as building blocks for area styles.
 */
namespace ol.style {

    /**
     * Style for town borders.
     */
    export const STYLE_AREA_STATES = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgb(209, 53, 42)',
            width: 3
        })
    });

    /**
     * Style for town borders.
     */
    export const STYLE_AREA_TOWNS = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'blue',
            width: 2
        })
    });

    /**
     * Style for woodland.
     */
    export const STYLE_AREA_WOODLAND = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#248c26',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: 'rgba(41, 163, 43, 0.6)'
        })
    });

    /**
     * Style for points that of an area polygon. May be helpful for debugging, should not be used
     * in productive environments however.
     */
    export const STYLE_AREA_POLYGON_POINTS = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({
                color: 'orange'
            })
        }),
        geometry: function (feature: Feature) {
            //Get geometry of feature
            var geometry = feature.getGeometry();

            //Check whether geometry is polygon or multi polygon
            if (geometry instanceof ol.geom.Polygon) {
                //Return all points of the polygon so that points can be drawn
                var polygon = <ol.geom.Polygon>geometry;
                return new ol.geom.MultiPoint(polygon.getCoordinates()[0]);
            } else if (geometry instanceof ol.geom.MultiPolygon) {
                var multiPolygon = <ol.geom.MultiPolygon>geometry;
                var coordinates = multiPolygon.getCoordinates();

                //List for all found coordinates of the multi polygon
                var coordinatesList: ol.Coordinate[] = [];

                //Iterate over all available coordinates
                for (var i = 0; i < coordinates.length; i++) {
                    for (var k = 0; k < coordinates[i][0].length; k++) {
                        //Add current coordinate to list
                        coordinatesList.push(coordinates[i][0][k]);
                    }

                }

                //Return all coordinates of the multi polygon so that points can be drawn
                return new ol.geom.MultiPoint(coordinatesList);
            }
        }
    });
}