namespace ol {

    /**
     * Instances of this class represent areas, consisting out of a polygon, that may be displayed
     * within the area layer of a map. All area objects provide a render method which returns the style
     * that is supposed to be used for this area object.
     */
    export class Area {
        private feature: Feature;
        private resolution: number;

        /**
         * Creates a new area object from a feature and a resolution.
         *
         * @param feature The feature to create the area object from
         * @param resolution The resolution to use
         */
        constructor(feature: Feature, resolution: number) {
            // Get needed fields from feature object
            this.feature = feature;
            this.resolution = resolution;
        }

        /**
         * Returns an array of styles that is supposed to be used for the rendering of this area object.
         */
        public render(): ol.style.Style[] {
            //Array for all styles that are supposed to be returned
            var styles: ol.style.Style[] = [];

            //Add desired styles to array
            styles.push(ol.style.STYLE_AREA_BORDERS);
            //styles.push(ol.style.STYLE_AREA_POLYGON_POINTS);

            return styles;
        }
    }
}