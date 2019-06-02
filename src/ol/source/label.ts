namespace ol.source {
    export class Label extends Vector {

        private readonly labelServerUrl: string;
        private readonly featureLoader: ol.FeatureUrlFunction;

        constructor(org_options: olx.source.VectorOptions) {
            //Read url of the label server and create feature loader from it
            var labelServerUrl: string = org_options.url.toString();
            var featureLoader: ol.FeatureUrlFunction = Label.createFeatureLoader(labelServerUrl);

            //TODO: Allow user to set own options here?!
            //Overwrite required options
            org_options.format = new ol.format.GeoJSON();
            org_options.strategy = ol.loadingstrategy.bbox;
            org_options.url = featureLoader;

            super(org_options);

            this.labelServerUrl = labelServerUrl;
            this.featureLoader = featureLoader;
        }

        private static createFeatureLoader(labelServerUrl: string): ol.FeatureUrlFunction {
            let featureLoader: ol.FeatureUrlFunction =
                (extent: ol.Extent, resolution: number, projection: ol.proj.Projection) => {
                    // extent: [minx, miny, maxx, maxy]
                    //ol.proj.toLonLat takes coord-pair, so need to split
                    var min = ol.proj.toLonLat(<ol.Coordinate>extent.slice(0, 2));
                    var max = ol.proj.toLonLat(<ol.Coordinate>extent.slice(2, 4));

                    // Calculate mint_t value for label request
                    var min_t = ol.resolutionToMinT(resolution);

                    var parameters = {
                        x_min: min[0],
                        x_max: max[0],
                        y_min: min[1],
                        y_max: max[1],
                        t_min: min_t
                    };

                    return Label.buildQuery(labelServerUrl, parameters);
                };

            return featureLoader;
        }

        private static buildQuery(labelServerUrl: string, params: any): string {
            if (typeof params !== 'object') {
                params = {};
            }

            var query = '?';
            var first = true;
            for (var property in params) {
                if (!params.hasOwnProperty(property)) {
                    continue;
                }

                var param = property;
                var value = params[property];
                if (first) {
                    query += param + '=' + value;
                } else {
                    query += '&' + param + '=' + value;
                }
                first = false;
            }

            return labelServerUrl + query;
        }
    }
}
