namespace ol.layer {
    export class Label extends ol.layer.Vector {
        constructor(opt_options: olx.layer.VectorOptions) {
            if (!opt_options.style) {
                opt_options.style = ol.style.labelStyle
            }

            // If no preferred options for update while animating or interacting are given, set them as default to true
            if (opt_options.updateWhileAnimating === undefined) {
                opt_options.updateWhileAnimating = true;
            }
            if (opt_options.updateWhileInteracting === undefined) {
                opt_options.updateWhileInteracting = true;
            }

            super(opt_options);
        }
    }
}