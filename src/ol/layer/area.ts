namespace ol.layer {

    /**
     * Instances of this class represent area layers that are used for displaying areas of a certain type on the map,
     * given as GeoJSON features. The layer will automatically be hidden if the current map zoom
     * is no longer within the zoom range of the area type it represents.
     */
    export class Area extends ol.layer.Vector {

        private readonly areaType: AreaType;
        private readonly map: ol.Map;

        private _wantDisplay: boolean;

        /**
         * Creates a new layer for displaying areas on the map by passing an option object.
         *
         * @param options An object of options to use within this layer
         * @param areaType The area type that is represented by this layer
         * @param map The map instance for which the layer is used

         */
        constructor(options: olx.layer.VectorOptions, areaType: AreaType, map: ol.Map) {
            //If certain options were not set then provide a default value for them
            options.style = options.style || ol.style.areaStyleFunction(areaType);
            options.updateWhileAnimating = options.updateWhileAnimating || false;
            options.updateWhileInteracting = options.updateWhileInteracting || false;
            options.renderMode = options.renderMode || 'image'; //'vector' is default

            //Set default options (if necessary) and call vector layer constructor
            super(options);

            this.areaType = areaType;
            this.map = map;
            this._wantDisplay = true;

            //Save reference to current scope
            let _this = this;

            //Register move end event handler on map in order to check for the zoom level
            this.map.on('moveend', function (event) {
                //Get current zoom level
                let zoomLevel = map.getView().getZoom();

                //Hide layer if not within desired zoom range or not supposed to be displayed, otherwise show it
                _this.setVisible((zoomLevel >= areaType.zoom_min)
                    && (zoomLevel < areaType.zoom_max)
                    && _this._wantDisplay);
            });
        }


        /**
         * Returns whether the layer is supposed to be displayed in case the zoom level of the map
         * is within the zoom range of the area type.
         */
        public get wantDisplay(): boolean {
            return this._wantDisplay;
        }

        /**
         * Sets whether the layer is supposed to be displayed in case the zoom level of the map
         * is within the zoom range of the area type.
         * @param value True, if the layer is supposed to be displayed; false otherwise
         */
        public set wantDisplay(value: boolean) {
            this._wantDisplay = value;
        }
    }
}