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
        geometry: function (feature) {
            //Get polygon coordinates from feature
            var polygon = <geom.Polygon>feature.getGeometry();
            var coordinates = polygon.getCoordinates()[0];

            //Draw points for all coordinates
            return new ol.geom.MultiPoint(coordinates);
        }
    });
}