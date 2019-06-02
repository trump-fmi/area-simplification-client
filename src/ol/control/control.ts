namespace ol.control {
    /**
     * Set of controls included in maps by default. Unless configured otherwise,
     * this returns a collection containing an instance of each of the following
     * controls:
     * * {@link ol.control.Zoom}
     * * {@link ol.control.Rotate}
     * * {@link ol.control.Attribution}
     *
     * @param opt_options Defaults options.
     * @return Controls.
     * @api stable
     */
    function defaults(opt_options?: olx.control.DefaultsOptions): ol.Collection<Control> {
        var controls = new ol.Collection<Control>();

        var zoomControl = opt_options.zoom !== undefined ? opt_options.zoom : true;
        if (zoomControl) {
            controls.push(new ol.control.Zoom(opt_options.zoomOptions));
        }

        var rotateControl = opt_options.rotate !== undefined ? opt_options.rotate : true;
        if (rotateControl) {
            controls.push(new ol.control.Rotate(opt_options.rotateOptions));
        }

        var attributionControl = opt_options.attribution !== undefined ?
            opt_options.attribution : true;
        if (attributionControl) {
            controls.push(new ol.control.Attribution(opt_options.attributionOptions));
        }

        return controls;
    }
}

