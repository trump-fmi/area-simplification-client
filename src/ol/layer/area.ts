namespace ol.layer {
    //Base z-index for layers holding the area arc labels
    const LABEL_LAYER_Z_INDEX = 1000;

    /**
     * Instances of this class represent area layers that are used for displaying areas of a certain type on the map,
     * given as GeoJSON features. The layer will automatically be hidden if the current map zoom
     * is no longer within the zoom range of the area type it represents.
     */
    export class Area extends ZoomAware {

        //Internal fields
        private readonly labelLayer: ol.layer.AreaLabel;
        private readonly _hasLabels: boolean;

        //Exposed fields
        private readonly areaType: AreaType;
        private highlightLocation: ol.Coordinate;

        /**
         * Creates a new layer for displaying areas on the map by passing a vector layer option object,
         * an area type and a map instance.
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

            //Get zoom range from area type
            let minZoom = areaType.zoom_min;
            let maxZoom = areaType.zoom_max;

            //Set default options (if necessary) and call vector layer constructor
            super(options, map, minZoom, maxZoom);

            this.areaType = areaType;

            //Check if labels are desired for this area type
            if (this.areaType.labels) {
                this._hasLabels = true;

                //Create label layer and add it to the map
                this.labelLayer = new ol.layer.AreaLabel({
                    source: new ol.source.Vector(),
                    zIndex: this.areaType.z_index + LABEL_LAYER_Z_INDEX
                }, areaType.labels, map);

                //Add label layer to map
                map.addLayer(this.labelLayer);
            } else {
                this._hasLabels = false;
            }

            //No highlighting yet
            this.highlightLocation = null;

            //Save reference to current scope
            let _this = this;

            //Check if area source is used
            if (!(this.getSource() instanceof ol.source.Area)) {
                return;
            }

            //Cast to area source
            let source = <ol.source.Area>this.getSource();

            //Register a feature listener
            source.addFeatureListener(function (feature: Feature) {
                _this.checkFeatureForHighlight(feature);
                _this.createLabelForFeature(feature);
            });
        }

        /**
         * Returns whether labels are associated with this layer.
         * @return True, if labels are associated; false otherwise
         */
        get hasLabels(): boolean {
            return this._hasLabels;
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
         * Creates a label feature for a given area feature and adds it to the dedicated label layer.
         * @param feature The area feature to create a label for
         */
        private createLabelForFeature(feature: Feature): void {
            //Return if labels are not desired for this area type
            if (!this.hasLabels) {
                return;
            }

            //Add arc label to label layer
            this.labelLayer.addLabelForFeature(feature);
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