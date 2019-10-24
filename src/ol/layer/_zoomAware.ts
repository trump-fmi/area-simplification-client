namespace ol.layer {

    /**
     * Instances of this class are vector layers that are aware of zoom levels and thus allow to automatically
     * show and hide the layer depending on the current zoom level.
     */
    export abstract class ZoomAware extends ol.layer.Vector {

        protected _minZoom: number = 0;
        protected _maxZoom: number = Number.POSITIVE_INFINITY;
        private _displayIntention: boolean = true;

        protected readonly map: ol.Map;

        /**
         * Creates a new zoom-aware vector layer by passing layer options, a reference to the map instance to whose
         * zoom level the layer is supposed to be bound and optionally the minimum and maximum zoom levels.
         *
         * @param options An object of options to use within this layer
         * @param map The map instance to use
         * @param minZoom Minimum zoom level (inclusive) at which the layer may be visible
         * @param maxZoom Maximum zoom level (exclusive) at which the layer may be visible
         */
        constructor(options: olx.layer.VectorOptions, map: ol.Map, minZoom?: number, maxZoom?: number) {
            //Call vector layer constructor and pass layer options
            super(options);

            this.map = map;

            //Update zoom range
            if (typeof minZoom !== "undefined") {
                this._minZoom = minZoom;
            }
            if (typeof maxZoom !== "undefined") {
                this._maxZoom = maxZoom;
            }

            let updateFunc = this.updateVisibility.bind(this);

            //Register move end event handler on map in order to check for the zoom level
            this.map.on('moveend', updateFunc);
        }

        /**
         * Inverts whether the layer is supposed to be displayed in case the zoom level of the map
         * is within the provided zoom range.
         */
        public toggleDisplayIntention(): void {
            this._displayIntention = !this._displayIntention;

            //Update visibility if necessary
            this.updateVisibility();
        }

        /**
         * Returns whether the layer is supposed to be visible for a given zoom level.
         * @param zoomLevel THe zoom level to check the visibility for
         */
        public isVisibleAtZoomLevel(zoomLevel: number): boolean {
            //Check display intention and zoom range
            return (zoomLevel >= this.minZoom)
                && (zoomLevel < this.maxZoom)
                && this._displayIntention;
        }

        /**
         * Overrides the corresponding method of the vector layer class. As a result, a call of this method will no
         * longer influence the visibility state of the layer directly. Instead, only the display intention
         * flag is set, while the actual visibility state still depends on the zoom levels.
         *
         * @param visible True, if the layer is supposed to be displayed within the given zoom range; false otherwise
         */
        public setVisible(visible: boolean) {
            this.displayIntention = visible;
        }

        /**
         * Returns whether the layer is currently displayed.
         */
        public isCurrentlyDisplayed() {
            //Get current zoom level
            let zoomLevel = this.map.getView().getZoom();

            //Check visibility
            return this.isVisibleAtZoomLevel(zoomLevel);
        }

        /**
         * Returns whether the layer is supposed to be displayed in case the zoom level of the map
         * is within the provided zoom range.
         *
         * @return True, if the layer is supposed to be displayed within the given zoom range; false otherwise
         */
        get displayIntention(): boolean {
            return this._displayIntention;
        }

        /**
         * Sets whether the layer is supposed to be displayed in case the zoom level of the map
         * is within the provided zoom range.
         *
         * @param display: True, if the layer is supposed to be displayed within the given zoom range; false otherwise
         */
        set displayIntention(display: boolean) {
            this._displayIntention = display;

            //Update visibility if necessary
            this.updateVisibility();
        }

        /**
         * Returns the minimum zoom level (inclusive) at which the layer may be visible.
         * @return The minimum zoom level
         */
        get minZoom(): number {
            return this._minZoom;
        }

        /**
         * Sets the minimum zoom level (inclusive) at which the layer may be visible.
         * @param value The minimum zoom level to set
         */
        set minZoom(value: number) {
            this._minZoom = value;

            //Update visibility if necessary
            this.updateVisibility();
        }

        /**
         * Returns the maximum zoom level (exclusive) at which the layer may be visible.
         * @return The maximum zoom level
         */
        get maxZoom(): number {
            return this._maxZoom;
        }

        /**
         * Sets the maximum zoom level (exclusive) at which the layer may be visible.
         * @param value The maximum zoom level to set
         */
        set maxZoom(value: number) {
            this._maxZoom = value;
        }

        /**
         * Checks the zoom level and displayIntention property in order to determine whether the layer should
         * be visible or not and updates its visibility subsequently.
         */
        private updateVisibility(): void {
            //Get current zoom level
            let zoomLevel = this.map.getView().getZoom();

            let visible = this.isVisibleAtZoomLevel(zoomLevel);

            //Update visibility
            super.setVisible(visible);
        }
    }
}