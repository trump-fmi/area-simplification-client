namespace ol.style {
    /**
     * Returns an array of styles that may be used for rendering a given feature at a certain resolution.
     *
     * @param feature The feature to return the styles for
     * @param resolution The resolution to use
     */
    export function areaStyleFunction(feature: Feature, resolution: number): ol.style.Style[] {
        //Create new area object from parameters
        var area = new ol.Area(feature, resolution);

        //Render area and return resulting styles
        return area.render();
    }
}