namespace ol.style {

    //Mapping from area type sources to single styles, style lists or StyleFunctions
    const AREA_STYLES_MAPPING = new TypedMap<string, ol.style.Style | Array<ol.style.Style> | StyleFunction>([
        ["districts", STYLE_TOWNS],
        ["towns", STYLE_TOWNS],
        ["villages", STYLE_TOWNS],
        ["woodland", STYLE_WOODLAND],
        ["farmland", STYLE_FARMLAND],
        ["water", STYLE_WATER],
        ["commercial", STYLE_COMMERCIAL],
        ["military", STYLE_MILITARY],
        ["residential", STYLE_RESIDENTIAL],
        ["buildings", STYLE_BUILDINGS],
        ["motorways", STYLE_MOTORWAYS],
        ["main_streets", STYLE_MAIN_STREETS],
        ["bystreets", STYLE_BYSTREETS],
        ["railways", STYLE_RAILWAYS]
    ]);

    /**
     * Returns a StyleFunction for a certain area type which returns an array of styles
     * that may be used for rendering a given feature at a certain resolution.
     */
    export function areaStyleFunction(areaType: AreaType): StyleFunction {

        //Get style object from map for this area type
        const MAPPED_STYLE_OBJECT = AREA_STYLES_MAPPING.get(areaType.resource) || [];

        /**
         * Returns an array of styles for the given area type.
         *
         * @param feature The feature to return the styles for
         * @param resolution The resolution to use
         */
        return (feature: Feature, resolution: number) => {
            //Holds the list of styles that is finally returned
            let finalStyles: Array<ol.style.Style> = [];

            //Check if mapped style object is a single style, an array of styles or a StyleFunction
            if (MAPPED_STYLE_OBJECT instanceof ol.style.Style) {
                //Single style
                finalStyles.push(MAPPED_STYLE_OBJECT);
            } else if (MAPPED_STYLE_OBJECT instanceof Array) {
                //Array of styles
                MAPPED_STYLE_OBJECT.forEach(style => finalStyles.push(style));
            } else if (typeof MAPPED_STYLE_OBJECT === 'function') {
                //StyleFunction, so call it
                let generatedStyles = MAPPED_STYLE_OBJECT(feature, resolution);

                //Check if StyleFunction returned a single style or a style array
                if (generatedStyles instanceof ol.style.Style) {
                    //Single style, push to list
                    finalStyles.push(generatedStyles);
                } else if (generatedStyles instanceof Array) {
                    //Array, push all elements to list
                    generatedStyles.forEach(style => finalStyles.push(style));
                }
            }

            //Add additional highlight style if highlighting is enabled for this feature
            if (feature.get('highlight')) {
                return finalStyles.concat([STYLE_OTHER_HIGHLIGHT]);
            }

            return finalStyles;
        };
    }
}
