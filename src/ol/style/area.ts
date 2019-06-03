namespace ol {

    /**
     * Instances of this class represent areas, consisting out of a polygon, that may be displayed
     * within the area layer of a map. All area objects provide a render method which returns the style
     * that is supposed to be used for this area object.
     */
    export class Area {
        //TODO use
        //Map (area type -> style) of styles for different area types
        private static typeStyles = new TypedMap<string, ol.style.Style>();

        private feature: Feature;

        /**
         * Creates a new area object from a feature and a resolution.
         *
         * @param feature The feature to create the area object from
         * @param resolution The resolution to use
         */
        constructor(feature: Feature, resolution: number) {
            // Get needed fields from feature object
            this.feature = feature;
        }

        /**
         * Returns an array of styles that is supposed to be used for the rendering of this area object.
         */
        public render(): ol.style.Style[] {
            //Create empty array for styles
            var styles: ol.style.Style[] = [];

            var polygonStyle = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'blue',
                    width: 3
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 255, 0.6)'
                })
            });

            styles.push(polygonStyle);
            styles.push(ol.style.STYLE_AREA_POLYGON_POINTS);

            return styles;
        }
    }
}