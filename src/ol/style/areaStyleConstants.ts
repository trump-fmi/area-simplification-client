/**
 * This file defines style constants that might be used as building blocks for area styles.
 */
namespace ol.style {

    const POLYGON_POINTS_RADIUS = 5;
    const POLYGON_POINTS_FILL_COLOR = 'orange';

    /**
     * Style for points that are part of an area polygon.
     */
    export const STYLE_AREA_POLYGON_POINTS = new ol.style.Style({
        image: new ol.style.Circle({
            radius: POLYGON_POINTS_RADIUS,
            fill: new ol.style.Fill({
                color: POLYGON_POINTS_FILL_COLOR
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