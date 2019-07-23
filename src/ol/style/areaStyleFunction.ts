namespace ol.style {

    //Maps resource names of area types onto arrays of area styles
    const AREA_STYLES_MAPPING = new TypedMap<string, Array<ol.style.Style>>([
        ["states", [STYLE_AREA_STATES]],
        ["towns", [STYLE_AREA_TOWNS]],
        ["woodland", [STYLE_AREA_WOODLAND]]
    ]);

    /**
     * Returns a StyleFunction for a certain area type. This StyleFunction returns an array of styles
     * that may be used for rendering a given feature at a certain resolution.
     */
    export function areaStyleFunction(areaType: AreaType): StyleFunction {
        /**
         * Returns an array of styles for the given area type.
         *
         * @param feature The feature to return the styles for
         * @param resolution The resolution to use
         */
        let styleFunction = (feature: Feature, resolution: number) => {
            //Get and return styles array for this area type from the map
            return AREA_STYLES_MAPPING.get(areaType.resource);
        };

        return styleFunction;
    }
}