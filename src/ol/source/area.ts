namespace ol.source {


    /**
     * Objects of this class represent sources that are able to load FeatureCollections describing
     * certain areas from an area server.
     */
    export class Area extends Vector {

        private readonly areaServerUrl: string;
        private readonly featureLoader: ol.FeatureUrlFunction;
        private readonly featureListeners: Array<Function>;

        private readonly map: ol.Map;


        /**
         * Creates a new area source by passing a options object and a map instance to which the source belongs.
         *
         * @param org_options The options object
         * @param map The map instance for which the source is used
         */
        constructor(org_options: olx.source.VectorOptions, map: ol.Map) {
            //Read url of the area server and create feature loader from it
            var areaServerUrl: string = org_options.url.toString();
            var featureLoader: ol.FeatureUrlFunction = Area.createFeatureLoader(areaServerUrl, map);

            //Overwrite required options
            org_options.format = new ol.format.GeoJSON();

            var oldZoom = 0;
            org_options.strategy = function (extent: Extent, resolution: number) {
                var currentZoom = _this.map.getView().getZoom();
                if (Math.abs(oldZoom - currentZoom) > 0.2) {
                    // @ts-ignore
                    _this.loadedExtentsRtree_.clear();
                    oldZoom = currentZoom;
                }
                return [extent];
            };
            org_options.url = featureLoader;

            super(org_options);

            var _this = this;

            //Set internal fields
            this.areaServerUrl = areaServerUrl;
            this.featureLoader = featureLoader;
            this.featureListeners = new Array<Function>();
            this.map = map;
        }

        /**
         * Registers a callback function at the source that is called in case a new feature is added.
         * @param callback Callback function that is supposed to be called
         */
        public addFeatureListener(callback: Function) {
            this.featureListeners.push(callback);
        }

        /**
         * Overrides the addFeature function of the parent class and extends its functionality.
         * This function considers whether the new features that are passed is an updated version of a feature that
         * is already part of the internal id index by comparing the numbers of coordinates that belong to each
         * feature's geometry. If this is the case, the old version is removed from to map so that OL will draw
         * the new version instead. This can be considered as a workaround in order to bypass
         * the naive id comparison of features.
         *
         * @param features An array of features that are supposed to be added to the map
         */
        public addFeatures(features: Feature[]) {
            //Iterate over all passed features
            for (var i = 0; i < features.length; i++) {
                //Get current feature and the corresponding old version that is already part of the layer
                var newFeature = features[i];
                var oldFeature = this.getFeatureById(newFeature.getId());

                //Notify listeners
                this.notifyFeatureListeners(newFeature);

                //Check if old version of the feature exists
                if (oldFeature == null) {
                    continue;
                }

                //Retrieve geometry of both features
                var newPolygon = <ol.geom.Polygon>newFeature.getGeometry();
                var oldPolygon = <ol.geom.Polygon>oldFeature.getGeometry();

                //Get number of coordinates of each feature version
                var newCoordNumber = newPolygon.getCoordinates()[0].length;
                var oldCoordNumber = oldPolygon.getCoordinates()[0].length;

                //Compare coordinate numbers
                if (newCoordNumber != oldCoordNumber) {
                    //New feature is an updated version, thus remove old version from index
                    this.removeFeature(oldFeature);
                }
            }

            //Finally proceed as usual
            return super.addFeatures(features);
        }

        /**
         * Creates and returns a feature loader object for this source by taking the URL of the desired area server
         * and a map instance. The feature loader may then be used for loading the features from the area server.
         *
         * @param areaServerUrl The URL of the label server to use
         * @param map The map instance for which the source is used
         */
        private static createFeatureLoader(areaServerUrl: string, map: ol.Map): ol.FeatureUrlFunction {
            //Define feature loader
            let featureLoader: ol.FeatureUrlFunction =
                (extent: ol.Extent, resolution: number, projection: ol.proj.Projection) => {
                    //Split extend in order to get min and max coordinates
                    var min = ol.proj.toLonLat(<ol.Coordinate>extent.slice(0, 2));
                    var max = ol.proj.toLonLat(<ol.Coordinate>extent.slice(2, 4));

                    //Get current zoom from map
                    var zoom = map.getView().getZoom();

                    //Create parameters object for server request
                    var parameters = {
                        x_min: min[0],
                        x_max: max[0],
                        y_min: min[1],
                        y_max: max[1],
                        zoom: zoom
                    };

                    //Build query and return it
                    return Area.buildQuery(areaServerUrl, parameters);
                };


            return featureLoader;
        }

        /**
         * Builds a query string that may be used for retrieving areas at a certain map section from an area server.
         * The query consists out of the URL of the desired area server and a list of query string parameters
         * that are passed to this function as parameter object.
         *
         * @param areaServerUrl The URL of the area server to use
         * @param params An object whose fields represent the parameters to be used in the query
         */
        private static buildQuery(areaServerUrl: string, params: any): string {
            //Make sure params is an object
            if (typeof params !== 'object') {
                params = {};
            }

            //Start building the query
            var parametersString = '?';
            var first = true;

            //Iterate over all fields of the parameters object
            for (var property in params) {
                //Sanity check for each field
                if (!params.hasOwnProperty(property)) {
                    continue;
                }

                //Read parameter
                var param = property;
                var value = params[property];

                //Add separator depending on whether the current parameter is the first one
                if (first) {
                    parametersString += param + '=' + value;
                } else {
                    parametersString += '&' + param + '=' + value;
                }
                first = false;
            }

            //Return full URL
            return areaServerUrl + parametersString;
        }

        /**
         * Notifies all feature listeners about the addition of a new feature.
         * @param feature The feature that is added
         */
        private notifyFeatureListeners(feature: Feature) {
            this.featureListeners.forEach(function (callback) {
                callback(feature);
            });
        }
    }
}
