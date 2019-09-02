/**
 * This file defines style constants that might be used as building blocks for area styles.
 */

namespace ol.style {
    /**
     * Internal style template for water areas.
     */
    const STYLE_WATER_AREA_TEMPLATE = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(44, 2, 196, 0.8)'
        })
    });

    /**
     * Internal style template for water lines.
     */
    const STYLE_WATER_LINE_TEMPLATE = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(44, 2, 196, 0.8)',
            width: 5
        }),
    });

    const STYLE_WOODLAND_TEMPLATE = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#248c26',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: 'rgba(41, 163, 43, 0.6)'
        })
        /*
        , text: new ol.style.Text({
            font: 'bold 14px "Open Sans", "Arial Unicode MS", "sans-serif"',
            placement: 'point',
            stroke: new ol.style.Stroke({
                color: 'black',
                width: 2
            }),
            fill: new Fill({
                color: 'white'
            }),
            rotateWithView: true
        })*/
    });

    /**
     * Style for town borders.
     */
    export const STYLE_STATES = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#d1352a',
            width: 4
        })
    });

    /**
     * Style for town borders.
     */
    export const STYLE_TOWNS = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#a34905',
            width: 3
        })
    });

    /**
     * StyleFunction for woodland.
     * @param feature The feature to style
     * @param resolution Current resolution (meters/pixel)
     */
    export const STYLE_WOODLAND = function (feature: Feature, resolution: number) {
        //Get label name for this feature and sanitize it
        let labelName = feature.get('name') || "";

        //Adjust style template accordingly
        STYLE_WOODLAND_TEMPLATE.getText().setText(labelName);

        return STYLE_WOODLAND_TEMPLATE;
    };

    /**
     * Style for farmland.
     */
    export const STYLE_FARMLAND = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#b5b540',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: 'rgba(204, 204, 110, 0.6)'
        })
    });

    /**
     * StyleFunction for water (lakes, rivers, ...).
     * @param feature The feature to style
     * @param resolution Current resolution (meters/pixel)
     */
    export const STYLE_WATER = function (feature: Feature, resolution: number) {
        //Width of rivers in meters
        const DEFAULT_RIVER_WIDTH = 18;

        let geomType = feature.getGeometry().getType();

        //Decide whether to use the line or the area template
        if ((geomType === "LineString") || (geomType === "MultiLineString")) {
            //Use the line template and determine river width
            let riverWidth = feature.get("width") || DEFAULT_RIVER_WIDTH;

            //Update line template accordingly
            const pixelWidth = riverWidth / resolution;
            STYLE_WATER_LINE_TEMPLATE.getStroke().setWidth(pixelWidth);

            return STYLE_WATER_LINE_TEMPLATE;
        }

        //Use the area template
        return STYLE_WATER_AREA_TEMPLATE;
    };

    /**
     * Style for commercial landuse.
     */
    export const STYLE_COMMERCIAL = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgb(238, 206, 209)'
        })
    });

    /**
     * Style for military landuse.
     */
    export const STYLE_MILITARY = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(209, 10, 19, 0.6)'
        })
    });

    /**
     * Style for residential landuse.
     */
    export const STYLE_RESIDENTIAL = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgb(218, 218, 218)'
        })
    });

    /**
     * Style for buildings.
     */
    export const STYLE_BUILDINGS = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#69523f',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: 'rgba(163, 130, 102, 1)'
        })
    });

    /**
     * Style for motorways.
     */
    export const STYLE_MOTORWAYS = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#E990A0',
            width: 7
        })
    });

    /**
     * Style for main streets.
     */
    export const STYLE_MAIN_STREETS = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#F6FABB',
            width: 6
        })
    });

    /**
     * Style for bystreets.
     */
    export const STYLE_BYSTREETS = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#FFFFFF',
            width: 4
        })
    });

    /**
     * Style for railways.
     */
    export const STYLE_RAILWAYS =
        [new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: [0, 0, 0, 1.0],
                width: 4
            })
        }),
            // Dash white lines (second style, on the top)
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: [255, 255, 255, 1.0],
                    width: 4,
                    lineDash: [10, 20, 10, 20]
                })
            })
        ];

    /**
     * Style for highlighting certain areas.
     */
    export const STYLE_OTHER_HIGHLIGHT = new ol.style.Style({
        /*
        fill: new ol.style.Fill({
            color: 'rgba(235, 155, 52, 0.6)'
        })*/
        stroke: new ol.style.Stroke({
            color: 'red',
            width: 5
        }),
        zIndex: 999999
    });

    /**
     * Style for points that of an area polygon. May be helpful for debugging, should not be used
     * in productive environments however.
     */
    export const STYLE_OTHER_POLYGON_POINTS = new ol.style.Style({
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
