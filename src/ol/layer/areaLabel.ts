namespace ol.layer {

    /*
    Defines the structure of label option objects
     */
    interface LabelOptions {
        "arced": boolean,
        "zoom_min": number,
        "zoom_max": number
    }

    /**
     * Instances of this class represent layer that are used for displaying labels of different kind
     * of a certain area type on the map. The layer will automatically be hidden if the current map zoom
     * is no longer within a defined range.
     */
    export class AreaLabel extends ZoomAware {

        private readonly labelOptions: LabelOptions;

        /**
         * Creates a new layer for displaying arc labels on the map by passing a vector layer option object,
         * an label option object and a map instance.
         *
         * @param options An object of options to use within this layer
         * @param labelOptions The label-related options for this layer
         * @param map The map instance for which the layer is used
         */
        constructor(options: olx.layer.VectorOptions, labelOptions: LabelOptions, map: ol.Map) {
            //If certain options were not set then provide a default value for them
            options.style = options.style || ol.style.arcLabelStyleFunction;
            options.updateWhileAnimating = options.updateWhileAnimating || false;
            options.updateWhileInteracting = options.updateWhileInteracting || false;
            options.renderMode = options.renderMode || 'vector';
            options.source = options.source || new source.Vector();

            //No decluttering as it would hide labels randomly
            options.declutter = false;

            //Get zoom range from area type
            let minZoom = labelOptions.zoom_min;
            let maxZoom = labelOptions.zoom_max;

            //Set default options (if necessary) and call vector layer constructor
            super(options, map, minZoom, maxZoom);

            this.labelOptions = labelOptions;
        }

        public addLabelForFeature(feature: Feature): void {
            let labelText = feature.get("label") || "";
            labelText = labelText.trim();
            if (labelText.length < 2) {
                return;
            }

            let circleCentre = feature.get("label_center");
            let innerRadius = feature.get("inner_radius");
            let outerRadius = feature.get("outer_radius");
            let startAngle = feature.get("start_angle");
            let endAngle = feature.get("end_angle");

            let featureId = feature.getId();

            let guideRadius = (innerRadius + outerRadius) / 2;
            let guideArcLineString = new ol.geom.ArcLineString(circleCentre, guideRadius, startAngle, endAngle);
            let guideArcLabelFeature = new ol.Feature(guideArcLineString);
            guideArcLabelFeature.set("arc_height", outerRadius - innerRadius);
            guideArcLabelFeature.set("text", labelText);
            guideArcLabelFeature.setId(featureId + "_label_guide");

            let innerArcLineString = new ol.geom.ArcLineString(circleCentre, innerRadius, startAngle, endAngle);
            let outerArcLineString = new ol.geom.ArcLineString(circleCentre, outerRadius, startAngle, endAngle);
            let leftClosingLine = new ol.geom.LineString([circleCentre, outerArcLineString.getFirstCoordinate()]);
            let rightClosingLine = new ol.geom.LineString([circleCentre, outerArcLineString.getLastCoordinate()]);

            let boundaryGeometry = new ol.geom.GeometryCollection([innerArcLineString, outerArcLineString, leftClosingLine, rightClosingLine]);
            let boundaryFeature = new ol.Feature(boundaryGeometry);
            boundaryFeature.setId(featureId + "_label_boundary");

            //Get source of this layer
            let layerSource = this.getSource();

            //Add guide and boundary features
            layerSource.addFeatures([guideArcLabelFeature, boundaryFeature]);
        }
    }
}