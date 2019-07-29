namespace ol.style {

    //Maps resource names of area types onto arrays of area styles
    const AREA_STYLES_MAPPING = new TypedMap<string, Array<ol.style.Style>>([
        ["states", [STYLE_AREA_STATES]],
        ["towns", [STYLE_AREA_TOWNS]],
        ["rivers", [STYLE_LINE_RIVERS]],
        ["commerical", [STYLE_AREA_COMMERCIAL]],
        ["residential", [STYLE_AREA_RESIDENTIAL]],
        ["woodland", [STYLE_AREA_WOODLAND]]
    ]);

    /**
     * Returns a StyleFunction for a certain area type. This StyleFunction returns an array of styles
     * that may be used for rendering a given feature at a certain resolution.
     */
    export function areaStyleFunction(areaType: AreaType): StyleFunction {

        //Get styles array for this area type from the map
        let mappedStyles = AREA_STYLES_MAPPING.get(areaType.resource) || [];

        /**
         * Returns an array of styles for the given area type.
         *
         * @param feature The feature to return the styles for
         * @param resolution The resolution to use
         */
        return (feature: Feature, resolution: number) => {
            //Get label name for this feature
            let labelName = feature.get('name');

            //Sanitize it
            labelName = labelName || "";

            //Iterate over all mapped styles and update the text accordingly
            for (let i = 0; i < mappedStyles.length; i++) {
                //Get text object of style
                let textObject = mappedStyles[i].getText();

                //Sanity check
                if (!textObject) {
                    continue;
                }

                //Update text
                textObject.setText(labelName);
            }

            return mappedStyles;
        };
    }
}