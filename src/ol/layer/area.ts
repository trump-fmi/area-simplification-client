namespace ol.layer {

    /**
     * Instances of this class represent area layers that are used for displaying areas of a certain type on the map,
     * given as GeoJSON features. The layer will automatically be hidden if the current map zoom
     * is no longer within the zoom range of the area type it represents.
     */
    export class Area extends ol.layer.Vector {

        private readonly areaType: AreaType;
        private readonly map: ol.Map;

        private highlightLocation: ol.Coordinate;

        private _displayIntention: boolean;

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
            options.declutter = true;

            //Set default options (if necessary) and call vector layer constructor
            super(options);

            this.areaType = areaType;
            this.map = map;
            this._displayIntention = true;

            //No highlighting yet
            this.highlightLocation = null;

            //Save reference to current scope
            let _this = this;

            //Register move end event handler on map in order to check for the zoom level
            this.map.on('moveend', function (event) {
                _this.updateVisibility();
            });

            //Check if area source is used
            if (!(this.getSource() instanceof ol.source.Area)) {
                return;
            }

            //Cast to area source
            let source = <ol.source.Area>this.getSource();

            //Register a feature listener
            source.addFeatureListener(function (feature: Feature) {
                _this.checkFeatureForHighlight(feature);
            });
        }

        /**
         * Checks the zoom level and displayIntention property in order to determine whether the layer should
         * be visible or not and updates its visibility subsequently.
         */
        private updateVisibility(): void {
            //Get current zoom level
            let zoomLevel = this.map.getView().getZoom();

            //Hide layer if not within desired zoom range or not supposed to be displayed, otherwise show it
            this.setVisible((zoomLevel >= this.areaType.zoom_min)
                && (zoomLevel < this.areaType.zoom_max)
                && this._displayIntention);
        }

        /**
         * Highlights features of this layer at a certain location in case the layer allows highlighting.
         * @param location The location where the features are supposed to be highlighted
         */
        public highlightFeaturesAt(location: ol.Coordinate) {
            //Check if highlighting is allowed
            if (!this.areaType.search_highlight) {
                return;
            }

            this.highlightLocation = location;

            //Save reference to current scope
            let _this = this;

            //Get source of layer
            let source = this.getSource();

            //Iterate over all features of the layer
            source.getFeatures().forEach(function (feature: ol.Feature) {
                _this.checkFeatureForHighlight(feature);
            });
        }

        /**
         * Inverts whether the layer is supposed to be displayed in case the zoom level of the map
         * is within the zoom range of the area type.
         */
        public invertDisplayIntention() {
            this.displayIntention = !this.displayIntention;
        }

        /**
         * Returns whether the layer is supposed to be displayed in case the zoom level of the map
         * is within the zoom range of the area type.
         */
        public get displayIntention(): boolean {
            return this._displayIntention;
        }

        /**
         * Sets whether the layer is supposed to be displayed in case the zoom level of the map
         * is within the zoom range of the area type. Subsequently, the visibility of the layer is updated.
         * @param value True, if the layer is supposed to be displayed; false otherwise
         */
        public set displayIntention(value: boolean) {
            this._displayIntention = value;

            //Display/hide layer if necessary
            this.updateVisibility();
        }

        /**
         * Checks if a certain feature is supposed to be highlighted or not and updates its highlight flag
         * accordingly.
         * @param feature The feature to check
         */
        private checkFeatureForHighlight(feature: Feature) {
            //Sanity check
            if ((this.highlightLocation == null) || (feature == null)) {
                return;
            }

            //Get geometry of feature
            let geometry = feature.getGeometry();

            //Check if highlight location is within the feature geometry
            if (geometry.intersectsCoordinate(this.highlightLocation)) {
                //Flag for highlighting
                feature.set('highlight', true);
            } else {
                //Unflag for highlighting
                feature.unset('highlight');
            }
        }
    }
}