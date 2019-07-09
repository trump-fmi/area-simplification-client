namespace ol.layer {

    /**
     * Instances of this class represent area layers that are used for displaying areas on the map,
     * given as polygon features.
     */
    export class Area extends ol.layer.Vector {
        /**
         * Creates a new layer for displaying areas on the map by passing an option object.
         *
         * @param opt_options An object of options to use within this layer
         */
        constructor(opt_options: olx.layer.VectorOptions) {
            //If certain options were not set then provide a default value for them
            opt_options.style = opt_options.style || ol.style.areaStyleFunction;
            opt_options.updateWhileAnimating = opt_options.updateWhileAnimating || false;
            opt_options.updateWhileInteracting = opt_options.updateWhileInteracting || false;
            opt_options.renderMode = opt_options.renderMode || 'image'; //'vector' is default

            //Call constructor of vector layer (super class)
            super(opt_options);
        }
    }
}