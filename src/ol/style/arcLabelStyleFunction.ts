namespace ol.style {

    //Basic style to use for arc labels
    const ARC_LABEL_STYLE = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'darkgreen',
            width: 5
        }),
        text: new ol.style.Text({
            font: 'bold 18px "Open Sans", "Arial Unicode MS", "sans-serif"',
            placement: 'line',
            stroke: new ol.style.Stroke({
                color: 'black',
                width: 2
            }),
            fill: new ol.style.Fill({
                color: 'white'
            }),
            rotateWithView: true,
            text: ''
        })
    });

    //Empty style which does not do anything
    const EMPTY_STYLE = new ol.style.Style({});

    /**
     * StyleFunction that returns the style to use for a certain arc label at a certain resolution.
     *
     * @param feature The feature to return the styles for
     * @param resolution The resolution to use
     */
    export function arcLabelStyleFunction(feature: Feature, resolution: number): ol.style.Style {
        //Get label name for this feature
        let labelName = feature.get('name') || "";

        //Check name for validity
        if (labelName.trim().length < 2) {
            return EMPTY_STYLE;
        }

        //Get style text object
        let textObject = ARC_LABEL_STYLE.getText();

        //Sanity check
        if (textObject == null) {
            return EMPTY_STYLE;
        }

        //Set style text
        textObject.setText(labelName);

        return ARC_LABEL_STYLE;
    }
}
